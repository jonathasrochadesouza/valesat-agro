export interface Field {
  id: number;
  name: string;
  owner: string;
  municipality: string;
  state: string;
  address: string;
  google_maps_url: string;
  description: string;
  area_ha: number;
  perimeter_m: number;
  geojson: any;
  created_at?: string;
}

export interface ScenePass {
  id: string;
  satellite: string;
  collection: string;
  datetime: string;
  cloud_cover: number;
  thumbnail_url?: string;
  assets: Record<string, string>;
  quality_label: string;
}

export interface ZoneDistribution {
  very_high_pct: number;
  high_pct: number;
  moderate_pct: number;
  low_pct: number;
  non_veg_pct: number;
}

export interface RasterStats {
  min: number;
  max: number;
  mean: number;
  std: number;
  cloud_cover_field_pct: number;
  agronomic_status: string;
  histogram: number[];
  histogram_bins: number[];
  zones?: ZoneDistribution | null;
}

export interface ProcessRasterResponse {
  scene_id: string;
  engine: string;
  layer: string;
  image_base64: string;
  bounds: [number, number, number, number]; // [west, south, east, north]
  stats: RasterStats;
  execution_time_ms: number;
  notes?: string;
}

export interface HealthResponse {
  status: string;
  database: string;
  aws_stac: string;
  inpe_stac: string;
  version: string;
}

export interface TimelineDataPoint {
  date: string;
  ndvi: number;
  ndwi: number;
  cloud_cover: number;
}

export interface WeatherCurrent {
  temperature: number;
  apparent_temperature: number;
  humidity: number;
  precipitation_mm: number;
  wind_speed_kmh: number;
  weather_code: number;
  weather_label: string;
  spraying_window: string;
  updated_at: string;
}

export interface WeatherForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  precipitation_sum_mm: number;
  precipitation_probability: number;
  label: string;
}

export interface WeatherResponse {
  municipality: string;
  current: WeatherCurrent;
  forecast: WeatherForecastDay[];
}

export interface PointInspectResponse {
  lat: number;
  lon: number;
  ndvi: number;
  ndwi: number;
  estimated_biomass_t_ha: number;
  zone_class: string;
  diagnostic: string;
  recommendation: string;
}
