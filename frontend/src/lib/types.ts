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

export interface RasterStats {
  min: number;
  max: number;
  mean: number;
  std: number;
  cloud_cover_field_pct: number;
  agronomic_status: string;
  histogram: number[];
  histogram_bins: number[];
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
