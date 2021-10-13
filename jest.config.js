module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  roots: ["<rootDir>/src/", "<rootDir>/test/"],
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1"
  }
};
