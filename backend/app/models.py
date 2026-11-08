from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from app.database import Base

class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    owner = Column(String(255), default="Produtor Rural")
    municipality = Column(String(100), default="Blumenau")
    state = Column(String(10), default="SC")
    address = Column(String(255), default="")
    google_maps_url = Column(String(500), default="")
    description = Column(Text, default="")
    area_ha = Column(Float, nullable=False, default=0.0)
    perimeter_m = Column(Float, nullable=False, default=0.0)
    geojson = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, index=True)
    satellite_engine = Column(String(50), nullable=False)
    layer_type = Column(String(50), nullable=False)
    scene_id = Column(String(255), nullable=False)
    scene_date = Column(String(50), nullable=False)
    cloud_cover_field = Column(Float, default=0.0)
    mean_ndvi = Column(Float, nullable=True)
    mean_ndwi = Column(Float, nullable=True)
    min_val = Column(Float, nullable=True)
    max_val = Column(Float, nullable=True)
    agronomic_status = Column(String(100), default="Normal")
    created_at = Column(DateTime, default=datetime.utcnow)
