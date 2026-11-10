<script setup lang="ts">
import { loginSchema } from '@app/shared';
import { reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ApiError } from '../api/client';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = reactive({ email: '', password: '' });
const errors = ref<Record<string, string[] | undefined>>({});
const serverError = ref('');
const loading = ref(false);

async function submit() {
  serverError.value = '';
  const parsed = loginSchema.safeParse(form);

  if (!parsed.success) {
    errors.value = parsed.error.flatten().fieldErrors;
    return;
  }

  errors.value = {};
  loading.value = true;

  try {
    await auth.login(parsed.data);
    const redirect = route.query.redirect;
    router.push(typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/');
  } catch (e) {
    serverError.value =
      e instanceof ApiError && e.status === 401
        ? 'Неверный email или пароль'
        : 'Что-то пошло не так';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <form class="card" @submit.prevent="submit">
      <h1 class="text-2xl font-bold flex justify-center">Вход</h1>

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
          autocomplete="current-password"
          placeholder="Пароль"
          class="input"
        />
        <p v-if="errors.password" class="error-text">{{ errors.password[0] }}</p>
      </div>

      <p v-if="serverError" class="error-text">{{ serverError }}</p>

      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? 'Входим…' : 'Войти' }}
      </button>

      <p class="text-sm text-center">
        Нет аккаунта?
        <RouterLink to="/register" class="link">Регистрация</RouterLink>
      </p>
    </form>
  </div>
</template>
