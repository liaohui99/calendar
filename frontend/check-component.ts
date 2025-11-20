// 简单的TypeScript脚本，检查组件是否能正常导入

// 只导入组件，不进行渲染
import GeneralReservationForm from './src/components/GeneralReservationForm';

console.log('成功导入组件:', GeneralReservationForm.name || '组件导入成功');
console.log('组件类型:', typeof GeneralReservationForm);

// 如果成功运行到这里，说明导入没有问题
console.log('组件导入测试通过');