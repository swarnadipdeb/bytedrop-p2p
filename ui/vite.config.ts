import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const backendTarget = env.VITE_BACKEND_HOST || 'http://localhost:8080';
  
  return defineConfig({
    server: {
      host: '::',
      port: 3000,
      proxy: {
        '/api/upload': {
          target: backendTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/upload/, '/upload'),
        },
        '^/api/download/.*': {
          target: backendTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/download/, '/download'),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
  });
};
