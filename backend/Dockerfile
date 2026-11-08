FROM python:3.12-slim

# System utilities for geospatial libraries
RUN apt-get update && apt-get install -y --no-install-recommends     curl     ca-certificates     libexpat1     libgomp1     && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# GDAL / Rasterio environment optimizations for Cloud Optimized GeoTIFF HTTP Range Reads
ENV GDAL_DISABLE_READDIR_ON_OPEN=EMPTY_DIR     CPL_VSIL_CURL_ALLOWED_EXTENSIONS=.tif,.tiff,.TIF,.TIFF     AWS_NO_SIGN_REQUEST=YES     GDAL_HTTP_TIMEOUT=30     GDAL_HTTP_MAX_RETRY=3     VSI_CACHE=TRUE     VSI_CACHE_SIZE=536870912

COPY app /app/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
