import { reactive, inject, provide, type InjectionKey } from 'vue'
import {
  DEFAULT_IMAGE,
  DEFAULT_OUTPUT,
  DEFAULT_POSITION,
  DEFAULT_TEXT,
  DEFAULT_TILED,
  type Anchor,
  type ImageWatermarkConfig,
  type OutputConfig,
  type SourceImage,
  type TextConfig,
  type TiledConfig,
  type WatermarkState,
  type WatermarkType,
} from '@/types/watermark'

export interface WatermarkStore {
  state: WatermarkState
  setSource: (source: SourceImage | null) => void
  setType: (type: WatermarkType) => void
  patchText: (patch: Partial<TextConfig>) => void
  patchImage: (patch: Partial<ImageWatermarkConfig>) => void
  patchTiled: (patch: Partial<TiledConfig>) => void
  setAnchor: (anchor: Anchor) => void
  setCustomPosition: (x: number, y: number) => void
  setRotation: (deg: number) => void
  patchOutput: (patch: Partial<OutputConfig>) => void
  clearSource: () => void
  resetWatermark: () => void
  reset: () => void
}

const STORE_KEY: InjectionKey<WatermarkStore> = Symbol('WatermarkStore')

export function createWatermarkStore(): WatermarkStore {
  const state = reactive<WatermarkState>({
    source: null,
    type: 'text',
    text: { ...DEFAULT_TEXT },
    image: { ...DEFAULT_IMAGE },
    tiled: { ...DEFAULT_TILED },
    position: { ...DEFAULT_POSITION },
    rotationDeg: 0,
    output: { ...DEFAULT_OUTPUT },
  })

  function setSource(source: SourceImage | null) {
    if (state.source && state.source.url && state.source !== source) {
      URL.revokeObjectURL(state.source.url)
    }
    state.source = source
  }

  function setType(type: WatermarkType) {
    state.type = type
  }

  function patchText(patch: Partial<TextConfig>) {
    Object.assign(state.text, patch)
  }

  function patchImage(patch: Partial<ImageWatermarkConfig>) {
    if (
      state.image.url &&
      patch.url !== undefined &&
      patch.url !== state.image.url
    ) {
      URL.revokeObjectURL(state.image.url)
    }
    Object.assign(state.image, patch)
  }

  function patchTiled(patch: Partial<TiledConfig>) {
    Object.assign(state.tiled, patch)
  }

  function setAnchor(anchor: Anchor) {
    state.position.anchor = anchor
  }

  function setCustomPosition(x: number, y: number) {
    state.position.anchor = 'custom'
    state.position.x = clamp01(x)
    state.position.y = clamp01(y)
  }

  function setRotation(deg: number) {
    // normalize to -180..180
    let d = deg % 360
    if (d > 180) d -= 360
    if (d < -180) d += 360
    state.rotationDeg = d
  }

  function patchOutput(patch: Partial<OutputConfig>) {
    Object.assign(state.output, patch)
  }

  /** Clear the source image only — keep all watermark settings (incl. uploaded logo) */
  function clearSource() {
    setSource(null)
  }

  /** Reset watermark settings to defaults — keep the source image */
  function resetWatermark() {
    if (state.image.url) URL.revokeObjectURL(state.image.url)
    state.type = 'text'
    Object.assign(state.text, DEFAULT_TEXT)
    Object.assign(state.image, DEFAULT_IMAGE)
    Object.assign(state.tiled, DEFAULT_TILED)
    Object.assign(state.position, DEFAULT_POSITION)
    state.rotationDeg = 0
    Object.assign(state.output, DEFAULT_OUTPUT)
  }

  function reset() {
    clearSource()
    resetWatermark()
  }

  return {
    state,
    setSource,
    setType,
    patchText,
    patchImage,
    patchTiled,
    setAnchor,
    setCustomPosition,
    setRotation,
    patchOutput,
    clearSource,
    resetWatermark,
    reset,
  }
}

export function provideWatermarkStore(): WatermarkStore {
  const store = createWatermarkStore()
  provide(STORE_KEY, store)
  return store
}

export function useWatermarkStore(): WatermarkStore {
  const store = inject(STORE_KEY)
  if (!store) {
    throw new Error(
      'useWatermarkStore() called outside of provideWatermarkStore() context'
    )
  }
  return store
}

function clamp01(v: number): number {
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}
