import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { diagramsApiPlugin } from './vite-plugin-diagrams-api.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), diagramsApiPlugin()],
})
