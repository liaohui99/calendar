/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // ???ES??�t?????????ts-jest
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
    // ?????Semi UI?????????mock???��????????????��???
  },
  modulePaths: ['<rootDir>/src'],
  // ?????????????????，特别排除需要转换的ES模块包
  transformIgnorePatterns: [
    '/node_modules/(?!(@douyinfe/semi-ui|@douyinfe/semi-foundation|@babel/runtime|lodash-es|@mdx-js|vfile|vfile-message|unist-util-stringify-position|unist-util-visit|unist-util-visit-parents|unist-util-is)/)'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  // ??????????ES???
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};