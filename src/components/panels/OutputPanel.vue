<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import Field from '@/components/ui/Field.vue'
import Slider from '@/components/ui/Slider.vue'
import { useWatermarkStore } from '@/composables/use-watermark-store'
import { exportToBlob, planExport } from '@/lib/output'
import { triggerDownload } from '@/lib/download'
import type { OutputFormat } from '@/types/watermark'

const store = useWatermarkStore()
const output = computed(() => store.state.output)
const downloading = ref(false)
const errorMsg = ref<string | null>(null)

const FORMATS: Array<{ value: OutputFormat; label: string }> = [
  { value: 'original', label: '保留原始格式' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG（透明）' },
  { value: 'webp', label: 'WebP' },
]

const showQuality = computed(() => {
  // planExport tells us whether the chosen format actually uses quality
  if (!store.state.source) return false
  try {
    return planExport(store.state).quality !== undefined
  } catch {
    return false
  }
})

const previewSize = computed(() => {
  if (!store.state.source) return null
  try {
    const p = planExport(store.state)
    return `${p.width} × ${p.height} · .${p.ext}`
  } catch {
    return null
  }
})

const maxEdgeEnabled = computed({
  get: () => output.value.maxEdge !== null,
  set: (v: boolean) =>
    store.patchOutput({ maxEdge: v ? Math.min(2000, longestEdge()) : null }),
})

function longestEdge(): number {
  const s = store.state.source
  if (!s) return 2000
  return Math.max(s.width, s.height)
}

async function onDownload() {
  if (downloading.value) return
  errorMsg.value = null
  downloading.value = true
  try {
    const { blob, filename } = await exportToBlob(store.state)
    triggerDownload(blob, filename)
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : '匯出失敗'
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <Field label="輸出格式">
      <select
        :value="output.format"
        @change="
          store.patchOutput({
            format: ($event.target as HTMLSelectElement).value as OutputFormat,
          })
        "
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option v-for="f in FORMATS" :key="f.value" :value="f.value">
          {{ f.label }}
        </option>
      </select>
    </Field>

    <Field v-if="showQuality" label="品質">
      <Slider
        :model-value="output.quality"
        :min="0.1"
        :max="1"
        :step="0.01"
        :decimals="2"
        @update:model-value="(v) => store.patchOutput({ quality: v })"
      />
    </Field>

    <div class="space-y-2">
      <label class="flex items-center gap-2 text-xs font-medium cursor-pointer">
        <input
          type="checkbox"
          :checked="maxEdgeEnabled"
          @change="
            (maxEdgeEnabled =
              ($event.target as HTMLInputElement).checked)
          "
          class="rounded border-input cursor-pointer accent-primary"
        />
        限制輸出最大長邊（縮圖）
      </label>
      <Slider
        v-if="output.maxEdge !== null"
        :model-value="output.maxEdge"
        :min="200"
        :max="4000"
        :step="50"
        unit="px"
        @update:model-value="(v) => store.patchOutput({ maxEdge: v })"
      />
    </div>

    <p v-if="previewSize" class="text-[11px] text-muted-foreground">
      將輸出：{{ previewSize }}
    </p>

    <button
      type="button"
      class="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2.5 text-sm font-semibold transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      :disabled="downloading || !store.state.source"
      @click="onDownload"
    >
      <Download class="w-4 h-4" :stroke-width="2.25" />
      {{ downloading ? '處理中…' : '下載結果圖' }}
    </button>

    <p v-if="errorMsg" role="alert" class="text-xs text-destructive">
      {{ errorMsg }}
    </p>
  </div>
</template>
