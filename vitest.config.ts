// vitest.config.ts
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      exclude: [...configDefaults.exclude, 'e2e/**'],
      coverage: {
        exclude: [
          'src/services/http.ts',
          '**/http.ts',
          '**/*.config.*'
        ]
      },
      silent: true
    },
    root: fileURLToPath(new URL('./', import.meta.url))
  })
)
