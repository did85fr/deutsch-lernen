import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    // Ajouter la configuration fastRefresh
    fastRefresh: true,
    // Désactiver le babel runtime pour éviter les conflits
    jsxRuntime: 'automatic',
  })],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['lucide-react']
  }
})
