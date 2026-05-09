<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  unit?: string
  decimals?: number
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

function update(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  emit('update:modelValue', v)
}

function format(v: number) {
  if (props.decimals !== undefined) return v.toFixed(props.decimals)
  return String(v)
}
</script>

<template>
  <div class="flex items-center gap-3">
    <input
      type="range"
      :min="min ?? 0"
      :max="max ?? 100"
      :step="step ?? 1"
      :value="modelValue"
      class="flex-1 h-2 cursor-pointer accent-primary"
      @input="update"
    />
    <span class="text-xs text-muted-foreground w-14 text-right tabular-nums">
      {{ format(modelValue) }}{{ unit ?? '' }}
    </span>
  </div>
</template>
