# Diretrizes de UI/UX — ValeSat Agro

## 1. Filosofia Visual: Spatial Dark Glassmorphism
Inspirado nos líderes globais de AgTech (OneSoil Pro, EOSDA Crop Monitoring, Planet Explorer, Climate FieldView):
* **Cores Base:** Fundo `slate-950` (`#020617`), bordas `white/10`, acentos em `emerald-500` (`#10b981`) para vegetação e `cyan-400` (`#22d3ee`) para água e satélites.
* **Painéis Flutuantes:** `bg-slate-950/80 backdrop-blur-md border border-white/10` para manter o foco no mapa interativo em tela cheia (100vw x 100vh).
* **Feedback Imediato:** Sempre que uma operação de corte raster é solicitada, exibir badge animado com tempo de execução em milissegundos e spinner de progresso.
* **Ferramenta de Desenho:** Linhas com contorno neon vibrante e exibição em tempo real da área em hectares calculada com `@turf/turf`.
