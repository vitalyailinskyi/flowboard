<script setup lang="ts">
import { registerSchema } from '@app/shared';
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { ApiError } from '../api/client';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({ email: '', password: '' });
const errors = ref<Record<string, string[] | undefined>>({});
const serverError = ref('');
const loading = ref(false);

async function submit() {
  serverError.value = '';
  const parsed = registerSchema.safeParse(form);
  if (!parsed.success) {
    errors.value = parsed.error.flatten().fieldErrors;
    return;
  }
  errors.value = {};
  loading.value = true;
  try {
    await auth.register(parsed.data);
    router.push('/');
  } catch (e) {
    serverError.value =
      e instanceof ApiError && e.status === 409 ? 'Этот email уже занят' : 'Что-то пошло не так';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <form class="card" @submit.prevent="submit">
      <h1 class="flex justify-center text-2xl font-bold">Регистрация</h1>

      <div>
        <input
          v-model="form.email"
          type="email"
          autocomplete="email"
          placeholder="Email"
          class="input"
        />
        <p v-if="errors.email" class="error-text">{{ errors.email[0] }}</p>
      </div>

      <div>
        <input
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          placeholder="Пароль"
          class="input"
        />
        <p v-if="errors.password" class="error-text">{{ errors.password[0] }}</p>
      </div>

      <p v-if="serverError" class="error-text">{{ serverError }}</p>

      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? 'Создаём…' : 'Создать аккаунт' }}
      </button>

      <p class="text-sm text-center">
        Уже есть аккаунт?
        <RouterLink to="/login" class="link">Войти</RouterLink>
      </p>
    </form>
  </div>
</template>
