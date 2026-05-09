<script setup lang="ts">
import { computed } from 'vue'
import UploadZone from './components/UploadZone.vue'
import EditorLayout from './components/EditorLayout.vue'
import { provideWatermarkStore } from './composables/use-watermark-store'

const store = provideWatermarkStore()
const hasSource = computed(() => store.state.source !== null)
</script>

<template>
  <UploadZone v-if="!hasSource" />
  <EditorLayout v-else />
</template>
