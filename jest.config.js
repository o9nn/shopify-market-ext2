module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/migrations/**',
    '!server/models/index.js',
    '!**/node_modules/**'
  ],
  testMatch: [
    '**/server/**/__tests__/**/*.test.js',
    '**/server/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/server/__tests__/setup.js'],
  testTimeout: 10000,
  verbose: true
};
