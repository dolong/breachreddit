import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { devvit } from '@devvit/start/vite';
import { breach } from './tools/breach-plugin';

export default defineConfig({
  plugins: [breach(), react(), tailwind(), devvit()],
});
