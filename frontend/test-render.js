// 简化的测试脚本，检查组件导入和基本语法
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 处理ES模块中的__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 由于Node.js不直接支持.tsx扩展名，我们使用ts-node来运行
console.log('这个脚本需要使用ts-node --esm运行');
console.log('正在尝试检查组件文件是否存在...');

// 检查文件是否存在
import('fs').then(fs => {
  const modulePath = join(__dirname, './src/components/GeneralReservationForm.tsx');
  
  fs.promises.access(modulePath)
    .then(() => {
      console.log(`✅ 文件存在: ${modulePath}`);
      console.log('\n请使用以下命令运行TypeScript组件测试:');
      console.log('npx ts-node --esm test-render.ts');
    })
    .catch(err => {
      console.error(`❌ 文件不存在: ${modulePath}`);
    });
});

// 我们也可以尝试使用vite直接构建项目来验证组件语法
console.log('\n或者使用以下命令构建项目来验证组件:');
console.log('npm run build')