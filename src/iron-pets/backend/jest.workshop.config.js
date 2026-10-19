module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/workshop'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/workshop/env.cjs'],
  clearMocks: true,
  testTimeout: 10000,
};
