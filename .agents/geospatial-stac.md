# STAC Endpoints, Mapeamento de Bandas e Fórmulas de Sensoriamento Remoto

## 1. Endpoints STAC Utilizados

* **AWS Earth Search v1:**
  * URL Base: `https://earth-search.aws.element84.com/v1`
  * Coleção Sentinel-2 L2A: `sentinel-2-l2a`
  * Bandas:
    * `blue`: B02 (490 nm, 10m)
    * `green`: B03 (560 nm, 10m)
    * `red`: B04 (665 nm, 10m)
    * `nir`: B08 (842 nm, 10m)
    * `scl`: Scene Classification Layer (20m, usada para nuvens no talhão)
* **INPE Brazil Data Cube (BDC):**
  * URL Base: `https://data.inpe.br/bdc/stac/v1`
  * Coleção CBERS-4A WPM: `CB4A-WPM-L4-DN-1` ou `CB4A-WPM-PCA-FUSED-1`
  * Bandas:
    * `BAND0`: Pancromática (2 metros)
    * `BAND1`: Azul (8 metros)
    * `BAND2`: Verde (8 metros)
    * `BAND3`: Vermelho (8 metros)
    * `BAND4`: NIR (8 metros)

---

## 2. Fórmulas de Álgebra de Mapas

### A. NDVI (Normalized Difference Vegetation Index)
$$\text{NDVI} = \frac{\text{NIR} - \text{RED}}{\text{NIR} + \text{RED} + \epsilon}$$
* Colormap: `RdYlGn`
* Rampa agronômica: Solo exposto ($\sim 0.15$) $\to$ Pastagem ativa ($\sim 0.55$) $\to$ Pasto denso/Mata ($> 0.70$).

### B. NDWI (Normalized Difference Water Index - McFeeters / Gao)
$$\text{NDWI} = \frac{\text{GREEN} - \text{NIR}}{\text{GREEN} + \text{NIR} + \epsilon}$$
* Colormap: `YlGnBu`
* Útil para mapeamento de açudes/lagoas na Casa da Lagoa e canais de arroz irrigado em Gaspar.

### C. Fusão Brovey (Pansharpening CBERS-4A)
Resolução espacial elevada de 8m para 2m mantendo fidelidade cromática:
$$R_{\text{pan}} = R \times \frac{\text{PAN}}{\frac{R + G + B}{3} + \epsilon}$$
$$G_{\text{pan}} = G \times \frac{\text{PAN}}{\frac{R + G + B}{3} + \epsilon}$$
$$B_{\text{pan}} = B \times \frac{\text{PAN}}{\frac{R + G + B}{3} + \epsilon}$$

---

## 3. Variáveis de Otimização GDAL / Rasterio
```env
GDAL_DISABLE_READDIR_ON_OPEN=EMPTY_DIR
CPL_VSIL_CURL_ALLOWED_EXTENSIONS=.tif,.tiff,.TIF,.TIFF
AWS_NO_SIGN_REQUEST=YES
GDAL_HTTP_TIMEOUT=30
GDAL_HTTP_MAX_RETRY=3
VSI_CACHE=TRUE
VSI_CACHE_SIZE=536870912
```
