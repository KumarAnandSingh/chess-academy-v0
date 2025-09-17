import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Make environment variables available at build time
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL || 'https://web-production-4fb4.up.railway.app'),
    },
    envPrefix: 'VITE_', // Only expose env variables prefixed with VITE_
  }
})
