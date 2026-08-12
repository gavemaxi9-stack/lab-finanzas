# Avant Markets — Prototipo

Prototipo interactivo de gestión de portafolio de acciones. Dark theme con acentos neón verde lima y cian.

## Estructura

```
avant-markets/
├── index.html          # Entry point — abrir en navegador
├── styles.css          # Design tokens + estilos globales
├── data.jsx            # Mock data (tickers ficticios, portfolio, actividad)
├── header.jsx          # Header con logo, buscador y nav
├── ticker-detail.jsx   # Pantalla de detalle de ticker
├── portfolio.jsx       # Pantalla Mi Portafolio
└── app.jsx             # Root + routing entre pantallas
```

## Stack

- React 18 + Babel (en navegador, sin build)
- CSS puro con custom properties para tokens
- Tipografías: Space Grotesk (display) · Manrope (texto) · IBM Plex Mono (números)

## Cómo correr

Abre `index.html` directamente en un navegador, o sirve la carpeta con cualquier servidor estático:

```bash
npx serve .
# o
python3 -m http.server 8000
```

## Pantallas

1. **Detalle de ticker** — precio en tiempo real, gráfica con tabs 1H/4H/1D/1S, métricas clave, noticias
2. **Mi portafolio** — valor total, distribución por sector (donut), tabla de posiciones con sparklines, actividad reciente, mayores movimientos

## Interacciones

- Buscador: escribe `NVRA`, `HLIX`, `ATLS`, `KORE`, `PXSE`, `VRDA`, `ZNTH`, `ORBT` y Enter
- Click en filas de la tabla o de mayores movimientos → abre el detalle
- Botón "Añadir al portafolio" con toggle de estado
- Tabs de timeframe con re-animación de la gráfica

## Tickers ficticios

| Ticker | Empresa                   | Sector       |
|--------|---------------------------|--------------|
| NVRA   | Novara Technologies       | Tecnología   |
| HLIX   | Helix Robotics            | Industrial   |
| ATLS   | Atlas Energy Corp.        | Energía      |
| KORE   | Korevolt Materials        | Materiales   |
| PXSE   | Pulsar Systems            | Tecnología   |
| VRDA   | Verda Biosciences         | Salud        |
| ZNTH   | Zenith Capital Group      | Financiero   |
| ORBT   | Orbital Dynamics          | Aeroespacial |

## Tokens de color principales

```css
--lime: #c8ff1f;     /* acento primario, precios positivos */
--cyan: #2bd8e6;     /* acento secundario, UI activa */
--rose: #ff4d7a;     /* precios negativos */
--bg-deep: #000000;  /* fondo */
--bg-card: #0a0d12;  /* tarjetas */
```
