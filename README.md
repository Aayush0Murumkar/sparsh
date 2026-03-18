# 🛡️ SheShield AI — Women Safety Route Assistant (v2)

A professional, Apple-style React frontend for the SheShield AI backend.  
Built with React 18, Axios, react-leaflet, and a clean iOS-inspired design system.

---

## 📁 File Structure

```
sheshield-ai/
├── public/
│   └── index.html
├── src/
│   ├── index.js               ← React entry point
│   ├── index.css              ← Global resets
│   ├── App.js                 ← Root component + API logic
│   ├── App.css                ← Layout & design tokens
│   └── components/
│       ├── Header.js          ← Sticky frosted-glass header
│       ├── Header.css
│       ├── Footer.js          ← © 2026 Sparshh – SheShield AI
│       ├── Footer.css
│       ├── RouteForm.js       ← Source / Destination / Time form
│       ├── RouteForm.css
│       ├── RouteCard.js       ← Route info card with score ring
│       ├── RouteCard.css
│       ├── MapView.js         ← react-leaflet map with polylines
│       └── MapView.css
├── .env.example               ← Copy to .env
├── netlify.toml               ← Netlify build config
├── package.json
└── README.md
```

---

## 🚀 Quick Start (Local)

### 1 — Start the Backend

```bash
cd backend/
pip install fastapi uvicorn requests
uvicorn main:app --reload --port 8000
```

Verify it works: open http://127.0.0.1:8000 — you should see the health-check JSON.

### 2 — Install Frontend Dependencies

```bash
cd sheshield-ai/        # the folder containing package.json
npm install
```

### 3 — Configure Environment

```bash
cp .env.example .env
# .env already points to http://127.0.0.1:8000 — no changes needed for local dev
```

### 4 — Run

```bash
npm start
# Opens http://localhost:3000 in your browser
```

---

## ☁️ Deploy to Netlify

### Option A — Drag & Drop

```bash
npm run build           # creates the build/ folder
```
Then drag the `build/` folder to https://app.netlify.com/drop

### Option B — GitHub + Netlify CI

1. Push this folder to a GitHub repository.
2. In Netlify → **Add new site → Import from Git**.
3. Set build command: `npm run build`  
   Publish directory: `build`
4. Add environment variable in **Site Settings → Environment Variables**:
   ```
   REACT_APP_API_URL = https://your-backend.onrender.com
   ```
5. Deploy. Netlify auto-deploys on every push.

> The `netlify.toml` file included already handles SPA routing redirects.

---

## 🔑 Backend URL

| Environment | Value in `.env` |
|---|---|
| Local dev | `REACT_APP_API_URL=http://127.0.0.1:8000` |
| Production | `REACT_APP_API_URL=https://your-live-backend.com` |

> Never hard-code the URL in source files — always use the env variable.

---

## 🎨 Design Highlights

- **Fonts**: Instrument Serif (display) + Outfit (body)
- **Apple iOS palette**: `#007aff` blue · `#34c759` green · `#ffcc00` amber · `#ff3b30` red
- **Frosted-glass** sticky header with scroll shadow
- **SVG score ring** on each route card (animated fill)
- **Color-coded polylines**: green = safe, amber = medium, red = high risk
- Active route rendered with a soft **glow halo** on the map
- Background routes shown as faint dashed lines for context
- Fully **responsive**: stacks on mobile, side-by-side on desktop

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| react | ^18.2 | UI framework |
| react-dom | ^18.2 | DOM rendering |
| axios | ^1.6 | HTTP client |
| leaflet | ^1.9 | Map engine |
| react-leaflet | ^4.2 | React bindings for Leaflet |
| react-scripts | 5.0.1 | Build toolchain (CRA) |

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| Map tiles not loading | Check internet connection; OSM tiles need network access |
| `ERR_NETWORK` in browser | Make sure backend is running on port 8000 |
| Blank map / wrong location | Confirm coordinates from backend are `[lat, lon]` not `[lon, lat]` |
| CORS error | Add `allow_origins=["*"]` in FastAPI CORS middleware |
| Markers missing | Leaflet icon fix is already included in `MapView.js` |

---

© 2026 Sparshh – SheShield AI
