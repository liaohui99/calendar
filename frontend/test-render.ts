// TypeScript测试脚本，用于验证组件导入和语法
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 处理ES模块中的__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock全局对象，避免Semi UI组件在Node环境中出错
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = {}
  // @ts-ignore
  global.document = {
    createElement: () => ({
      style: {},
      getBoundingClientRect: () => ({ width: 0, height: 0 })
    }),
    querySelector: () => null,
    head: { appendChild: () => null }
  }
  // @ts-ignore
  global.navigator = { userAgent: 'node.js' }
}

// Mock API服务
// @ts-ignore
const mockDeviceApi = {
  getDevices: async () => ({ data: [] })
};

// @ts-ignore
const mockReservationApi = {
  createReservation: async () => ({})
};

// 使用动态导入来避免直接依赖问题
try {
  console.log('开始测试组件导入...');
  
  // 首先检查文件是否存在
  const fs = await import('fs').then(m => m.promises);
  const componentPath = join(__dirname, './src/components/GeneralReservationForm.tsx');
  
  await fs.access(componentPath);
  console.log(`✅ 组件文件存在: ${componentPath}`);
  
  // 尝试导入模块（不渲染）
  console.log('尝试导入组件模块...');
  
  // 由于Node环境中直接渲染React组件比较复杂，我们只验证模块可以被导入
  // 这至少可以验证TypeScript语法和基本导入没有问题
  await import('./src/components/GeneralReservationForm');
  console.log('✅ 组件模块导入成功！');
  
  console.log('\n组件语法验证通过，这表明：');
  console.log('1. TypeScript语法正确');
  console.log('2. 模块导入路径正确');
  console.log('3. 基本的类型检查通过');
  
  // 注意：由于Node环境限制，无法在不设置完整JSDOM的情况下进行实际渲染
  console.log('\n提示：完整的组件渲染测试需要在浏览器环境或配置完整的JSDOM环境中进行');
  console.log('建议运行：npm run test 来执行Jest测试');
  
} catch (error: any) {
  console.error('❌ 测试失败:', error.message);
  
  if (error.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
    console.error('错误原因：Node.js无法识别.tsx扩展名');
    console.error('请确保使用：npx ts-node --esm test-render.ts 运行此脚本');
  } else if (error.code === 'ENOENT') {
    console.error('错误原因：组件文件不存在');
  } else {
    console.error('错误详情:', error.stack);
  }
}