<script setup lang="ts">
import { watch } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import ThemeToggle from './components/ThemeToggle.vue';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

watch(
  () => auth.isAuthenticated,
  (isAuth) => {
    if (!isAuth && route.meta.requiresAuth) router.push({ name: 'login' });
  },
);
</script>

<template>
  <ThemeToggle />
  <RouterView />
</template>
