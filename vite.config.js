import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['group-work-10-frontend.onrender.com']
  },
  preview: {
    host: true,
    allowedHosts: ['group-work-10-frontend.onrender.com']
  }
})
