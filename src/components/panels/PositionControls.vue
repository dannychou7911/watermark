<script setup lang="ts">
import { computed } from 'vue'
import { useWatermarkStore } from '@/composables/use-watermark-store'
import type { Anchor } from '@/types/watermark'

const store = useWatermarkStore()
const anchor = computed(() => store.state.position.anchor)

const GRID: Array<{ value: Exclude<Anchor, 'custom'>; label: string }> = [
  { value: 'tl', label: '左上' },
  { value: 'tc', label: '上中' },
  { value: 'tr', label: '右上' },
  { value: 'cl', label: '左中' },
  { value: 'cc', label: '中央' },
  { value: 'cr', label: '右中' },
  { value: 'bl', label: '左下' },
  { value: 'bc', label: '下中' },
  { value: 'br', label: '右下' },
]
</script>

<template>
  <div class="space-y-2">
    <div
      class="grid grid-cols-3 gap-1.5 p-1.5 rounded-lg bg-muted aspect-square w-32"
      role="group"
      aria-label="位置快選 9 宮格"
    >
      <button
        v-for="cell in GRID"
        :key="cell.value"
        type="button"
        :aria-label="cell.label"
        :aria-pressed="anchor === cell.value"
        class="rounded-md transition-colors duration-200 cursor-pointer flex items-center justify-center"
        :class="
          anchor === cell.value
            ? 'bg-primary'
            : 'bg-card hover:bg-primary/30 ring-1 ring-border'
        "
        @click="store.setAnchor(cell.value)"
      >
        <span
          class="block w-2 h-2 rounded-full"
          :class="anchor === cell.value ? 'bg-primary-foreground' : 'bg-muted-foreground/40'"
        />
      </button>
    </div>
    <p v-if="anchor === 'custom'" class="text-[11px] text-accent flex items-center gap-1">
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
      自訂位置 · 拖拉預覽圖以微調
    </p>
    <p v-else class="text-[11px] text-muted-foreground">
      或直接拖拉預覽圖中的浮水印
    </p>
  </div>
</template>
