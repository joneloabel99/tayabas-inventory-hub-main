// Directus API Client Configuration
const DIRECTUS_URL = import.meta.env.VITE_HRMS_URL || '';
const DIRECTUS_TOKEN = import.meta.env.VITE_SERVICE_TOKEN || '';

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

class DirectusClient {
  private baseURL: string;
  private token: string | null;
  private refreshToken: string | null;

  constructor() {
    this.baseURL = DIRECTUS_URL;
    this.token = localStorage.getItem("directus_access_token");
    this.refreshToken = localStorage.getItem("directus_refresh_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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
      throw new Error(errorData.errors[0]?.message || `Directus API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<any> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = response.data.access_token;
    this.refreshToken = response.data.refresh_token;
    localStorage.setItem("directus_access_token", this.token!);
    localStorage.setItem("directus_refresh_token", this.refreshToken!);
    return response;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      this.token = null;
      this.refreshToken = null;
      localStorage.removeItem("directus_access_token");
      localStorage.removeItem("directus_refresh_token");
    }
  }

  async getMe(): Promise<any> {
    return this.request('/users/me');
  }

  async register(email: string, password: string, first_name: string, last_name?: string): Promise<any> {
    const response = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, first_name, last_name }),
    });
    return response;
  }

  // Items endpoints
  async getItems<T>(collection: string, params?: Record<string, any>): Promise<DirectusListResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<DirectusListResponse<T>>(`/items/${collection}${queryString}`);
  }

  async getItem<T>(collection: string, id: string): Promise<DirectusResponse<T>> {
    return this.request<DirectusResponse<T>>(`/items/${collection}/${id}`);
  }

  async createItem<T>(collection: string, data: Partial<T>): Promise<DirectusResponse<T>> {
    return this.request<DirectusResponse<T>>(`/items/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem<T>(collection: string, id: string, data: Partial<T>): Promise<DirectusResponse<T>> {
    return this.request<DirectusResponse<T>>(`/items/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(collection: string, id: string): Promise<void> {
    await this.request(`/items/${collection}/${id}`, {
      method: 'DELETE',
    });
  }

  // Aggregation for analytics
  async aggregate(collection: string, aggregation: Record<string, any>): Promise<any> {
    const params = new URLSearchParams({
      aggregate: JSON.stringify(aggregation),
    });
    return this.request(`/items/${collection}?${params}`);
  }
}

export const directus = new DirectusClient();
