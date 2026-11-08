from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Field
from app.schemas import FieldCreate, FieldResponse
from app.seed import compute_area_and_perimeter, seed_default_fields

router = APIRouter(prefix="/api/fields", tags=["Fields"])

@router.get("", response_model=list[FieldResponse])
def list_fields(db: Session = Depends(get_db)):
    fields = db.query(Field).order_by(Field.id.asc()).all()
    if not fields:
        seed_default_fields(db)
        fields = db.query(Field).order_by(Field.id.asc()).all()
    return fields

@router.get("/{field_id}", response_model=FieldResponse)
def get_field(field_id: int, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Talhão não encontrado")
    return field

@router.post("", response_model=FieldResponse)
def create_field(payload: FieldCreate, db: Session = Depends(get_db)):
    area_ha, perimeter_m = compute_area_and_perimeter(payload.geojson)
    new_field = Field(
        name=payload.name,
        owner=payload.owner or "Produtor Rural",
        municipality=payload.municipality or "Vale do Itajaí",
        state=payload.state or "SC",
        address=payload.address or "",
        google_maps_url=payload.google_maps_url or "",
        description=payload.description or "Talhão demarcado pelo usuário",
        area_ha=area_ha,
        perimeter_m=perimeter_m,
        geojson=payload.geojson
    )
    db.add(new_field)
    db.commit()
    db.refresh(new_field)
    return new_field

@router.delete("/{field_id}")
def delete_field(field_id: int, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Talhão não encontrado")
    db.delete(field)
    db.commit()
    return {"status": "success", "deleted_id": field_id}
