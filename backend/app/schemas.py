from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, Field as PField

class FieldBase(BaseModel):
    name: str
    owner: Optional[str] = "Produtor Rural"
    municipality: Optional[str] = "Blumenau"
    state: Optional[str] = "SC"
    address: Optional[str] = ""
    google_maps_url: Optional[str] = ""
    description: Optional[str] = ""
    geojson: dict[str, Any]

class FieldCreate(FieldBase):
    pass

class FieldResponse(FieldBase):
    id: int
    area_ha: float
    perimeter_m: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ScenePass(BaseModel):
    id: str
    satellite: str
    collection: str
    datetime: str
    cloud_cover: float
    thumbnail_url: Optional[str] = None
    assets: dict[str, str] = {}
    quality_label: str = "Excelente"

class ProcessRasterRequest(BaseModel):
    field_id: Optional[int] = None
    geojson: Optional[dict[str, Any]] = None
    scene_id: str
    engine: str = "sentinel-2"
    layer: str = "ndvi"
    assets: Optional[dict[str, str]] = None

class RasterStats(BaseModel):
    min: float
    max: float
    mean: float
    std: float
    cloud_cover_field_pct: float
    agronomic_status: str
    histogram: list[int] = []
    histogram_bins: list[float] = []

class ProcessRasterResponse(BaseModel):
    scene_id: str
    engine: str
    layer: str
    image_base64: str
    bounds: list[float]
    stats: RasterStats
    execution_time_ms: float
    notes: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    database: str
    aws_stac: str
    inpe_stac: str
    version: str
