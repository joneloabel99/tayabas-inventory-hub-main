// Directus API Client Configuration
const DIRECTUS_URL = import.meta.env.VITE_HRMS_URL || '';
const DIRECTUS_TOKEN = import.meta.env.VITE_SERVICE_TOKEN || '';
import { ROLES } from "@/config/rolePermissions";

export interface DirectusResponse<T> {
  data: T;
}

export interface DirectusListResponse<T> {
  data: T[];
  meta: {
    total_count: number;
    filter_count: number;
  };
}

// A base client for making requests
class BaseDirectusClient {
  protected baseURL: string;

  constructor() {
    this.baseURL = DIRECTUS_URL;
  }

  protected async _request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return Promise.resolve(null as T);
    }

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.errors[0]?.message || `Directus API Error: ${response.statusText}`;
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  }
}

// Client for user-specific actions
class DirectusUserClient extends BaseDirectusClient {
  private token: string | null;
  private refreshToken: string | null;
  private isRefreshing = false;

  constructor() {
    super();
    this.token = localStorage.getItem("directus_access_token");
    this.refreshToken = localStorage.getItem("directus_refresh_token");
  }

  private async _refreshToken(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }
    this.isRefreshing = true;

    try {
      const response: any = await this._request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refresh_token: this.refreshToken,
          mode: 'json',
        }),
      });

      this.token = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      localStorage.setItem("directus_access_token", this.token!);
      localStorage.setItem("directus_refresh_token", this.refreshToken!);
    } catch (error) {
      console.error("Failed to refresh token", error);
      this.logout();
      throw new Error("Session expired. Please log in again.");
    } finally {
      this.isRefreshing = false;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const tokenToSend = endpoint === '/auth/login' ? null : this.token;
      return await this._request(endpoint, options, tokenToSend);
    } catch (error: any) {
      if (error.status === 401 && this.refreshToken) {
        try {
          await this._refreshToken();
          // Retry the original request with the new token
          const tokenToSend = endpoint === '/auth/login' ? null : this.token;
          return await this._request(endpoint, options, tokenToSend);
        } catch (refreshError) {
          throw refreshError;
        }
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<any> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, mode: 'json' }),
    });
    this.token = response.data.access_token;
    this.refreshToken = response.data.refresh_token;
    localStorage.setItem("directus_access_token", this.token!);
    localStorage.setItem("directus_refresh_token", this.refreshToken!);
    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem("directus_access_token");
    localStorage.removeItem("directus_refresh_token");
    return Promise.resolve();
  }

  async getMe(): Promise<any> {
    return this.request('/users/me?fields=*,role.id,role.name');
  }

  async register(email: string, password: string, first_name: string, last_name?: string): Promise<any> {
    const response = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        first_name, 
        last_name,
        role: ROLES.VIEWER,
        created_at: new Date().toISOString(), 
      }),
    });
    return response;
  }

  async createItem<T>(collection: string, data: Partial<T>): Promise<DirectusResponse<T>> {
    return this.request<DirectusResponse<T>>(`/items/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem<T>(collection: string, id: string, data: Partial<T>): Promise<DirectusResponse<T>> {
    const endpoint = collection === 'users' ? `/users/${id}` : `/items/${collection}/${id}`;
    return this.request<DirectusResponse<T>>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(collection: string, id: string): Promise<void> {
    await this.request(`/items/${collection}/${id}`, {
      method: 'DELETE',
    });
  }

  async getItem<T>(collection: string, id: string): Promise<DirectusResponse<T>> {
    const endpoint = collection === 'users' ? `/users/${id}?fields=*` : `/items/${collection}/${id}`;
    return this.request<DirectusResponse<T>>(endpoint);
  }
}

// Client for service-level (admin) actions
class DirectusServiceClient extends BaseDirectusClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this._request(endpoint, options, DIRECTUS_TOKEN);
  }

  async getItems<T>(collection: string, params?: Record<string, any>): Promise<DirectusListResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<DirectusListResponse<T>>(`/items/${collection}${queryString}`);
  }
    
  async getItem<T>(collection: string, id: string): Promise<DirectusResponse<T>> {
    return this.request<DirectusResponse<T>>(`/items/${collection}/${id}`);
  }
  async getAllUsers<T>(params?: Record<string, any>): Promise<DirectusListResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<DirectusListResponse<T>>(`/users${queryString}`);
ag  }

  // New method to update a user in directus_users
  async updateUser<T>(id: string, data: Partial<T>): Promise<DirectusResponse<T>> {
    return this.request<DirectusResponse<T>>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const directus = new DirectusUserClient();
export const directusService = new DirectusServiceClient();