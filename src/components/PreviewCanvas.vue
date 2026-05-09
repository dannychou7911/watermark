<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useWatermarkStore } from '@/composables/use-watermark-store'
import { useCanvasRender } from '@/composables/use-canvas-render'
import { useCanvasDrag } from '@/composables/use-canvas-drag'

const PREVIEW_MAX_EDGE = 1400 // cap canvas backing-store size for perf

const store = useWatermarkStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapperRef = ref<HTMLDivElement | null>(null)

const previewSize = computed(() => {
  const src = store.state.source
  if (!src) return { width: 0, height: 0 }
  const longEdge = Math.max(src.width, src.height)
  const scale = longEdge > PREVIEW_MAX_EDGE ? PREVIEW_MAX_EDGE / longEdge : 1
  return {
    width: Math.round(src.width * scale),
    height: Math.round(src.height * scale),
  }
})

function applyCanvasSize() {
  const c = canvasRef.value
  if (!c) return
  c.width = previewSize.value.width
  c.height = previewSize.value.height
}

watch(previewSize, applyCanvasSize, { immediate: false })
onMounted(applyCanvasSize)

// Keep the canvas painted from store changes
useCanvasRender(canvasRef)
// Drag-to-position for text & image watermark types
useCanvasDrag(canvasRef)
</script>

<template>
  <div
    ref="wrapperRef"
    class="relative flex-1 min-h-0 grid place-items-center bg-[image:linear-gradient(45deg,#0001_25%,transparent_25%),linear-gradient(-45deg,#0001_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#0001_75%),linear-gradient(-45deg,transparent_75%,#0001_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] rounded-md overflow-hidden"
  >
    <canvas
      ref="canvasRef"
      class="max-w-full max-h-[70vh] object-contain shadow-md"
      :class="store.state.type === 'tiled' ? 'cursor-default' : 'cursor-move'"
      :style="{ aspectRatio: `${previewSize.width} / ${previewSize.height}` }"
      :aria-label="`預覽：${store.state.source?.file.name ?? ''}`"
    />
  </div>
</template>
