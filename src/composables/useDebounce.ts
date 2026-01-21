import { ref, onUnmounted } from 'vue';

export function useDebounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait = 450
) {
  const timer = ref<ReturnType<typeof setTimeout> | null>(null);

  const debounced = (...args: Parameters<T>) => {
    if (timer.value) {
      clearTimeout(timer.value);
    }

    timer.value = setTimeout(() => {
      fn(...args);
      timer.value = null;
    }, wait);
  };

  const cancel = () => {
    if (timer.value) {
      clearTimeout(timer.value);
      timer.value = null;
    }
  };
  onUnmounted(cancel);

  return { debounced, cancel };
}