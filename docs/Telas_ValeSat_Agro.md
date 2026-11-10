# 🛰️ ValeSat Agro — Galeria de Telas & Telemetria em Alta Resolução (v1.0.0 PRO)

Esta documentação apresenta a interface profissional do SaaS Agrotech **ValeSat Agro**, validada e aprovada pelo gestor da **Casa da Lagoa** (Rua Reinhold Schroeder, Blumenau / Gaspar - SC).

---

## 1. Visão Geral do Dashboard & NDVI Super-Sampled (6x Bicúbico)
![Dashboard NDVI Pro](screenshots/01_pro_dashboard_ndvi_overview.png)
* **Recursos:** TopBar com telemetria meteorológica ao vivo de Blumenau/Gaspar (Open-Meteo), status das conexões STAC AWS/INPE, seletor de talhão, paleta Dark Glassmorphism, dock lateral recolhível e HUD biométrico de saúde foliar.

---

## 2. Terreno do Cliente em Altíssima Resolução (Close-up Casa da Lagoa)
![Close-up Ultra-HD Casa da Lagoa](screenshots/02_ultra_hd_client_terrain_closeup.png)
* **Recursos:** Zoom 17.5x a 20x com mosaico ortorretificado sub-métrico (Esri World Imagery Ultra-HD + CBERS-4A 2m WPM do INPE). Visibilidade cristalina da represa/lagoa central, encostas, estradas rurais e cercas de pastagem sem distorção.

---

## 3. Inspeção de Ponto por Coordenadas (Point Inspection Telemetry)
![Inspeção de Ponto](screenshots/03_point_inspection_and_biometric_hud.png)
* **Recursos:** Clique em qualquer ponto geodésico do talhão para medição pontual de NDVI, NDWI (teor hídrico), biomassa foliar estimada (t/ha), classificação de vegetação e recomendação agronômica personalizada.

---

## 4. Zonificação Agronômica em 5 Classes de Manejo (VRA)
![Zonas de Manejo VRA](screenshots/04_zonificacao_agronomica_vra.png)
* **Recursos:** Divisão do talhão em 5 zonas de produtividade (Z1 Muito Baixo a Z5 Muito Alto) para adubação e calagem em taxa variável, com cálculo automático de área em hectares e percentual para aplicação precisa de insumos.

---

## 5. Série Histórica Temporal & Telemetria Climática Local
![Série Histórica e Clima](screenshots/05_serie_historica_e_clima.png)
* **Recursos:** Gráfico temporal multi-sensor com evolução de NDVI, NDWI e cobertura de nuvens ao longo do ciclo agronômico, acoplado com previsão agrometeorológica horária e de 7 dias para planejamento de pulverização segura.

---

## 6. Diretório de Talhões & Métricas do Vale do Itajaí
![Diretório de Talhões](screenshots/06_diretorio_talhoes_cadastrados.png)
* **Recursos:** Gestão cadastral de propriedades no Vale do Itajaí (Casa da Lagoa 53.53 ha, Fazenda Vale Verde 49.52 ha, Sítio Santa Catarina 53.39 ha e Estância Alto Vale 91.66 ha) com fly-to instantâneo e cálculo automatizado via Turf.js.

---

## 7. Documentação Interativa da API Geoespacial (FastAPI Swagger OpenAPI 3.1)
![Swagger OpenAPI Docs](screenshots/07_fastapi_swagger_openapi_docs.png)
* **Recursos:** Endpoints RESTful de alta performance para processamento COG em memória, consulta STAC, telemetria de pontos, meteorologia e exportação de GeoTIFF compatível com distribuidores agrícolas ISOBUS.
