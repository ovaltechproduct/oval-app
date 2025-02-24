import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // Base configuration
  base: '/',
  
  // Development server settings
  server: {
    port: 8080,
    host: true,
    fs: {
      strict: false // Allow serving files from outside the root directory
    }
  },

  // Build options
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },

  // Plugins configuration
  plugins: [
    react(),
    mode === 'development' && componentTagger()
  ].filter(Boolean),

  // Path resolution
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },

  // Public assets configuration
  publicDir: 'public',
  
  // Optimization settings
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
}));