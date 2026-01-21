import DOMPurify from 'dompurify'
import { computed } from 'vue'

export const useSanitize = (html: string) => {
  return computed(() => DOMPurify.sanitize(html))
}