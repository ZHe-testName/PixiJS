<script lang="ts" setup >
  import { onMounted, onUnmounted, ref } from 'vue'
  import { createScene } from './scene';

  const host = ref<HTMLElement | null>(null)
  const shutdown = ref<(() => void) | null>(null)

  onMounted(async () => {
    if (!host.value) return

    shutdown.value = await createScene(host.value)
  })

  onUnmounted(() => {
    shutdown.value?.()
  })
</script>

<template>
  <h2>Text from Vue</h2>

  <div ref="host"></div>
</template>