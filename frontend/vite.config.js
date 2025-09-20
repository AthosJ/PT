// vite.config.js
import { defineConfig } from 'vite';
import react      from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                 // <-- restore globals
    environment: 'jsdom',          // <-- browser-like DOM
    setupFiles: './src/setupTests.js',
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules',
        'public',
        'src/**/*.css',

        // configs/build
        'eslint.config.js',
        'postcss.config.js',
        'tailwind.config.js',
        'vite.config.js',

        // entrypoints & shell
        'src/main.jsx',
        'src/App.jsx',

        // pages without tests yet
        'src/pages/AdminPanel.jsx',
        'src/pages/Dashboard.jsx',
        'src/pages/Editor.jsx',
        'src/pages/Home.jsx',
        'src/pages/Profile.jsx'
      ]
    }
  }
});
