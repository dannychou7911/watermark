# Watermark

Offline watermark SPA — add text/image/tiled watermarks to photos in your browser.

All processing happens locally via the Canvas API. **Your images never leave your device.**

## Features

- **Text watermark** — custom content, font, color, size, opacity
- **Image watermark** — upload your logo / PNG (transparent supported)
- **Tiled watermark** — repeat across the whole image (anti-piracy)
- **Rotation** — any angle from -180° to 180°
- **Position** — drag to position, or pick from a 9-grid
- **Output** — keep original format, or export as JPEG / PNG / WebP, with quality and max-edge controls

## Tech stack

Vue 3 · Vite · TypeScript · Tailwind CSS · Vitest

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # run unit tests
npm run build    # production build → dist/
```

## Deploy

Pushing to `main` triggers GitHub Actions to build and deploy to GitHub Pages. See `.github/workflows/deploy.yml`.

## Project structure

```
src/
├── App.vue, main.ts
├── types/watermark.ts             State types & defaults
├── lib/
│   ├── canvas-renderer.ts         Pure rendering (text / image / tiled, with rotation)
│   ├── geometry.ts                Anchor → ratio coords
│   ├── image-loader.ts            File → HTMLImageElement (with URL cleanup)
│   ├── output.ts                  Export plan + canvas.toBlob
│   └── download.ts                Trigger browser download
├── composables/
│   ├── use-watermark-store.ts     Reactive state (provide/inject)
│   ├── use-canvas-render.ts       RAF-throttled canvas sync
│   └── use-canvas-drag.ts         Pointer drag → custom position
└── components/                    UploadZone, EditorLayout, PreviewCanvas, panels/*
```

## License

MIT
