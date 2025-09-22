// frontend/vite.config.js
const { defineConfig } = require('vite');

module.exports = async () => {
  // Importa el plugin React (ESM-only) en tiempo de ejecución
  const reactPlugin = (await import('@vitejs/plugin-react')).default;

  return defineConfig({
    plugins: [
      reactPlugin()
    ],
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

          // configs/build
          'eslint.config.js',
          'postcss.config.js',
          'tailwind.config.js',
          'vite.config.js',

          // entrypoints & shell
          'src/main.jsx',
          'src/App.jsx',

          // pages sin tests aún
          'src/pages/AdminPanel.jsx',
          'src/pages/Dashboard.jsx',
          'src/pages/Editor.jsx',
          'src/pages/Home.jsx',
          'src/pages/Profile.jsx'
        ]
      }
    }
    // agregar test restantes
  });
};
