import { renderToCanvas } from './canvas-renderer'
import type { OutputFormat, WatermarkState } from '@/types/watermark'

export interface ExportPlan {
  width: number
  height: number
  mime: string
  quality: number | undefined
  ext: string
}

const FORMAT_TO_MIME: Record<Exclude<OutputFormat, 'original'>, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/**
 * Compute the export plan (target size + mime + quality) without doing any
 * canvas work. Pure function for testability.
 */
export function planExport(state: WatermarkState): ExportPlan {
  if (!state.source) {
    throw new Error('planExport: no source image loaded')
  }
  const { width: srcW, height: srcH } = state.source

  // Resolve MIME
  let mime: string
  if (state.output.format === 'original') {
    mime = isExportable(state.source.file.type)
      ? state.source.file.type
      : 'image/png'
  } else {
    mime = FORMAT_TO_MIME[state.output.format]
  }

  // Resolve quality: only for jpeg/webp
  const quality =
    mime === 'image/jpeg' || mime === 'image/webp'
      ? clamp(state.output.quality, 0, 1)
      : undefined

  // Resolve target size
  let width = srcW
  let height = srcH
  const maxEdge = state.output.maxEdge
  if (maxEdge && maxEdge > 0) {
    const longEdge = Math.max(srcW, srcH)
    if (longEdge > maxEdge) {
      const scale = maxEdge / longEdge
      width = Math.round(srcW * scale)
      height = Math.round(srcH * scale)
    }
  }

  return {
    width,
    height,
    mime,
    quality,
    ext: MIME_TO_EXT[mime] ?? 'png',
  }
}

/** Build a final Blob using the same renderer as the live preview. */
export async function exportToBlob(state: WatermarkState): Promise<{
  blob: Blob
  filename: string
}> {
  const plan = planExport(state)
  const canvas = document.createElement('canvas')
  canvas.width = plan.width
  canvas.height = plan.height
  renderToCanvas(canvas, state)

  const blob = await canvasToBlob(canvas, plan.mime, plan.quality)
  return {
    blob,
    filename: buildFilename(state.source!.file.name, plan.ext),
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number | undefined
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b)
        else reject(new Error('canvas.toBlob returned null'))
      },
      mime,
      quality
    )
  })
}

function buildFilename(originalName: string, ext: string): string {
  const dot = originalName.lastIndexOf('.')
  const stem = dot >= 0 ? originalName.slice(0, dot) : originalName
  return `${stem}-watermarked.${ext}`
}

function clamp(v: number, min: number, max: number): number {
  if (v < min) return min
  if (v > max) return max
  return v
}

function isExportable(mime: string): boolean {
  return mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/webp'
}
