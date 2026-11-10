import type { LoginInput, RegisterInput } from '@app/shared';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api, refreshAccessToken, setAccessToken, setOnSessionLost } from '../api/client';

export interface User {
  id: number;
  email: string;
  name: string | null;
}
interface AuthResponse {
  user: User;
  accessToken: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const ready = ref(false);
  const isAuthenticated = computed(() => user.value !== null);

  setOnSessionLost(() => {
    user.value = null;
  });

  async function init() {
    try {
      if (await refreshAccessToken(null)) {
        user.value = (await api<{ user: User }>('/auth/me')).user;
      }
    } finally {
      ready.value = true;
    }
  }

  async function login(input: LoginInput) {
    const data = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setAccessToken(data.accessToken);
    user.value = data.user;
  }

  async function register(input: RegisterInput) {
    const data = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setAccessToken(data.accessToken);
    user.value = data.user;
  }

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
      user.value = null;
    }
  }

  return { user, ready, isAuthenticated, init, login, register, logout };
});
