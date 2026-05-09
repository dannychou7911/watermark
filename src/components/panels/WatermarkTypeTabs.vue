<script setup lang="ts">
import { Type, Image as ImageIcon, Grid3x3 } from 'lucide-vue-next'
import { useWatermarkStore } from '@/composables/use-watermark-store'
import type { WatermarkType } from '@/types/watermark'

const store = useWatermarkStore()

const tabs: Array<{ value: WatermarkType; label: string; icon: typeof Type }> = [
  { value: 'text', label: '文字', icon: Type },
  { value: 'image', label: '圖片', icon: ImageIcon },
  { value: 'tiled', label: '平鋪', icon: Grid3x3 },
]
</script>

<template>
  <div
    role="tablist"
    aria-label="選擇浮水印類型"
    class="rounded-xl border border-border bg-card p-1 grid grid-cols-3 gap-1"
  >
    <button
      v-for="t in tabs"
      :key="t.value"
      type="button"
      role="tab"
      :aria-selected="store.state.type === t.value"
      class="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer"
      :class="
        store.state.type === t.value
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted'
      "
      @click="store.setType(t.value)"
    >
      <component :is="t.icon" class="w-4 h-4" :stroke-width="2.25" />
      {{ t.label }}
    </button>
  </div>
</template>
