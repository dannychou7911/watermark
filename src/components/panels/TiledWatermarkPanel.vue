<script setup lang="ts">
import { computed } from 'vue'
import { Type, Image as ImageIcon } from 'lucide-vue-next'
import Field from '@/components/ui/Field.vue'
import Slider from '@/components/ui/Slider.vue'
import { useWatermarkStore } from '@/composables/use-watermark-store'
import type { TiledMode } from '@/types/watermark'

const store = useWatermarkStore()
const tiled = computed(() => store.state.tiled)

const MODES: Array<{ value: TiledMode; label: string; icon: typeof Type }> = [
  { value: 'text', label: '文字', icon: Type },
  { value: 'image', label: '圖片', icon: ImageIcon },
]
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-sm font-semibold">平鋪浮水印（防盜用）</h3>

    <Field label="平鋪內容來源">
      <div class="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted">
        <button
          v-for="m in MODES"
          :key="m.value"
          type="button"
          :aria-pressed="tiled.mode === m.value"
          class="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer"
          :class="
            tiled.mode === m.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-card'
          "
          @click="store.patchTiled({ mode: m.value })"
        >
          <component :is="m.icon" class="w-3.5 h-3.5" />
          {{ m.label }}
        </button>
      </div>
    </Field>

    <p class="text-[11px] text-muted-foreground">
      使用「文字」分頁或「圖片」分頁裡的設定作為平鋪內容
    </p>

    <Field label="水平間距">
      <Slider
        :model-value="tiled.gapX"
        :min="0"
        :max="400"
        :step="4"
        unit="px"
        @update:model-value="(v) => store.patchTiled({ gapX: v })"
      />
    </Field>

    <Field label="垂直間距">
      <Slider
        :model-value="tiled.gapY"
        :min="0"
        :max="400"
        :step="4"
        unit="px"
        @update:model-value="(v) => store.patchTiled({ gapY: v })"
      />
    </Field>

    <Field label="不透明度">
      <Slider
        :model-value="tiled.opacity"
        :min="0"
        :max="1"
        :step="0.01"
        :decimals="2"
        @update:model-value="(v) => store.patchTiled({ opacity: v })"
      />
    </Field>
  </div>
</template>
