# FastForward Logistics — Project Brief

## What is this?
A single-page logistics analytics dashboard for FastForward Logistics.
Think operations control tower — shipment throughput, delivery quality, regional health, and active exceptions at a glance.

## Data
Generate a fake dataset as a JSON file (`src/data/metrics.json`).

### Monthly records (Jan–Dec 2025)
Each month contains:
- **shipment volume** — number of shipments moved (trending upward with natural variation)
- **on-time delivery rate** — percentage (typically 92–97%, fluctuates month to month)
- **open exceptions** — count of unresolved delivery issues (lower is better; spikes under stress)
- **regions** — per-region breakdown for regional performance:
  - North America, Europe, Asia Pacific, Latin America
  - Each region: `shipmentVolume` and `onTimeDeliveryRate`

### Specifications requested
The dashboard must surface these four operational metrics:
1. **Shipment volume**
2. **On-time delivery rates**
3. **Regional performance** (average on-time rate across regions, with per-region chart detail)
4. **Open exceptions**

## Layout (Vuetify)
- `v-app-bar` at the top with FastForward Logistics branding, logo, and a month picker
- The month picker defaults to **All** months
- When a specific month is selected, all cards and charts filter to that month. When **All** is selected, show the full year
- Below the app bar: a row of 4 summary cards (`v-card`) — shipment volume, on-time delivery rate, regional performance, open exceptions
- Below the cards: a consolidated **MetricsOverview** panel summarizing all four metrics
- Below that: a row of 2 charts
  - Left: bar chart — monthly shipment volume
  - Right: line chart — on-time delivery rates over time
- Below that: one full-width bar chart — regional performance (on-time rate by region)
- Below that: one full-width area chart — open exceptions trend
- Use `v-container`, `v-row`, `v-col` for responsive grid layout

## Interactions
- Month picker in the app bar filters **everything**
- When **All** is selected, summary cards show yearly totals/averages and charts show all 12 months
- When a month is selected, summary cards show that month's values and charts highlight the selected period
- Cards show a small up/down arrow or color indicating change from the previous month
- For open exceptions, a decrease is treated as positive (fewer exceptions is better)

## Style
- Dark theme by default (Vuetify dark / liquid glass theme)
- Clean, minimal, lots of whitespace
- Teal accent palette — cohesive chart colors, not rainbow
- Glassmorphism cards with backdrop blur
- Mobile responsive — cards stack on small screens

## Tech
- Vue 3 + TypeScript + Vuetify 3
- Chart.js via vue-chartjs for all charts
- Fake data from a local JSON file (no API calls)
- Single page — no routing needed for this app
