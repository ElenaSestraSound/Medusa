export {};
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.tsx'], // Adjust the glob pattern to match your source code files
  coverageReporters: ['lcov', 'text-summary'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['./tests/setupTests.ts'],
  modulePaths: ['<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coveragePathIgnorePatterns: ['node_modules'],
  transformIgnorePatterns: ['node_modules/(?!variables/.*)'],
  extensionsToTreatAsEsm: ['.ts'],
};
