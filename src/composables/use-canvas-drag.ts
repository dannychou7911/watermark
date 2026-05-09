import { onBeforeUnmount, watch, type Ref } from 'vue'
import { useWatermarkStore } from './use-watermark-store'

/**
 * Attach pointer-event listeners to a canvas so the user can drag the
 * watermark anywhere. Converts client coords → canvas-relative ratio
 * (0..1) and pushes to store.setCustomPosition().
 *
 * Tiled watermark fills the whole image — dragging it doesn't make sense,
 * so we no-op when state.type === 'tiled'.
 */
export function useCanvasDrag(canvasRef: Ref<HTMLCanvasElement | null>) {
  const store = useWatermarkStore()
  let dragging = false

  function clientToRatio(e: PointerEvent): { x: number; y: number } | null {
    const c = canvasRef.value
    if (!c) return null
    const rect = c.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    return { x, y }
  }

  function onPointerDown(e: PointerEvent) {
    if (store.state.type === 'tiled') return
    if (!store.state.source) return
    const r = clientToRatio(e)
    if (!r) return
    dragging = true
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    store.setCustomPosition(r.x, r.y)
    e.preventDefault()
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return
    const r = clientToRatio(e)
    if (!r) return
    store.setCustomPosition(r.x, r.y)
  }

  function onPointerUp(e: PointerEvent) {
    dragging = false
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
  }

  function attach(canvas: HTMLCanvasElement) {
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.style.touchAction = 'none' // disable browser scroll on touch drag
  }

  function detach(canvas: HTMLCanvasElement) {
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
  }

  // (Re)attach whenever the canvas element identity changes
  watch(
    canvasRef,
    (next, prev) => {
      if (prev) detach(prev)
      if (next) attach(next)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (canvasRef.value) detach(canvasRef.value)
  })
}
