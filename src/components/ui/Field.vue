<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  inline?: boolean
}>()
</script>

<template>
  <div class="space-y-1.5" :class="{ 'flex items-center justify-between': inline }">
    <label class="text-xs font-medium text-foreground">{{ label }}</label>
    <div :class="inline ? '' : ''">
      <slot />
    </div>
    <p v-if="hint && !inline" class="text-[11px] text-muted-foreground">{{ hint }}</p>
  </div>
</template>
