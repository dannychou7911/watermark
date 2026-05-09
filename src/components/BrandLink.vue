<script setup lang="ts">
import { ImagePlus } from 'lucide-vue-next'
import { useWatermarkStore } from '@/composables/use-watermark-store'

const store = useWatermarkStore()

defineProps<{
  /** When true, render larger title (used on the home/UploadZone screen) */
  large?: boolean
}>()

const emit = defineEmits<{ (e: 'click'): void }>()

function handleClick() {
  store.clearSource()
  emit('click')
}
</script>

<template>
  <button
    type="button"
    class="flex items-center gap-2 rounded-md -mx-1 px-1 py-1 hover:bg-muted transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    aria-label="回到首頁"
    title="回到首頁"
    @click="handleClick"
  >
    <span
      class="rounded-lg bg-primary text-primary-foreground grid place-items-center shrink-0"
      :class="large ? 'w-9 h-9' : 'w-9 h-9'"
    >
      <ImagePlus class="w-5 h-5" :stroke-width="2.25" />
    </span>
    <div class="text-left">
      <h1
        class="font-semibold leading-tight"
        :class="large ? 'text-lg' : 'text-base md:text-lg'"
      >
        Watermark
      </h1>
      <p v-if="large" class="text-xs text-muted-foreground">
        純前端離線浮水印工具
      </p>
    </div>
  </button>
</template>
