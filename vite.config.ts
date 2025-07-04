import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/alternate/', // 👈 sets base path for deployment
  plugins: [react()]
})
