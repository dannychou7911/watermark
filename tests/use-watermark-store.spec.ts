import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createWatermarkStore } from '@/composables/use-watermark-store'

describe('watermark store', () => {
  let revokeSpy: ReturnType<typeof vi.fn>
  let createSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    revokeSpy = vi.fn()
    createSpy = vi.fn(() => 'blob:mock')
    Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
      value: revokeSpy,
      configurable: true,
    })
    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      value: createSpy,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with default state', () => {
    const s = createWatermarkStore()
    expect(s.state.source).toBeNull()
    expect(s.state.type).toBe('text')
    expect(s.state.text.content).toBe('© Watermark')
    expect(s.state.position.anchor).toBe('br')
    expect(s.state.rotationDeg).toBe(0)
    expect(s.state.output.format).toBe('original')
  })

  it('setSource revokes the previous URL when replaced', () => {
    const s = createWatermarkStore()
    const a = mockSource('blob:A')
    const b = mockSource('blob:B')
    s.setSource(a)
    expect(revokeSpy).not.toHaveBeenCalled()
    s.setSource(b)
    expect(revokeSpy).toHaveBeenCalledWith('blob:A')
  })

  it('setCustomPosition clamps to [0, 1] and switches anchor to custom', () => {
    const s = createWatermarkStore()
    s.setCustomPosition(-0.5, 1.4)
    expect(s.state.position.anchor).toBe('custom')
    expect(s.state.position.x).toBe(0)
    expect(s.state.position.y).toBe(1)
  })

  it('setAnchor does not erase last custom coords', () => {
    const s = createWatermarkStore()
    s.setCustomPosition(0.3, 0.7)
    s.setAnchor('cc')
    expect(s.state.position.anchor).toBe('cc')
    expect(s.state.position.x).toBe(0.3)
    expect(s.state.position.y).toBe(0.7)
  })

  it('setRotation normalizes to -180..180', () => {
    const s = createWatermarkStore()
    s.setRotation(540)
    expect(s.state.rotationDeg).toBe(180)
    s.setRotation(-540)
    expect(s.state.rotationDeg).toBe(-180)
    s.setRotation(45)
    expect(s.state.rotationDeg).toBe(45)
  })

  it('patchText/patchImage/patchTiled merge partial updates', () => {
    const s = createWatermarkStore()
    s.patchText({ content: 'Hello', fontSize: 60 })
    expect(s.state.text.content).toBe('Hello')
    expect(s.state.text.fontSize).toBe(60)
    expect(s.state.text.fontFamily).toBe('Inter') // unchanged

    s.patchImage({ scale: 0.5 })
    expect(s.state.image.scale).toBe(0.5)

    s.patchTiled({ gapX: 100 })
    expect(s.state.tiled.gapX).toBe(100)
  })

  it('reset returns to initial defaults', () => {
    const s = createWatermarkStore()
    s.patchText({ content: 'changed' })
    s.setRotation(90)
    s.setSource(mockSource('blob:X'))
    s.reset()
    expect(s.state.text.content).toBe('© Watermark')
    expect(s.state.rotationDeg).toBe(0)
    expect(s.state.source).toBeNull()
  })

  it('clearSource only clears the source — watermark config preserved', () => {
    const s = createWatermarkStore()
    s.setSource(mockSource('blob:src'))
    s.patchText({ content: 'preserved', fontSize: 99 })
    s.setRotation(45)
    s.setCustomPosition(0.2, 0.8)
    s.patchOutput({ format: 'webp', quality: 0.5 })

    s.clearSource()

    expect(s.state.source).toBeNull()
    // watermark settings stay
    expect(s.state.text.content).toBe('preserved')
    expect(s.state.text.fontSize).toBe(99)
    expect(s.state.rotationDeg).toBe(45)
    expect(s.state.position.anchor).toBe('custom')
    expect(s.state.position.x).toBe(0.2)
    expect(s.state.output.format).toBe('webp')
    // and the source URL was revoked
    expect(revokeSpy).toHaveBeenCalledWith('blob:src')
  })

  it('resetWatermark restores defaults but keeps the source', () => {
    const s = createWatermarkStore()
    s.setSource(mockSource('blob:keep'))
    s.patchText({ content: 'will-be-reset', fontSize: 99 })
    s.setRotation(45)
    s.setCustomPosition(0.2, 0.8)
    s.patchImage({ url: 'blob:logo', scale: 0.5 })
    s.patchOutput({ format: 'webp', quality: 0.5 })

    s.resetWatermark()

    // source preserved
    expect(s.state.source).not.toBeNull()
    expect(s.state.source?.url).toBe('blob:keep')
    // watermark settings back to defaults
    expect(s.state.text.content).toBe('© Watermark')
    expect(s.state.text.fontSize).toBe(48)
    expect(s.state.rotationDeg).toBe(0)
    expect(s.state.position.anchor).toBe('br')
    expect(s.state.image.url).toBe('')
    expect(s.state.image.scale).toBe(0.2)
    expect(s.state.output.format).toBe('original')
    // image-watermark URL was revoked
    expect(revokeSpy).toHaveBeenCalledWith('blob:logo')
  })
})

function mockSource(url: string) {
  const file = new File([new Uint8Array(2)], 'a.png', { type: 'image/png' })
  return {
    file,
    url,
    img: {} as HTMLImageElement,
    width: 100,
    height: 100,
  }
}
