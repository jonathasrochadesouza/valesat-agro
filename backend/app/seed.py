import json
from shapely.geometry import shape
from pyproj import Geod
from sqlalchemy.orm import Session
from app.models import Field

geod = Geod(ellps="WGS84")

def compute_area_and_perimeter(geom_dict: dict) -> tuple[float, float]:
    try:
        s = shape(geom_dict)
        area, perimeter = geod.geometry_area_perimeter(s)
        area_ha = abs(area) / 10000.0
        return round(area_ha, 2), round(abs(perimeter), 2)
    except Exception:
        return 0.0, 0.0

SEED_PROPERTIES = [
    {
        "name": "Casa da Lagoa (Propriedade Principal)",
        "owner": "Família Schroeder / Produtor Vale",
        "municipality": "Blumenau / Gaspar",
        "state": "SC",
        "address": "Rua Reinhold Schroeder, Blumenau / Gaspar - SC",
        "google_maps_url": "https://maps.app.goo.gl/2tqWsce6YtS9DoGm9?g_st=ic",
        "description": "Área de pastagem, lagoa/açude e encostas arborizadas ao longo da Rua Reinhold Schroeder no Vale do Itajaí.",
        "geojson": {
            "type": "Polygon",
            "coordinates": [[
                [-49.17880, -26.96620],
                [-49.17600, -26.96580],
                [-49.17300, -26.96600],
                [-49.17120, -26.96880],
                [-49.17080, -26.96880],
                [-49.17120, -26.97100],
                [-49.17220, -26.97280],
                [-49.17350, -26.97360],
                [-49.17520, -26.97380],
                [-49.17630, -26.97300],
                [-49.17720, -26.97120],
                [-49.17880, -26.96980],
                [-49.17950, -26.96820],
                [-49.17880, -26.96620]
            ]]
        }
    },
    {
        "name": "Fazenda Vale Verde",
        "owner": "Cooperativa Regional de Gaspar",
        "municipality": "Gaspar",
        "state": "SC",
        "address": "Margens do Rio Itajaí-Açu, Gaspar - SC",
        "google_maps_url": "https://maps.google.com/?q=-26.9315,-48.9580",
        "description": "Talhão de Arroz Irrigado e Pastagem intensiva com canais de drenagem na várzea do Rio Itajaí-Açu.",
        "geojson": {
            "type": "Polygon",
            "coordinates": [[
                [-48.9610, -26.9280],
                [-48.9550, -26.9295],
                [-48.9540, -26.9340],
                [-48.9600, -26.9355],
                [-48.9630, -26.9310],
                [-48.9610, -26.9280]
            ]]
        }
    },
    {
        "name": "Sítio Santa Catarina",
        "owner": "Laticínios Vale do Encanto",
        "municipality": "Indaial",
        "state": "SC",
        "address": "Estrada Geral Warnow, Indaial - SC",
        "google_maps_url": "https://maps.google.com/?q=-26.8970,-49.2310",
        "description": "Piquetes rotacionados de Gado Leiteiro, gramíneas temperadas e mata ciliar preservada.",
        "geojson": {
            "type": "Polygon",
            "coordinates": [[
                [-49.2350, -26.8940],
                [-49.2270, -26.8950],
                [-49.2260, -26.8990],
                [-49.2330, -26.9010],
                [-49.2360, -26.8970],
                [-49.2350, -26.8940]
            ]]
        }
    },
    {
        "name": "Estância Alto Vale",
        "owner": "Agropecuária Rio do Sul Ltda",
        "municipality": "Rio do Sul / Ituporanga",
        "state": "SC",
        "address": "Rodovia SC-350, Rio do Sul - SC",
        "google_maps_url": "https://maps.google.com/?q=-27.2140,-49.6430",
        "description": "Lavoura comercial em relevo ondulado, rotação milho/soja e manejo de conservação de bacias.",
        "geojson": {
            "type": "Polygon",
            "coordinates": [[
                [-49.6480, -27.2100],
                [-49.6380, -27.2120],
                [-49.6370, -27.2180],
                [-49.6460, -27.2190],
                [-49.6500, -27.2140],
                [-49.6480, -27.2100]
            ]]
        }
    }
]

def seed_default_fields(db: Session):
    existing_count = db.query(Field).count()
    if existing_count > 0:
        return
    for item in SEED_PROPERTIES:
        area_ha, perimeter_m = compute_area_and_perimeter(item["geojson"])
        field = Field(
            name=item["name"],
            owner=item["owner"],
            municipality=item["municipality"],
            state=item["state"],
            address=item["address"],
            google_maps_url=item["google_maps_url"],
            description=item["description"],
            area_ha=area_ha,
            perimeter_m=perimeter_m,
            geojson=item["geojson"]
        )
        db.add(field)
    db.commit()
