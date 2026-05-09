<script setup lang="ts">
import { ref } from 'vue'
import { Upload, ShieldCheck } from 'lucide-vue-next'
import BrandLink from './BrandLink.vue'
import { useWatermarkStore } from '@/composables/use-watermark-store'
import { loadImageFromFile, pickFirstImage } from '@/lib/image-loader'

const store = useWatermarkStore()
const dragActive = ref(false)
const errorMsg = ref<string | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

async function handleFiles(files: FileList | File[] | null) {
  errorMsg.value = null
  const file = pickFirstImage(files)
  if (!file) {
    errorMsg.value = '請選擇有效的圖片檔（JPG / PNG / WebP / GIF / BMP）'
    return
  }
  try {
    const loaded = await loadImageFromFile(file)
    store.setSource(loaded)
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : '圖片載入失敗'
  }
}

function onChange(e: Event) {
  const input = e.target as HTMLInputElement
  void handleFiles(input.files)
  input.value = '' // allow re-selecting the same file
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragActive.value = false
  void handleFiles(e.dataTransfer?.files ?? null)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragActive.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  dragActive.value = false
}

function openPicker() {
  inputRef.value?.click()
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="px-6 py-5">
      <BrandLink large @click="errorMsg = null" />
    </header>

    <main class="flex-1 px-6 pb-10 grid place-items-center">
      <div class="w-full max-w-2xl">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-center">
          給你的圖片加上浮水印
        </h2>
        <p
          class="mt-3 text-base md:text-lg text-muted-foreground text-center max-w-xl mx-auto"
        >
          支援文字、Logo、平鋪三種模式。所有處理都在你的瀏覽器內進行，圖片不會離開裝置。
        </p>

        <button
          type="button"
          class="mt-10 w-full rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors duration-200 cursor-pointer p-12 md:p-16 grid place-items-center"
          :class="{ 'border-primary bg-primary/10': dragActive }"
          @click="openPicker"
          @drop="onDrop"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          aria-label="點擊或拖拉圖片到此處上傳"
        >
          <div class="flex flex-col items-center gap-4 text-center">
            <div
              class="w-14 h-14 rounded-full bg-primary/10 text-primary grid place-items-center"
            >
              <Upload class="w-6 h-6" :stroke-width="2" />
            </div>
            <div>
              <p class="text-base font-medium">
                拖曳圖片到這裡，或<span class="text-primary">點擊選擇檔案</span>
              </p>
              <p class="text-sm text-muted-foreground mt-1">
                支援 JPG · PNG · WebP · GIF · BMP
              </p>
            </div>
          </div>
        </button>

        <input
          ref="inputRef"
          type="file"
          class="sr-only"
          accept="image/*"
          @change="onChange"
        />

        <p
          v-if="errorMsg"
          role="alert"
          class="mt-4 text-sm text-destructive text-center"
        >
          {{ errorMsg }}
        </p>

        <div class="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck class="w-4 h-4 text-accent" :stroke-width="2.25" />
          <span>圖片不會上傳到任何伺服器</span>
        </div>
      </div>
    </main>
  </div>
</template>
