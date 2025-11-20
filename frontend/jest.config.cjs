/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // 针对ES模块环境正确配置ts-jest
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
  // 使用正确的模块解析配置
  moduleDirectories: ['node_modules', 'src'],
  // 处理CSS文件导入
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'jest-transform-css'
    // 移除对Semi UI组件库的强制mock，让测试文件能够自行控制
  },
  modulePaths: ['<rootDir>/src'],
  // 简化忽略转换的模块配置
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
  // 确保正确处理ES模块
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};