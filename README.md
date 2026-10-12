# Portfolio

Interactive 3D portfolio. A retro computer (`main.glb`) rendered with React Three Fiber, with the live OS site (`os.chatzoudas.dev`) embedded on its screen plus a CRT/VHS overlay.

## Stack

- React 19 + TypeScript + Vite
- React Three Fiber + drei + three
- Tailwind CSS v4, 98.css, GSAP, Paper Shaders

## Features

- 3D scene with orbit controls and zoom toggle
- OS embedded in the 3D screen via iframe
- 3D keyboard with press animation + click sounds (real + iframe key events)
- Clickable GitHub / LinkedIn / Mail stickers with hover outline
- VHS/CRT shader overlay, dithered animated background + party mode
- Win98-style loader with smoothed model + iframe progress
- Mobile redirect to `os.chatzoudas.dev/?mobile=true`
- Hidden performance meter (corner overlay, Win98 style)

## Performance meter (hidden)

The perf meter is hidden by default. Show it by adding a URL tag:

```text
https://your-site.dev/?perf=1
```

Accepted tags (query or hash):

- `?perf=1` (canonical), `?perf`, `?stats`, `?fps`, `?debug`, `?meter`
- `#perf`, `#stats`, `#fps`
- `?perf=0` / `?perf=false` / `?perf=off` forces it off

When enabled it shows a bottom-right Win98 window with live values (updated every 500ms):

- FPS + SMOOTH (≥50) / OK (≥30) / SLOW (<30) rating
- Avg frame time (ms), renderer draw calls, triangles, geometries, textures
- Avg FPS (session average, tracked even while hidden) + uptime
- Loaded in (navigation → model 100% + iframe ready; `loading…` until done)
- Device pixel ratio + JS heap (Chrome only, `n/a` elsewhere)

Files: `src/components/perf-meter.tsx` (overlay), `src/lib/perf-flag.ts` (URL-tag check + `formatLoadTime`), wired in `src/App.tsx` via `Canvas onCreated` renderer ref + `loadMs` (set from `performance.now()` when loader completes). Click the title-bar `X` to dismiss it for the session.

## Run

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Structure

- `src/App.tsx` — loading progress, background, canvas, controller wiring
- `src/components/Model.tsx` — GLB scene, screen iframe, keyboard, stickers, sounds
- `src/components/vhs-overlay.tsx` — CRT/VHS fullscreen shader
- `src/components/animated-background.tsx` — dithered background + rainbow mode
- `src/components/loader.tsx` — Win98 loading window
- `src/components/controller.tsx` — zoom / party buttons
- `src/components/perf-meter.tsx` — hidden FPS + renderer stats overlay
- `src/lib/perf-flag.ts` — `?perf` / `#perf` URL-tag check + load-time formatter
- `public/main.glb` — 3D computer model
- `public/SoundEffects/` — keyboard / mouse click sounds
```
