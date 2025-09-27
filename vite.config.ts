import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace 'ida-employee-assistant' with the name of your GitHub repository.
  // For example, if your repo URL is https://github.com/your-name/my-cool-app,
  // set base to '/my-cool-app/'.
  base: '/ida-employee-assistant/', 
  define: {
    // This ensures that process.env.API_KEY is replaced during the build.
    // In a local dev environment with a .env file, it will use the key.
    // For a GitHub Pages build without a key, it becomes `undefined`,
    // correctly triggering the mock service fallback in geminiService.ts.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
