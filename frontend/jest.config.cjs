/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // ???ES??üt?????????ts-jest
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true
      }
    }],
    '^.+\.(js|jsx)$': ['babel-jest', {
      presets: ['@babel/preset-env', '@babel/preset-react'],
    }],
  },
  // ??????????????????
  moduleDirectories: ['node_modules', 'src'],
  // ????CSS???????
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'jest-transform-css'
    // ?????Semi UI?????????mock???¨°????????????§á???
  },
  modulePaths: ['<rootDir>/src'],
  // ?????????????????
  transformIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  // ??????????ES???
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};