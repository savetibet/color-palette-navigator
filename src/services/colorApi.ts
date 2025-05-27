
const API_BASE_URL = 'http://localhost:3000/api'; // Update with your backend URL

export interface BackendColorData {
  color_id: number;
  name: string | null;
  matching_no: string;
  family: string | null;
  hex: string;
  red: number;
  green: number;
  blue: number;
  lightness: number;
  a_value: number;
  b_value: number;
  is_standard: boolean;
  created_at: string;
}

export interface CreateColorRequest {
  name: string;
  matching_no: string;
  family?: string;
  lightness: number;
  a_value: number;
  b_value: number;
  is_standard?: boolean;
}

export interface SearchColorsRequest {
  name: string;
  limit?: number;
}

class ColorApiService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all colors
  async getAllColors(): Promise<BackendColorData[]> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/colors`);
  }

  // Get color by ID
  async getColorById(id: number): Promise<BackendColorData> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/colors/${id}`);
  }

  // Create new color
  async createColor(colorData: CreateColorRequest): Promise<BackendColorData> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/colors`, {
      method: 'POST',
      body: JSON.stringify(colorData),
    });
  }

  // Update color
  async updateColor(id: number, colorData: Partial<CreateColorRequest>): Promise<BackendColorData> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/colors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(colorData),
    });
  }

  // Delete color
  async deleteColor(id: number): Promise<void> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/colors/${id}`, {
      method: 'DELETE',
    });
  }

  // Search colors by name
  async searchColors(searchParams: SearchColorsRequest): Promise<BackendColorData[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('name', searchParams.name);
    if (searchParams.limit) {
      queryParams.append('limit', searchParams.limit.toString());
    }

    return this.fetchWithErrorHandling(`${API_BASE_URL}/colors/search?${queryParams}`);
  }

  // Get colors by album/family
  async getColorsByFamily(family: string): Promise<BackendColorData[]> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/colors/family/${encodeURIComponent(family)}`);
  }
}

export const colorApiService = new ColorApiService();
