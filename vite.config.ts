import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function viteBase() {
  const path = process.env.VITE_BASE_PATH
  if (!path || path === '/') return '/'
  return path.endsWith('/') ? path : `${path}/`
}

export default defineConfig({
  base: viteBase(),
  plugins: [react(), tailwindcss()],
})
