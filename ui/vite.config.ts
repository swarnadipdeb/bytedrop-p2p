import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  const env = loadEnv(mode, process.cwd());
  const backendTarget = env.VITE_BACKEND_HOST || 'http://localhost:8080';

  server: {
    allowedHosts: ['.loca.lt'],
    host: "::",
    port: 3000, // Vite dev server on a different port than backend
    proxy: {
      // Proxy POST /api/upload → http://localhost:8080/upload
      "/api/upload": {
        target: backendTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/upload/, "/upload"),
      },
      // Proxy GET /api/download/:port → http://localhost:8080/download/:port
      "^/api/download/.*": {
        target: backendTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/download/, "/download"),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
