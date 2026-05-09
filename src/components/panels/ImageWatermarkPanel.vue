<script setup lang="ts">
import { computed, ref } from 'vue'
import { Upload, X } from 'lucide-vue-next'
import Field from '@/components/ui/Field.vue'
import Slider from '@/components/ui/Slider.vue'
import { useWatermarkStore } from '@/composables/use-watermark-store'
import { loadImageFromFile, pickFirstImage } from '@/lib/image-loader'

const store = useWatermarkStore()
const img = computed(() => store.state.image)
const inputRef = ref<HTMLInputElement | null>(null)
const errorMsg = ref<string | null>(null)

async function onChange(e: Event) {
  errorMsg.value = null
  const file = pickFirstImage((e.target as HTMLInputElement).files)
  if (!file) return
  try {
    const loaded = await loadImageFromFile(file)
    store.patchImage({
      file: loaded.file,
      url: loaded.url,
      img: loaded.img,
      width: loaded.width,
      height: loaded.height,
    })
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : '圖片載入失敗'
  }
  ;(e.target as HTMLInputElement).value = ''
}

function clearImage() {
  if (img.value.url) URL.revokeObjectURL(img.value.url)
  store.patchImage({
    file: null,
    url: '',
    img: null,
    width: 0,
    height: 0,
  })
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-sm font-semibold">圖片浮水印（Logo）</h3>

    <Field label="浮水印圖片">
      <div v-if="img.img" class="flex items-center gap-3 p-2 rounded-md border border-border bg-background">
        <img :src="img.url" alt="" class="w-12 h-12 object-contain bg-muted rounded" />
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium truncate">{{ img.file?.name }}</p>
          <p class="text-[11px] text-muted-foreground">{{ img.width }} × {{ img.height }}</p>
        </div>
        <button
          type="button"
          class="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors duration-200 cursor-pointer"
          aria-label="移除圖片"
          @click="clearImage"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
      <button
        v-else
        type="button"
        class="w-full rounded-md border border-dashed border-border bg-background hover:border-primary hover:bg-primary/5 transition-colors duration-200 cursor-pointer p-6 flex flex-col items-center gap-2"
        @click="inputRef?.click()"
      >
        <Upload class="w-5 h-5 text-muted-foreground" />
        <span class="text-xs text-muted-foreground">點擊或選擇 PNG / 透明圖層</span>
      </button>
      <input
        ref="inputRef"
        type="file"
        class="sr-only"
        accept="image/*"
        @change="onChange"
      />
    </Field>

    <p v-if="errorMsg" role="alert" class="text-xs text-destructive">{{ errorMsg }}</p>

    <Field label="大小（佔短邊比例）">
      <Slider
        :model-value="img.scale"
        :min="0.05"
        :max="1"
        :step="0.01"
        :decimals="2"
        @update:model-value="(v) => store.patchImage({ scale: v })"
      />
    </Field>

    <Field label="不透明度">
      <Slider
        :model-value="img.opacity"
        :min="0"
        :max="1"
        :step="0.01"
        :decimals="2"
        @update:model-value="(v) => store.patchImage({ opacity: v })"
      />
    </Field>
  </div>
</template>
