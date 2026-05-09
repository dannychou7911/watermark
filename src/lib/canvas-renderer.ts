import { anchorToRatio, degToRad, ratioToPixel } from './geometry'
import type {
  ImageWatermarkConfig,
  PositionConfig,
  SourceImage,
  TextConfig,
  TiledConfig,
  WatermarkState,
} from '@/types/watermark'

/**
 * Render full source-image + active watermark to the given canvas.
 * Caller controls canvas size — we always draw the source filling (0,0,w,h).
 * Used both for live preview (downscaled canvas) and final export (full size).
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  state: WatermarkState
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas-renderer: 2D context unavailable')

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (!state.source) return
  ctx.drawImage(state.source.img, 0, 0, canvas.width, canvas.height)

  switch (state.type) {
    case 'text':
      drawTextWatermark(
        ctx,
        canvas,
        state.text,
        state.position,
        state.rotationDeg,
        state.source
      )
      break
    case 'image':
      drawImageWatermark(
        ctx,
        canvas,
        state.image,
        state.position,
        state.rotationDeg,
        state.source
      )
      break
    case 'tiled':
      drawTiledWatermark(
        ctx,
        canvas,
        state.tiled,
        state.text,
        state.image,
        state.rotationDeg,
        state.source
      )
      break
  }
}

/* -----------------------------  TEXT  ----------------------------- */

export function drawTextWatermark(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: TextConfig,
  position: PositionConfig,
  rotationDeg: number,
  source: SourceImage
): void {
  if (!text.content) return

  const scale = canvas.width / source.width
  const fontPx = text.fontSize * scale

  ctx.save()
  ctx.font = `${fontPx}px "${text.fontFamily}", Inter, sans-serif`
  ctx.fillStyle = text.color
  ctx.globalAlpha = text.opacity
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  const { x, y } = resolvePosition(position, canvas.width, canvas.height)
  ctx.translate(x, y)
  ctx.rotate(degToRad(rotationDeg))
  ctx.fillText(text.content, 0, 0)
  ctx.restore()
}

/* -----------------------------  IMAGE  ----------------------------- */

export function drawImageWatermark(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: ImageWatermarkConfig,
  position: PositionConfig,
  rotationDeg: number,
  _source: SourceImage
): void {
  if (!img.img || img.width === 0 || img.height === 0) return

  const shortEdge = Math.min(canvas.width, canvas.height)
  const targetWidth = shortEdge * img.scale
  const targetHeight = (img.height / img.width) * targetWidth

  ctx.save()
  ctx.globalAlpha = img.opacity
  const { x, y } = resolvePosition(position, canvas.width, canvas.height)
  ctx.translate(x, y)
  ctx.rotate(degToRad(rotationDeg))
  ctx.drawImage(
    img.img,
    -targetWidth / 2,
    -targetHeight / 2,
    targetWidth,
    targetHeight
  )
  ctx.restore()
}

/* -----------------------------  TILED  ----------------------------- */

export function drawTiledWatermark(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  tiled: TiledConfig,
  text: TextConfig,
  img: ImageWatermarkConfig,
  rotationDeg: number,
  source: SourceImage
): void {
  ctx.save()
  // clip to canvas bounds so rotated tiles don't bleed past the source image
  ctx.beginPath()
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.clip()

  ctx.globalAlpha = tiled.opacity

  const cx = canvas.width / 2
  const cy = canvas.height / 2
  ctx.translate(cx, cy)
  ctx.rotate(degToRad(rotationDeg))

  // Build a tile cell, then paint repeatedly across a region big enough
  // to cover the rotated bbox of the canvas.
  const scale = canvas.width / source.width
  const gapX = tiled.gapX * scale
  const gapY = tiled.gapY * scale

  const reach = Math.hypot(canvas.width, canvas.height) // covers all rotations

  if (tiled.mode === 'text' && text.content) {
    ctx.font = `${text.fontSize * scale}px "${text.fontFamily}", Inter, sans-serif`
    ctx.fillStyle = text.color
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    const cellW = ctx.measureText(text.content).width + gapX
    const cellH = text.fontSize * scale + gapY
    const cols = Math.ceil(reach / cellW) + 1
    const rows = Math.ceil(reach / cellH) + 1
    for (let r = -rows; r <= rows; r++) {
      for (let c = -cols; c <= cols; c++) {
        ctx.fillText(text.content, c * cellW, r * cellH)
      }
    }
  } else if (tiled.mode === 'image' && img.img) {
    const shortEdge = Math.min(canvas.width, canvas.height)
    const w = shortEdge * img.scale
    const h = (img.height / img.width) * w
    const cellW = w + gapX
    const cellH = h + gapY
    const cols = Math.ceil(reach / cellW) + 1
    const rows = Math.ceil(reach / cellH) + 1
    for (let r = -rows; r <= rows; r++) {
      for (let c = -cols; c <= cols; c++) {
        ctx.drawImage(img.img, c * cellW - w / 2, r * cellH - h / 2, w, h)
      }
    }
  }

  ctx.restore()
}

/* ---------------------------  position util  ---------------------------- */

function resolvePosition(
  position: PositionConfig,
  width: number,
  height: number
): { x: number; y: number } {
  const ratio =
    position.anchor === 'custom'
      ? { x: position.x, y: position.y }
      : anchorToRatio(position.anchor)
  return ratioToPixel(ratio.x, ratio.y, width, height)
}
