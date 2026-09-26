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
- `public/main.glb` — 3D computer model
- `public/SoundEffects/` — keyboard / mouse click sounds
```
