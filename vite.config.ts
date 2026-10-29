import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [cloudflare()],
  build: { sourcemap: false },
  server: { host: '127.0.0.1', port: 5188, strictPort: true },
})
