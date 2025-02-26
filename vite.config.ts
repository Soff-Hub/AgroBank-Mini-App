import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["antd"],
  },
  server: {
    host: true,
    port: 3838
  },
  preview: {
    allowedHosts: ["hard.agro-net.uz"]
  }
})
