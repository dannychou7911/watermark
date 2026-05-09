# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                              # First-time setup
npm run dev                              # Vite dev server at http://localhost:5173
npm run build                            # vue-tsc type-check + vite production build → dist/
npm run preview                          # Serve dist/ for local production preview
npm test                                 # Run all Vitest unit tests once
npm run test:watch                       # Watch mode
npx vitest run tests/output.spec.ts      # Run a single test file
npx vitest run -t "planExport"           # Filter tests by name pattern
```

Path alias: `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.json`).

## Architecture

### Boundary: zero backend, all-browser

This is a pure-frontend SPA. There is no server, no upload endpoint, no fetch of user data — every image stays in the browser. `vite.config.ts` sets `base: './'` so the `dist/` bundle is portable to any static path (GitHub Pages subpath, file://, etc.).

### State: provide/inject singleton (no Pinia)

`src/composables/use-watermark-store.ts` exposes a single reactive `WatermarkState` (defined in `src/types/watermark.ts`) via Vue's `provide`/`inject`. `App.vue` calls `provideWatermarkStore()`; every other component calls `useWatermarkStore()`. There are explicit setters (`setSource`, `patchText`, `setCustomPosition`, …) — components never mutate `state` directly.

Three lifecycle actions worth knowing apart:
- `clearSource()` — null out the source image, **keep watermark settings**. Used by the "回到首頁" / "換一張" / brand-logo click. ObjectURL is revoked.
- `resetWatermark()` — restore watermark config defaults, **keep the source**. Used by "重設浮水印".
- `reset()` — both of the above, used in tests.

### Position is stored as 0..1 ratio, not pixels

`PositionConfig.x/y` are ratios in `[0, 1]`. They get converted to pixels only at draw time (`lib/geometry.ts:ratioToPixel`). This is deliberate — the user can adjust `output.maxEdge` (resize on export) and the watermark stays where they put it. The 9-grid anchor is a separate enum value (`Anchor`); `'custom'` means "use the stored x/y instead of the anchor table".

### Preview and export share `renderToCanvas`

`src/lib/canvas-renderer.ts` exports a single `renderToCanvas(canvas, state)` that fully paints the source + watermark. Both pieces of the app feed it different canvases:

- **Preview**: `composables/use-canvas-render.ts` watches the reactive state, RAF-throttles, and paints a downscaled canvas (max edge 1400px) for performance.
- **Export**: `lib/output.ts:exportToBlob` creates a fresh full-size (or `maxEdge`-resized) canvas, calls the same renderer, then `canvas.toBlob`.

This means a bug in the renderer affects both preview and download identically — keep it pure and side-effect-free.

### Watermark types branch inside the renderer

`renderToCanvas` switches on `state.type` to pick `drawTextWatermark` / `drawImageWatermark` / `drawTiledWatermark`. All three:
1. Use `ctx.save()` → `translate(x, y)` → `rotate(degToRad(rotationDeg))` → draw at origin → `restore()` so rotation always pivots around the watermark's center.
2. Read position via `resolvePosition()` which handles the anchor-vs-custom branch.

Tiled mode additionally clips to canvas bounds so rotated tiles don't bleed past the source image, and computes a `Math.hypot(width, height)` reach so the loop covers any rotation angle.

### Drag-to-position lives in a composable

`composables/use-canvas-drag.ts` attaches pointer-events to the preview canvas, converts client coords to ratio coords, and pushes through `store.setCustomPosition` (which sets `anchor` to `'custom'`). It no-ops when `state.type === 'tiled'` (tiled fills the whole image — dragging makes no sense). `touch-action: none` is set on the canvas to prevent browser scroll while dragging on touch devices.

### URL.createObjectURL accounting

Every `URL.createObjectURL` has a paired `revokeObjectURL`:
- `setSource()` revokes the previous source URL when replaced.
- `patchImage()` and `resetWatermark()` revoke the image-watermark URL when it's overwritten or cleared.
- `lib/download.ts:triggerDownload` revokes after a 1s timeout (Chrome needs the URL alive briefly to start the download).

Follow this pattern when adding new image flows.

## Testing

`tests/*.spec.ts` runs against happy-dom. Pure functions in `lib/` are tested directly; the canvas renderer is tested with a mock 2D context (see `tests/canvas-renderer.spec.ts:makeMockContext`). Components are not tested currently — their behavior is verified manually via the dev server.

## Deployment

`.github/workflows/deploy.yml` runs on push to `main`: install → `npm test` → `npm run build` → upload `dist/` as a GitHub Pages artifact → deploy. The site is at https://watermark.dantoolkit.cc/ (custom domain via Cloudflare DNS → `dannychou7911.github.io`; `public/CNAME` carries the domain into `dist/`). Don't change `base: './'` in `vite.config.ts` unless deploying to a fixed absolute path — relative base keeps the bundle portable.

## Known caveats

- **Dark mode is configured but not wired up**: `tailwind.config.ts` declares `darkMode: ['class']` and HSL CSS vars, but `assets/styles.css` only defines the `:root` palette and there is no toggle. Don't add `dark:` utilities until a `.dark` block + toggle land.
- **Drag coords are CSS pixels, not backing-store pixels**: `use-canvas-drag.ts:clientToRatio` divides `clientX - rect.left` by `rect.width` directly. `getBoundingClientRect` is already in CSS pixels, so do **not** multiply by `devicePixelRatio` — it would over-shoot on HiDPI screens.
- **GitHub Actions Node 20 deadline**: The deploy workflow uses `actions/checkout@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` — all currently running on Node 20. GitHub will force Node 24 after 2026-06-02. Bump action versions before then to avoid breakage.
