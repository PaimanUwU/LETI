export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number;
}

export interface HeatmapFilters {
  state?: string;
  category?: string;
  type?: string;
  year?: number;
  month?: number;
  limit?: number;
}
