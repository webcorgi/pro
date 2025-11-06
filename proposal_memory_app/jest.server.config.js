/**
 * Jest Configuration for Server Tests
 * 서버 테스트를 위한 Jest 설정
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^uuid$': require.resolve('uuid'),
  },
  collectCoverageFrom: [
    'server/**/*.{ts,js}',
    '!server/**/*.d.ts',
    '!server/**/__tests__/**',
    '!server/index.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/server',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.server.json',
      useESM: false,
    }],
    '^.+\\.js$': ['ts-jest', {
      tsconfig: 'tsconfig.server.json',
      useESM: false,
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!uuid)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.server.setup.js'],
};
