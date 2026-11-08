import httpx
from datetime import datetime, timedelta
from typing import Any
from shapely.geometry import shape
from app.config import settings
from app.schemas import ScenePass

TIMEOUT = 12.0

def get_bbox(geometry: dict[str, Any]) -> list[float]:
    s = shape(geometry)
    minx, miny, maxx, maxy = s.bounds
    return [round(minx, 6), round(miny, 6), round(maxx, 6), round(maxy, 6)]

async def check_aws_stac() -> str:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.AWS_STAC_URL}/collections/sentinel-2-l2a")
            if resp.status_code == 200:
                return "online"
            return f"degraded ({resp.status_code})"
    except Exception as e:
        return f"offline ({type(e).__name__})"

async def check_inpe_stac() -> str:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.INPE_STAC_URL}/collections")
            if resp.status_code == 200:
                return "online"
            return f"degraded ({resp.status_code})"
    except Exception as e:
        return f"offline ({type(e).__name__})"

async def search_sentinel2_scenes(
    geometry: dict[str, Any],
    start_date: str | None = None,
    end_date: str | None = None,
    max_cloud: float = 40.0,
    limit: int = 12
) -> list[ScenePass]:
    bbox = get_bbox(geometry)
    if not end_date:
        end_date = datetime.utcnow().strftime("%Y-%m-%dT23:59:59Z")
    if not start_date:
        # 180 days default range to guarantee cloud-free scenes
        start_date = (datetime.utcnow() - timedelta(days=180)).strftime("%Y-%m-%dT00:00:00Z")

    payload = {
        "collections": ["sentinel-2-l2a"],
        "bbox": bbox,
        "datetime": f"{start_date}/{end_date}",
        "query": {"eo:cloud_cover": {"lt": max_cloud}},
        "limit": limit,
        "sortby": [{"field": "properties.datetime", "direction": "desc"}]
    }

    results: list[ScenePass] = []
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{settings.AWS_STAC_URL}/search",
                json=payload,
                headers={"Content-Type": "application/json", "User-Agent": "valesat-agro/1.0"}
            )
            if resp.status_code == 200:
                data = resp.json()
                for feat in data.get("features", []):
                    props = feat.get("properties", {})
                    assets_raw = feat.get("assets", {})
                    assets = {
                        "red": assets_raw.get("red", {}).get("href", ""),
                        "green": assets_raw.get("green", {}).get("href", ""),
                        "blue": assets_raw.get("blue", {}).get("href", ""),
                        "nir": assets_raw.get("nir", {}).get("href", ""),
                        "scl": assets_raw.get("scl", {}).get("href", ""),
                        "thumbnail": assets_raw.get("thumbnail", {}).get("href", "")
                    }
                    cc = float(props.get("eo:cloud_cover", 0.0))
                    quality = "Excelente (< 5%)" if cc < 5 else ("Boa (5-15%)" if cc < 15 else "Razoável (15-40%)")
                    results.append(ScenePass(
                        id=feat.get("id", ""),
                        satellite="Sentinel-2 (10m)",
                        collection="sentinel-2-l2a",
                        datetime=props.get("datetime", ""),
                        cloud_cover=round(cc, 2),
                        thumbnail_url=assets.get("thumbnail") or None,
                        assets=assets,
                        quality_label=quality
                    ))
    except Exception as e:
        print(f"Error querying AWS STAC: {e}")

    return results

async def search_cbers_scenes(
    geometry: dict[str, Any],
    limit: int = 8
) -> list[ScenePass]:
    bbox = get_bbox(geometry)
    payload = {
        "collections": ["CB4A-WPM-L4-DN-1", "CB4A-WPM-PCA-FUSED-1"],
        "bbox": bbox,
        "limit": limit
    }

    results: list[ScenePass] = []
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{settings.INPE_STAC_URL}/search",
                json=payload,
                headers={"Content-Type": "application/json", "User-Agent": "valesat-agro/1.0"}
            )
            if resp.status_code == 200:
                data = resp.json()
                for feat in data.get("features", []):
                    props = feat.get("properties", {})
                    assets_raw = feat.get("assets", {})
                    assets = {
                        k: v.get("href", "")
                        for k, v in assets_raw.items()
                        if isinstance(v, dict) and "href" in v
                    }
                    raw_cc = props.get("cloud_cover")
                    if raw_cc is None:
                        raw_cc = props.get("eo:cloud_cover")
                    cc = float(raw_cc) if raw_cc is not None else 10.0
                    results.append(ScenePass(
                        id=feat.get("id", ""),
                        satellite="CBERS-4A WPM (2m/8m)",
                        collection=feat.get("collection", "CB4A-WPM"),
                        datetime=props.get("datetime", props.get("date", "")),
                        cloud_cover=round(cc, 2),
                        thumbnail_url=assets.get("thumbnail") or None,
                        assets=assets,
                        quality_label="Alta Resolução WPM (2m)"
                    ))
    except Exception as e:
        print(f"Error querying INPE STAC: {e}")

    return results
