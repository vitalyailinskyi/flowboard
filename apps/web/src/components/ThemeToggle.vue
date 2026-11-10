<script setup lang="ts">
import { MoonIcon, SunIcon } from '@heroicons/vue/24/outline';
import { useTheme } from '../composables/useTheme';

const { isDark, toggle } = useTheme();
</script>

<template>
  <button
    type="button"
    class="fixed top-4 right-4 rounded-full p-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
    :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
    @click="toggle"
  >
    <SunIcon v-if="isDark" class="h-6 w-6" />
    <MoonIcon v-else class="h-6 w-6" />
  </button>
</template>
