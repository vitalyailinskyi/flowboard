import { ref } from 'vue';

const isDark = ref(document.documentElement.classList.contains('dark'));

export function useTheme() {
  function setTheme(dark: boolean) {
    isDark.value = dark;
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  const toggle = () => setTheme(!isDark.value);

  return { isDark, toggle };
}
