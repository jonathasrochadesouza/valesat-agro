import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ValeSat Agro API"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:////tmp/valesat_dev.db")
    AWS_STAC_URL: str = os.getenv("AWS_STAC_URL", "https://earth-search.aws.element84.com/v1")
    INPE_STAC_URL: str = os.getenv("INPE_STAC_URL", "https://data.inpe.br/bdc/stac/v1")
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
