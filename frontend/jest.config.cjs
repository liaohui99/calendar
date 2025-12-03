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
    '\\.(css|less|scss|sass)$': 'jest-transform-css',
    // 为Semi UI组件库提供mock或正确的路径解析
    '@douyinfe/semi-ui(.*)$': '<rootDir>/node_modules/@douyinfe/semi-ui/lib/cjs$1',
    '@douyinfe/semi-icons(.*)$': '<rootDir>/node_modules/@douyinfe/semi-icons/lib/cjs$1',
    // 添加src路径别名
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  modulePaths: ['<rootDir>/src'],
  // ?????????????????，特别排除需要转换的ES模块包
  transformIgnorePatterns: [
    '/node_modules/(?!(@douyinfe/semi-ui|@douyinfe/semi-foundation|@babel/runtime|lodash-es|@mdx-js|vfile|vfile-message|unist-util-stringify-position|unist-util-visit|unist-util-visit-parents|unist-util-is|markdown-extensions|is-plain-obj|is-buffer)/)'
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