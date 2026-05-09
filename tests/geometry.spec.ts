import { describe, it, expect } from 'vitest'
import { anchorToRatio, ratioToPixel, type AnchorRatio } from '@/lib/geometry'
import type { Anchor } from '@/types/watermark'

describe('anchorToRatio', () => {
  const cases: Array<[Anchor, AnchorRatio]> = [
    ['tl', { x: 0.05, y: 0.05 }],
    ['tc', { x: 0.5, y: 0.05 }],
    ['tr', { x: 0.95, y: 0.05 }],
    ['cl', { x: 0.05, y: 0.5 }],
    ['cc', { x: 0.5, y: 0.5 }],
    ['cr', { x: 0.95, y: 0.5 }],
    ['bl', { x: 0.05, y: 0.95 }],
    ['bc', { x: 0.5, y: 0.95 }],
    ['br', { x: 0.95, y: 0.95 }],
  ]

  it.each(cases)('maps %s to %o', (anchor, expected) => {
    expect(anchorToRatio(anchor)).toEqual(expected)
  })

  it('throws on custom anchor (caller must provide ratio)', () => {
    expect(() => anchorToRatio('custom')).toThrow()
  })
})

describe('ratioToPixel', () => {
  it('scales ratio by canvas size', () => {
    expect(ratioToPixel(0.5, 0.5, 800, 600)).toEqual({ x: 400, y: 300 })
    expect(ratioToPixel(0, 1, 1000, 500)).toEqual({ x: 0, y: 500 })
  })
})
