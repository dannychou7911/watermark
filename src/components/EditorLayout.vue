<script setup lang="ts">
import { ImagePlus, RotateCcw } from 'lucide-vue-next'
import PreviewCanvas from './PreviewCanvas.vue'
import WatermarkTypeTabs from './panels/WatermarkTypeTabs.vue'
import TextWatermarkPanel from './panels/TextWatermarkPanel.vue'
import ImageWatermarkPanel from './panels/ImageWatermarkPanel.vue'
import TiledWatermarkPanel from './panels/TiledWatermarkPanel.vue'
import PositionControls from './panels/PositionControls.vue'
import RotationControl from './panels/RotationControl.vue'
import OutputPanel from './panels/OutputPanel.vue'
import { useWatermarkStore } from '@/composables/use-watermark-store'

const store = useWatermarkStore()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header
      class="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30"
    >
      <div class="mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shrink-0"
        >
          <ImagePlus class="w-5 h-5" :stroke-width="2.25" />
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-base md:text-lg font-semibold leading-tight">
            Watermark
          </h1>
          <p class="text-xs text-muted-foreground truncate">
            {{ store.state.source?.file.name }} —
            {{ store.state.source?.width }} × {{ store.state.source?.height }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 cursor-pointer"
          @click="store.reset()"
        >
          <RotateCcw class="w-4 h-4" />
          換一張
        </button>
      </div>
    </header>

    <main class="flex-1">
      <div
        class="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6 grid gap-4 md:gap-6 lg:grid-cols-[1fr_360px]"
      >
        <!-- Preview -->
        <section
          class="rounded-xl border border-border bg-card p-3 md:p-4 flex flex-col"
        >
          <PreviewCanvas />
        </section>

        <!-- Controls -->
        <aside class="flex flex-col gap-4">
          <WatermarkTypeTabs />

          <div class="rounded-xl border border-border bg-card p-4">
            <TextWatermarkPanel v-if="store.state.type === 'text'" />
            <ImageWatermarkPanel v-else-if="store.state.type === 'image'" />
            <TiledWatermarkPanel v-else-if="store.state.type === 'tiled'" />
          </div>

          <div class="rounded-xl border border-border bg-card p-4">
            <h3 class="text-sm font-semibold mb-3">位置 &amp; 角度</h3>
            <PositionControls />
            <div class="mt-4">
              <RotationControl />
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card p-4">
            <h3 class="text-sm font-semibold mb-3">輸出</h3>
            <OutputPanel />
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
