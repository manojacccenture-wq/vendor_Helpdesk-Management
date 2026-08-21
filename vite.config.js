import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: '/DBSTS/Home/VendorHelpdesk/',
    plugins: [
      tailwindcss(), 
      react(),
      mode === 'analyze' && visualizer({
        template: 'treemap',
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      })
    ].filter(Boolean),
  };
})
