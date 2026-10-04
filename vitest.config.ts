import { defineConfig, configDefaults } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    // Playwright specs under e2e/ are browser tests, not unit tests. Without this
    // Vitest's default include (`**/*.{test,spec}.ts`) would try to run them.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});