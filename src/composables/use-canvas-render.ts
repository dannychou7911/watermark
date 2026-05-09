import { onBeforeUnmount, watch, type Ref } from 'vue'
import { renderToCanvas } from '@/lib/canvas-renderer'
import { useWatermarkStore } from './use-watermark-store'

/**
 * Sync the given canvas with the watermark state. Re-renders whenever any
 * relevant reactive field changes. Caller is responsible for setting canvas
 * width/height (we only draw inside it).
 */
export function useCanvasRender(canvasRef: Ref<HTMLCanvasElement | null>) {
  const store = useWatermarkStore()
  let raf = 0

  function schedule() {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      const canvas = canvasRef.value
      if (canvas) renderToCanvas(canvas, store.state)
    })
  }

  // deep watch covers nested config changes (text/image/tiled/position/output)
  watch(() => store.state, schedule, { deep: true, immediate: true })

  onBeforeUnmount(() => {
    if (raf) cancelAnimationFrame(raf)
  })

  return { redraw: schedule }
}
