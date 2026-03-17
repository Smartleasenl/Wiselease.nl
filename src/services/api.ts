import type {
  SearchParams,
  SearchResponse,
  FiltersResponse,
  ModelOption,
  VehicleDetail,
} from '../types/vehicle';

const API_BASE_URL = 'https://jtntbwioxszeocumgvzk.supabase.co/functions/v1/vehicles';

export const vehicleApi = {
  async search(params: SearchParams): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    const response = await fetch(`${API_BASE_URL}/search?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vehicles');
    }
    return response.json();
  },

  async getFilters(): Promise<FiltersResponse> {
    const response = await fetch(`${API_BASE_URL}/filters`);
    if (!response.ok) {
      throw new Error('Failed to fetch filters');
    }
    return response.json();
  },

  async getModels(merk: string): Promise<ModelOption[]> {
    // Support comma-separated merken
    const response = await fetch(`${API_BASE_URL}/models?merk=${encodeURIComponent(merk)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    return response.json();
  },

  async getModelsMulti(merken: string[]): Promise<ModelOption[]> {
    // Fetch models for multiple brands and combine
    if (merken.length === 0) return [];
    if (merken.length === 1) return this.getModels(merken[0]);

    const results = await Promise.all(
      merken.map((merk) => this.getModels(merk))
    );

    // Combine and sort by model name
    const combined = results.flat();
    combined.sort((a, b) => a.model.localeCompare(b.model));
    return combined;
  },

  async getDetail(id: number): Promise<VehicleDetail> {
    const response = await fetch(`${API_BASE_URL}/detail?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle detail');
    }
    return response.json();
  },
}; 