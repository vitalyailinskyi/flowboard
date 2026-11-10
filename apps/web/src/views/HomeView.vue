<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
</script>

<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">Flowboard</h1>
    <p>Вы вошли как {{ auth.user?.email }}</p>
    <button class="btn-secondary" @click="auth.logout()">Выйти</button>
  </div>
</template>
