from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas import HealthResponse
from app.services.stac_service import check_aws_stac, check_inpe_stac

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {type(e).__name__}"

    aws_status = await check_aws_stac()
    inpe_status = await check_inpe_stac()

    return HealthResponse(
        status="healthy" if db_status == "healthy" else "degraded",
        database=db_status,
        aws_stac=aws_status,
        inpe_stac=inpe_status,
        version="1.0.0"
    )
