import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from "@suid/vite-plugin";

export default defineConfig(({ mode }) => ({
  plugins: [suidPlugin(), solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  base: mode === 'production' ? '/delphi-view/' : '/',
}));
