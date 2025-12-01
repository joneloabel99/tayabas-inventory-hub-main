// Directus API Client Configuration
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || '';
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN || '';

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
  private token: string;

  constructor() {
    this.baseURL = DIRECTUS_URL;
    this.token = DIRECTUS_TOKEN;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Directus API Error: ${response.statusText}`);
    }

    return response.json();
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
