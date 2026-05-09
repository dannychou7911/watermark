import type { Anchor } from '@/types/watermark'

export interface AnchorRatio {
  x: number
  y: number
}

/** 5% inset from edges so corner watermarks aren't flush against the border */
const INSET = 0.05

const ANCHOR_TABLE: Record<Exclude<Anchor, 'custom'>, AnchorRatio> = {
  tl: { x: INSET, y: INSET },
  tc: { x: 0.5, y: INSET },
  tr: { x: 1 - INSET, y: INSET },
  cl: { x: INSET, y: 0.5 },
  cc: { x: 0.5, y: 0.5 },
  cr: { x: 1 - INSET, y: 0.5 },
  bl: { x: INSET, y: 1 - INSET },
  bc: { x: 0.5, y: 1 - INSET },
  br: { x: 1 - INSET, y: 1 - INSET },
}

/**
 * Convert a 9-grid anchor to a ratio coord (0..1) within the canvas.
 * 'custom' is invalid here — caller should use the stored {x, y} ratio directly.
 */
export function anchorToRatio(anchor: Anchor): AnchorRatio {
  if (anchor === 'custom') {
    throw new Error('anchorToRatio: "custom" must be resolved by caller')
  }
  return ANCHOR_TABLE[anchor]
}

export function ratioToPixel(
  rx: number,
  ry: number,
  width: number,
  height: number
): { x: number; y: number } {
  return { x: rx * width, y: ry * height }
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}
