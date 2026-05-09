<script setup lang="ts">
import { computed } from 'vue'
import Field from '@/components/ui/Field.vue'
import Slider from '@/components/ui/Slider.vue'
import { useWatermarkStore } from '@/composables/use-watermark-store'

const store = useWatermarkStore()
const text = computed(() => store.state.text)

const FONT_OPTIONS = [
  { label: 'Inter (Sans)', value: 'Inter' },
  { label: 'Helvetica (Sans)', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia (Serif)', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Courier (Mono)', value: 'Courier New, Courier, monospace' },
  { label: '系統預設', value: 'system-ui, sans-serif' },
]
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-sm font-semibold">文字浮水印</h3>

    <Field label="文字內容">
      <input
        type="text"
        :value="text.content"
        @input="
          store.patchText({ content: ($event.target as HTMLInputElement).value })
        "
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors duration-200"
        placeholder="© Your Brand"
      />
    </Field>

    <Field label="字型">
      <select
        :value="text.fontFamily"
        @change="
          store.patchText({
            fontFamily: ($event.target as HTMLSelectElement).value,
          })
        "
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors duration-200"
      >
        <option v-for="f in FONT_OPTIONS" :key="f.value" :value="f.value">
          {{ f.label }}
        </option>
      </select>
    </Field>

    <Field label="顏色">
      <div class="flex items-center gap-2">
        <input
          type="color"
          :value="text.color"
          @input="
            store.patchText({ color: ($event.target as HTMLInputElement).value })
          "
          class="h-10 w-12 cursor-pointer rounded-md border border-input bg-background"
          aria-label="文字顏色"
        />
        <input
          type="text"
          :value="text.color"
          @input="
            store.patchText({ color: ($event.target as HTMLInputElement).value })
          "
          class="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </Field>

    <Field label="文字大小">
      <Slider
        :model-value="text.fontSize"
        :min="12"
        :max="200"
        :step="1"
        unit="px"
        @update:model-value="(v) => store.patchText({ fontSize: v })"
      />
    </Field>

    <Field label="不透明度">
      <Slider
        :model-value="text.opacity"
        :min="0"
        :max="1"
        :step="0.01"
        :decimals="2"
        @update:model-value="(v) => store.patchText({ opacity: v })"
      />
    </Field>
  </div>
</template>
