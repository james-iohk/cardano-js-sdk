module.exports = {
  coveragePathIgnorePatterns: ['.config.js'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash'
  },
  preset: 'ts-jest',
  testTimeout: process.env.CI ? 120_000 : 12_000,
  transform: {
    '^.+\\.test.ts?$': 'ts-jest'
  }
};
