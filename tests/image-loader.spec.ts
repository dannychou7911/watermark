import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pickFirstImage, loadImageFromFile } from '@/lib/image-loader'

describe('pickFirstImage', () => {
  it('returns the first image-typed file', () => {
    const txt = new File(['a'], 'a.txt', { type: 'text/plain' })
    const png = new File(['p'], 'b.png', { type: 'image/png' })
    const jpg = new File(['j'], 'c.jpg', { type: 'image/jpeg' })
    expect(pickFirstImage([txt, png, jpg])).toBe(png)
  })

  it('returns null when no image present', () => {
    const txt = new File(['a'], 'a.txt', { type: 'text/plain' })
    expect(pickFirstImage([txt])).toBeNull()
    expect(pickFirstImage(null)).toBeNull()
  })
})

describe('loadImageFromFile', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:mock'),
      configurable: true,
    })
    Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
      value: vi.fn(),
      configurable: true,
    })
  })

  it('rejects unsupported MIME types', async () => {
    const f = new File(['x'], 'x.txt', { type: 'text/plain' })
    await expect(loadImageFromFile(f)).rejects.toThrow(/Unsupported/)
  })

  it('resolves with width/height on successful decode', async () => {
    // happy-dom HTMLImageElement: simulate onload by overriding setter
    const ImagePrototype = globalThis.Image.prototype as HTMLImageElement
    const originalSrc = Object.getOwnPropertyDescriptor(
      ImagePrototype,
      'src'
    )
    Object.defineProperty(ImagePrototype, 'src', {
      configurable: true,
      set(this: HTMLImageElement, _value: string) {
        Object.defineProperty(this, 'naturalWidth', { value: 320 })
        Object.defineProperty(this, 'naturalHeight', { value: 240 })
        // fire onload async to mimic real browser
        setTimeout(() => this.onload?.(new Event('load')), 0)
      },
      get() {
        return ''
      },
    })

    const f = new File([new Uint8Array(8)], 'a.png', { type: 'image/png' })
    const result = await loadImageFromFile(f)
    expect(result.width).toBe(320)
    expect(result.height).toBe(240)
    expect(result.url).toBe('blob:mock')

    if (originalSrc) Object.defineProperty(ImagePrototype, 'src', originalSrc)
  })
})
