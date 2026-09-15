import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Plain `defineConfig`: every suite covers a pure function or mocks `botid`, and
    // `defineVitestConfig` would boot Nuxt and regenerate the root `.nuxt` without the playground.
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
