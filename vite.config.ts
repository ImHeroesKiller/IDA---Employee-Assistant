import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use a base of '/' for local development and root deployments.
  // For GitHub Pages deployment, you will need to change this to your repo name.
  // e.g., base: '/my-repo-name/'
  base: '/', 
  define: {
    // This ensures that process.env.API_KEY is replaced during the build.
    // In a local dev environment with a .env file, it will use the key.
    // For a GitHub Pages build without a key, it becomes `undefined`,
    // correctly triggering the mock service fallback in geminiService.ts.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})