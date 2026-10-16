# Nick Chatzoudas — 3D Portfolio

An interactive 3D portfolio: a retro computer rendered in the browser, with a fully working OS live on its screen.

**🌐 Live:** [chatzoudas.dev](https://chatzoudas.dev) · **💻 Interactive OS:** [os.chatzoudas.dev](https://os.chatzoudas.dev)

## What it is

Instead of a static page, visitors explore a 3D retro setup — orbit around it, zoom into the screen, type on a working 3D keyboard, and click the GitHub / LinkedIn / Mail stickers. The computer screen runs my real OS portfolio site embedded live, wrapped in a CRT/VHS shader for an authentic retro feel.

## Tech stack

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)

React 19 · TypeScript · Vite · React Three Fiber · Three.js · Tailwind CSS v4 · GSAP

## Highlights

- **3D retro computer** — GLB model with orbit controls and zoom-to-screen
- **Live OS on the screen** — real site embedded via iframe, fully usable in 3D
- **Working 3D keyboard** — press animations with click sounds
- **Clickable stickers** — GitHub, LinkedIn, and email shortcuts on the model
- **CRT/VHS overlay** — shader-based retro screen effect + party mode
- **Win98-style loader** — smoothed progress across model + iframe loading
- **Mobile-friendly** — auto-redirects to the touch-optimized OS version

## Run locally

```bash
npm install
npm run dev
```

```bash
npm run build   # production build
npm run preview # preview the build
```
