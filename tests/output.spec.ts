import { describe, it, expect } from 'vitest'
import { planExport } from '@/lib/output'
import {
  DEFAULT_IMAGE,
  DEFAULT_OUTPUT,
  DEFAULT_POSITION,
  DEFAULT_TEXT,
  DEFAULT_TILED,
  type SourceImage,
  type WatermarkState,
} from '@/types/watermark'

function makeSource(mime = 'image/jpeg', w = 4000, h = 3000): SourceImage {
  return {
    file: new File([new Uint8Array(2)], 'photo.jpg', { type: mime }),
    url: 'blob:m',
    img: {} as HTMLImageElement,
    width: w,
    height: h,
  }
}

function baseState(overrides: Partial<WatermarkState> = {}): WatermarkState {
  return {
    source: makeSource(),
    type: 'text',
    text: { ...DEFAULT_TEXT },
    image: { ...DEFAULT_IMAGE },
    tiled: { ...DEFAULT_TILED },
    position: { ...DEFAULT_POSITION },
    rotationDeg: 0,
    output: { ...DEFAULT_OUTPUT },
    ...overrides,
  }
}

describe('planExport', () => {
  it('keeps original size + mime when output.format = "original"', () => {
    const plan = planExport(baseState())
    expect(plan.width).toBe(4000)
    expect(plan.height).toBe(3000)
    expect(plan.mime).toBe('image/jpeg')
    expect(plan.ext).toBe('jpg')
    expect(plan.quality).toBeCloseTo(0.92, 2)
  })

  it('falls back to png when source mime is non-exportable', () => {
    const plan = planExport(baseState({ source: makeSource('image/gif') }))
    expect(plan.mime).toBe('image/png')
    expect(plan.quality).toBeUndefined()
  })

  it('forces format to webp when configured', () => {
    const plan = planExport(
      baseState({
        output: { format: 'webp', quality: 0.7, maxEdge: null },
      })
    )
    expect(plan.mime).toBe('image/webp')
    expect(plan.quality).toBeCloseTo(0.7)
    expect(plan.ext).toBe('webp')
  })

  it('drops quality field for png', () => {
    const plan = planExport(
      baseState({ output: { format: 'png', quality: 0.5, maxEdge: null } })
    )
    expect(plan.mime).toBe('image/png')
    expect(plan.quality).toBeUndefined()
  })

  it('shrinks long edge to maxEdge', () => {
    // 4000x3000 → maxEdge=2000 → 2000x1500
    const plan = planExport(
      baseState({
        output: { format: 'original', quality: 0.92, maxEdge: 2000 },
      })
    )
    expect(plan.width).toBe(2000)
    expect(plan.height).toBe(1500)
  })

  it('does not enlarge when source is already smaller than maxEdge', () => {
    const plan = planExport(
      baseState({
        source: makeSource('image/png', 800, 600),
        output: { format: 'original', quality: 0.92, maxEdge: 2000 },
      })
    )
    expect(plan.width).toBe(800)
    expect(plan.height).toBe(600)
  })

  it('throws if no source image', () => {
    expect(() => planExport(baseState({ source: null }))).toThrow()
  })
})
