import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    global: 'globalThis',
    self: 'globalThis',
    window: 'globalThis',
  },
  publicDir: false,
  build: {
    emptyOutDir: false,
    target: 'es2015',
    lib: {
      entry: 'pocketbase/google-jwt.entry.js',
      formats: ['cjs'],
      fileName: () => 'google_jwt.js',
    },
    outDir: 'pocketbase/hooks',
    rolldownOptions: {
      output: {
        exports: 'named',
      },
    },
  },
})
