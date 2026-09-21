import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';


const projectRoot = path.resolve(__dirname);

export default defineConfig({
  plugins: [react()],
  

  resolve: {
    alias: {
      'react': path.resolve(projectRoot, 'node_modules/react'),
      'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
      '@': path.resolve(projectRoot, './src'), 
    },
    dedupe: ["react", "react-dom"],
  },
  

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/Bunker/app/controllers/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        },
      },
    },
  },
});
