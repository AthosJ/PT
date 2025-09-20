// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.+(js|jsx)',
    '<rootDir>/**/*.(spec|test).+(js|jsx)'
  ],

  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',           // todos los .js
    '!config/**',
    '!coverage/**',
    '!**/__tests__/**',
    '!testConn.js',
    '!jest.config.js',   // <— añadimos
    '!index.js'          // <— añadimos
  ],

  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['text', 'lcov']
};
