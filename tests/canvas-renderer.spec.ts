import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  renderToCanvas,
  drawTextWatermark,
  drawImageWatermark,
} from '@/lib/canvas-renderer'
import {
  DEFAULT_IMAGE,
  DEFAULT_OUTPUT,
  DEFAULT_POSITION,
  DEFAULT_TEXT,
  DEFAULT_TILED,
  type SourceImage,
  type WatermarkState,
} from '@/types/watermark'

interface CtxCall {
  fn: string
  args: unknown[]
}

function makeMockContext() {
  const calls: CtxCall[] = []
  const make = (name: string) =>
    (...args: unknown[]) => {
      calls.push({ fn: name, args })
    }
  const ctx = {
    save: make('save'),
    restore: make('restore'),
    translate: make('translate'),
    rotate: make('rotate'),
    clearRect: make('clearRect'),
    drawImage: make('drawImage'),
    fillText: make('fillText'),
    beginPath: make('beginPath'),
    rect: make('rect'),
    clip: make('clip'),
    measureText: vi.fn(() => ({ width: 100 })),
    set fillStyle(_v: string) {
      calls.push({ fn: 'set:fillStyle', args: [_v] })
    },
    set globalAlpha(_v: number) {
      calls.push({ fn: 'set:globalAlpha', args: [_v] })
    },
    set font(_v: string) {
      calls.push({ fn: 'set:font', args: [_v] })
    },
    set textBaseline(_v: string) {
      calls.push({ fn: 'set:textBaseline', args: [_v] })
    },
    set textAlign(_v: string) {
      calls.push({ fn: 'set:textAlign', args: [_v] })
    },
  }
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls }
}

function makeCanvas(width = 800, height = 600): {
  canvas: HTMLCanvasElement
  calls: CtxCall[]
} {
  const { ctx, calls } = makeMockContext()
  const canvas = {
    width,
    height,
    getContext: vi.fn(() => ctx),
  } as unknown as HTMLCanvasElement
  return { canvas, calls }
}

function makeSource(): SourceImage {
  return {
    file: new File([new Uint8Array(2)], 'a.png', { type: 'image/png' }),
    url: 'blob:m',
    img: { tag: 'mock-img' } as unknown as HTMLImageElement,
    width: 1600,
    height: 1200,
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

describe('renderToCanvas', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('clears + skips drawing when source is null', () => {
    const { canvas, calls } = makeCanvas()
    renderToCanvas(canvas, baseState({ source: null }))
    expect(calls.find((c) => c.fn === 'clearRect')).toBeTruthy()
    expect(calls.find((c) => c.fn === 'drawImage')).toBeUndefined()
  })

  it('draws source and text watermark', () => {
    const { canvas, calls } = makeCanvas()
    renderToCanvas(canvas, baseState())
    // first drawImage = source
    expect(calls.filter((c) => c.fn === 'drawImage').length).toBe(1)
    // fillText = text watermark drawn
    expect(calls.filter((c) => c.fn === 'fillText').length).toBe(1)
  })
})

describe('drawTextWatermark', () => {
  it('uses translate + rotate before fillText', () => {
    const { canvas, calls } = makeCanvas()
    const ctx = canvas.getContext('2d')!
    drawTextWatermark(
      ctx,
      canvas,
      { ...DEFAULT_TEXT, content: 'A' },
      { anchor: 'cc', x: 0, y: 0 },
      45,
      makeSource()
    )
    const order = calls.map((c) => c.fn)
    const tIdx = order.indexOf('translate')
    const rIdx = order.indexOf('rotate')
    const fIdx = order.indexOf('fillText')
    expect(tIdx).toBeGreaterThan(-1)
    expect(rIdx).toBeGreaterThan(tIdx)
    expect(fIdx).toBeGreaterThan(rIdx)
  })

  it('skips drawing when text content is empty', () => {
    const { canvas, calls } = makeCanvas()
    const ctx = canvas.getContext('2d')!
    drawTextWatermark(
      ctx,
      canvas,
      { ...DEFAULT_TEXT, content: '' },
      { anchor: 'cc', x: 0, y: 0 },
      0,
      makeSource()
    )
    expect(calls.find((c) => c.fn === 'fillText')).toBeUndefined()
  })
})

describe('drawImageWatermark', () => {
  it('skips when no image loaded', () => {
    const { canvas, calls } = makeCanvas()
    const ctx = canvas.getContext('2d')!
    drawImageWatermark(
      ctx,
      canvas,
      DEFAULT_IMAGE, // img is null
      { anchor: 'br', x: 0, y: 0 },
      0,
      makeSource()
    )
    expect(calls.find((c) => c.fn === 'drawImage')).toBeUndefined()
  })

  it('draws when image loaded', () => {
    const { canvas, calls } = makeCanvas()
    const ctx = canvas.getContext('2d')!
    drawImageWatermark(
      ctx,
      canvas,
      {
        file: new File([new Uint8Array(2)], 'l.png', { type: 'image/png' }),
        url: 'blob:l',
        img: {} as HTMLImageElement,
        width: 100,
        height: 50,
        scale: 0.2,
        opacity: 0.6,
      },
      { anchor: 'br', x: 0, y: 0 },
      0,
      makeSource()
    )
    expect(calls.find((c) => c.fn === 'drawImage')).toBeTruthy()
  })
})
