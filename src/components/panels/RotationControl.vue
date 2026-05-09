<script setup lang="ts">
import { computed } from 'vue'
import Field from '@/components/ui/Field.vue'
import Slider from '@/components/ui/Slider.vue'
import { useWatermarkStore } from '@/composables/use-watermark-store'

const store = useWatermarkStore()
const rotation = computed(() => store.state.rotationDeg)

const QUICK = [-90, -45, 0, 45, 90]
</script>

<template>
  <Field label="旋轉角度">
    <Slider
      :model-value="rotation"
      :min="-180"
      :max="180"
      :step="1"
      unit="°"
      @update:model-value="(v) => store.setRotation(v)"
    />
    <div class="mt-2 flex flex-wrap gap-1.5">
      <button
        v-for="q in QUICK"
        :key="q"
        type="button"
        class="text-xs px-2 py-1 rounded-md transition-colors duration-200 cursor-pointer"
        :class="
          rotation === q
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-muted/70 text-muted-foreground'
        "
        @click="store.setRotation(q)"
      >
        {{ q }}°
      </button>
    </div>
  </Field>
</template>
