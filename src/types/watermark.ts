export type WatermarkType = 'text' | 'image' | 'tiled'

/**
 * 9-grid anchors. tl=top-left, tc=top-center, ..., br=bottom-right.
 * 'custom' = user dragged to an arbitrary spot; x/y in PositionConfig take over.
 */
export type Anchor =
  | 'tl' | 'tc' | 'tr'
  | 'cl' | 'cc' | 'cr'
  | 'bl' | 'bc' | 'br'
  | 'custom'

export interface SourceImage {
  file: File
  url: string
  img: HTMLImageElement
  width: number
  height: number
}

export interface TextConfig {
  content: string
  fontFamily: string
  fontSize: number       // px relative to source image height; renderer scales it
  color: string          // CSS color (hex)
  opacity: number        // 0..1
}

export interface ImageWatermarkConfig {
  file: File | null
  url: string
  img: HTMLImageElement | null
  width: number
  height: number
  scale: number          // 0..1 of source-image short edge → controls watermark size
  opacity: number        // 0..1
}

export type TiledMode = 'text' | 'image'

export interface TiledConfig {
  mode: TiledMode
  gapX: number           // px gap between tiles (relative to source image)
  gapY: number
  opacity: number
}

export interface PositionConfig {
  anchor: Anchor
  x: number              // 0..1 ratio coordinate (used when anchor === 'custom')
  y: number              // 0..1
}

export type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp'

export interface OutputConfig {
  format: OutputFormat
  quality: number        // 0..1 — only for jpeg/webp
  maxEdge: number | null // null = keep original size; otherwise scale longest edge to this
}

export interface WatermarkState {
  source: SourceImage | null
  type: WatermarkType
  text: TextConfig
  image: ImageWatermarkConfig
  tiled: TiledConfig
  position: PositionConfig
  rotationDeg: number
  output: OutputConfig
}

export const DEFAULT_TEXT: TextConfig = {
  content: '© Watermark',
  fontFamily: 'Inter',
  fontSize: 48,
  color: '#FFFFFF',
  opacity: 0.6,
}

export const DEFAULT_IMAGE: ImageWatermarkConfig = {
  file: null,
  url: '',
  img: null,
  width: 0,
  height: 0,
  scale: 0.2,
  opacity: 0.7,
}

export const DEFAULT_TILED: TiledConfig = {
  mode: 'text',
  gapX: 80,
  gapY: 80,
  opacity: 0.25,
}

export const DEFAULT_POSITION: PositionConfig = {
  anchor: 'br',
  x: 0.9,
  y: 0.9,
}

export const DEFAULT_OUTPUT: OutputConfig = {
  format: 'original',
  quality: 0.92,
  maxEdge: null,
}
