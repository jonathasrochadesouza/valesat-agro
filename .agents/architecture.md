# Arquitetura e Fluxo de Imagem do ValeSat Agro

Este documento detalha o ciclo de vida dos dados entre PostGIS, FastAPI e MapLibre GL `ImageSource`.

---

## 1. Ciclo de Dados da Consulta ao Overlay

1. **Cliente / Frontend:**
   * Usuário seleciona ou desenha uma propriedade rural no mapa.
   * O polígono GeoJSON em `EPSG:4326` é transmitido para `POST /api/satellite/process`.

2. **Backend Geoespacial (FastAPI + GDAL):**
   * Consulta os metadados do STAC (AWS ou INPE) para obter os links COG das bandas necessárias.
   * Reprojeta o polígono para o CRS nativo do raster (ex: UTM Zone 22S / `EPSG:32722`).
   * Calcula o pixel `Window` e realiza *Windowed Read* via *HTTP Range Request* (lendo apenas ~80x80 pixels em vez de 10980x10980).
   * Aplica `rasterio.mask.mask` para tornar transparente (alpha = 0) tudo o que estiver fora do polígono da fazenda.
   * Aplica a álgebra de mapas (NDVI, NDWI, RGB ou Pansharpening).
   * Converte a matriz de pixels RGBA para PNG em memória (`io.BytesIO`) e codifica em Base64 Data URI (`data:image/png;base64,...`).
   * Calcula o bounding box geográfico exato em `EPSG:4326`: `[west, south, east, north]`.

3. **Renderização no MapLibre GL:**
   * O frontend adiciona uma fonte de imagem:
     ```ts
     map.addSource("satellite-raster-source", {
       type: "image",
       url: rasterData.image_base64,
       coordinates: [
         [west, north],  // top-left
         [east, north],  // top-right
         [east, south],  // bottom-right
         [west, south],  // bottom-left
       ],
     });
     ```
   * Adiciona a camada `raster` com opacidade controlável em tempo real via `map.setPaintProperty`.
