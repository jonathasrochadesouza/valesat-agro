import pytest
import numpy as np
from app.seed import compute_area_and_perimeter
from app.services.raster_service import compute_agronomic_status

def test_area_computation():
    poly = {
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
    area_ha, perimeter_m = compute_area_and_perimeter(poly)
    assert area_ha > 10.0, f"Expected area > 10 ha for Casa da Lagoa, got {area_ha}"
    assert perimeter_m > 1000.0, f"Expected perimeter > 1000m, got {perimeter_m}"

def test_agronomic_status_ndvi():
    assert "Excelente" in compute_agronomic_status("ndvi", 0.78)
    assert "Bom" in compute_agronomic_status("ndvi", 0.55)
    assert "Atenção" in compute_agronomic_status("ndvi", 0.22)
    assert "Lâmina" in compute_agronomic_status("ndvi", 0.05)

def test_agronomic_status_ndwi():
    assert "Lâmina" in compute_agronomic_status("ndwi", 0.25)
    assert "Estresse" in compute_agronomic_status("ndwi", -0.45)
