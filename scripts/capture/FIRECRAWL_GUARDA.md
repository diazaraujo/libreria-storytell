# Guarda de gasto Firecrawl (retome)

Añadido 2026-07-23. Firecrawl cobra por `scrape`/`agent`. Se metió una guarda que
avisa y pide confirmación ANTES de cualquier llamada de pago.

## Comportamiento
- **Interactivo (terminal)** → muestra ⚠️ con la URL y pregunta `[y/N]` (default No).
- **No-interactivo** (cron, pipe, CI) → **aborta con exit 1 antes de llamar la API**.
- **Correr a propósito sin prompt**: `--yes` / `-y` o env `FIRECRAWL_CONFIRM=1`.
  - Ej: `node firecrawl-api.mjs scrape climate --yes`
  - Ej lote: `FIRECRAWL_CONFIRM=1 bash scripts/mirror/firecrawl-all-chapters.sh`
- **No gastan** (siguen sin prompt): `credits`, `gallery`, `help`, `--list`.

## Archivos con la guarda
- `scripts/capture/firecrawl-api.mjs`  (cmds `scrape`, `agent`)
- `scripts/capture/firecrawl-atlas-ref.mjs`  (siempre scrapea)
- `scripts/mirror/firecrawl-all-chapters.sh`  (1 confirmación → pasa `--yes` a los 13)

## Estado / cómo retomar
- Cambios **locales, sin commit**, en rama `main`. Misma edición replicada en
  `~/atlas-replicas` y `~/libreria-storytell` (mismo remoto `diazaraujo/libreria-storytell`).
- Para versionar: commit+push en UNA copia y `git pull` en la otra (no commitear las dos).
- Verificar créditos restantes (no gasta): `node firecrawl-api.mjs credits`
- El gasto pasivo real NO está acá: es el cron diario de `alterego-generacion-contenido` (deploy).
