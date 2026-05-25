import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: path.resolve(__dirname, "../../shared"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-router-dom") ||
              id.includes("react-dom") ||
              id.includes("\\react\\") ||
              id.includes("/react/")
            ) {
              return "react-vendor";
            }

            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }

            if (id.includes("motion")) {
              return "motion-vendor";
            }

            if (id.includes("axios")) {
              return "data-vendor";
            }
          }

          if (
            id.includes(`${path.sep}src${path.sep}components${path.sep}layout${path.sep}`) ||
            id.includes(`${path.sep}src${path.sep}features${path.sep}auth${path.sep}`) ||
            id.includes(`${path.sep}src${path.sep}features${path.sep}cart${path.sep}`)
          ) {
            return "app-shell";
          }
        },
      },
    },
  },
})
