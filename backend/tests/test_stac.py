import pytest
import asyncio
from app.services.stac_service import check_aws_stac, check_inpe_stac, search_sentinel2_scenes

@pytest.mark.asyncio
async def test_stac_connectivity():
    aws = await check_aws_stac()
    assert "online" in aws or "degraded" in aws
    inpe = await check_inpe_stac()
    assert "online" in inpe or "degraded" in inpe
