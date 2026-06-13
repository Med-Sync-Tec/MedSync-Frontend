/** Jest configuration — replaces vitest.config.ts (rúbrica: uso obligatorio de Jest). */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  setupFiles: ['<rootDir>/src/test/jest.env.cjs'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { configFile: './babel.jest.cjs' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ui/(.*)$': '<rootDir>/src/components/ui/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@layouts/(.*)$': '<rootDir>/src/layouts/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@mocks/(.*)$': '<rootDir>/src/mocks/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '\\.css$': 'identity-obj-proxy',
  },
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.stories.tsx',
    '!src/**/*.test.{ts,tsx}',
    '!src/test/**',
    '!src/mocks/**',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/types.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
