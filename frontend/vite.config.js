// frontend/vite.config.js
const { defineConfig } = require('vite');

module.exports = async () => {
  const react = (await import('@vitejs/plugin-react')).default;

  return defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      coverage: {
        reporter: ['text', 'lcov'],
        exclude: [
          'node_modules',
          'public',
          'src/**/*.css',
          'eslint.config.js',
          'postcss.config.js',
          'tailwind.config.js',
          'vite.config.js',
          'src/main.jsx',
          'src/App.jsx',
          'src/pages/AdminPanel.jsx',
          'src/pages/Dashboard.jsx',
          'src/pages/Editor.jsx',
          'src/pages/Home.jsx',
          'src/pages/Profile.jsx'
        ]
      }
    }
  });
};
