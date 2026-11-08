# AGENTS.md — ValeSat Agro

Instruções e diretrizes de alta densidade técnica para orientar agentes autônomos e desenvolvedores em manutenções e extensões da plataforma.

---

## 1. Visão Geral & Localização do Projeto
* **Caminho Raiz:** `~/Developer/repositories/valesat-agro`
* **Domínio:** Agrotech SaaS para monitoramento de precisão no Vale do Itajaí (SC).
* **Estrutura:**
  * `/backend`: FastAPI (Python 3.12) + GDAL/Rasterio + SQLAlchemy 2.0 + PostGIS.
  * `/frontend`: Next.js 15 (App Router) + TypeScript + Tailwind CSS + MapLibre GL JS + Recharts.
  * `/docker-compose.yml`: Orquestração completa (`db: postgis/postgis:16-3.4`, `backend`, `frontend`).

---

## 2. Comandos Operacionais Rápidos

```bash
# Execução completa com Docker
docker compose up --build -d

# Logs em tempo real
docker compose logs -f backend
docker compose logs -f frontend

# Testes automatizados do Backend
docker compose exec backend pytest -v

# Validação do Frontend
cd frontend && npm run build
```

---

## 3. Regras Inegociáveis do Domínio Geoespacial

1. **Zero Full Scene Download:** NUNCA baixe um arquivo GeoTIFF de satélite inteiro (~1 GB). Sempre utilize `/vsicurl/` com `rasterio.windows.from_bounds()` para ler estritamente os bytes do bounding box do talhão via HTTP Range Requests.
2. **Reprojeção Obrigatória:** Sempre reprojete as coordenadas GeoJSON de `EPSG:4326` (WGS84) para o CRS nativo do raster (ex: `EPSG:32722` - SIRGAS 2000 UTM Zone 22S para o Vale do Itajaí) antes de calcular o `Window` e aplicar `rasterio.mask.mask`.
3. **Mapeamento de Coordenadas MapLibre `ImageSource`:** O MapLibre GL espera coordenadas no formato `[[west, north], [east, north], [east, south], [west, south]]` em `EPSG:4326`. O backend deve retornar os `bounds` em `[west, south, east, north]` e o frontend converter diretamente.
4. **Resiliência INPE:** Como coleções STAC governamentais do INPE podem oscilar ou exigir autenticação transitória, o sistema implementa fallback automático com super-resolução bicúbica + unsharp masking caso o endpoint WPM esteja indisponível.

---

## 4. Propriedade de Referência Principal
* **Nome:** Casa da Lagoa (Propriedade Principal)
* **Local:** Rua Reinhold Schroeder, Blumenau / Gaspar - SC
* **Coordenada Central:** `-26.970028, -49.175333`
* **Google Maps:** [https://maps.app.goo.gl/2tqWsce6YtS9DoGm9?g_st=ic](https://maps.app.goo.gl/2tqWsce6YtS9DoGm9?g_st=ic)
* **Importância:** Deve sempre ser carregada como talhão padrão #1 no seed do banco.

---

## 5. Ponteiros de Documentação Técnica
* [Arquitetura & Fluxo de Imagem](.agents/architecture.md)
* [Contratos STAC & Fórmulas Geoespaciais](.agents/geospatial-stac.md)
* [Diretrizes de UI/UX & Glassmorphism](.agents/ui-guidelines.md)
