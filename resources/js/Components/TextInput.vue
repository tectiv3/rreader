<script setup>
import { onMounted, ref } from 'vue'

const model = defineModel({
    type: String,
    required: true,
})

const input = ref(null)

onMounted(() => {
    if (input.value.hasAttribute('autofocus')) {
        input.value.focus()
    }
})

defineExpose({ focus: () => input.value.focus() })
</script>

<template>
    <input
        class="rounded-md border-neutral-700 bg-neutral-800 text-neutral-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-neutral-400"
        v-model="model"
        ref="input" />
</template>
