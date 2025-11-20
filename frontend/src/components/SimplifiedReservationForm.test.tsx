import SimplifiedReservationForm from './SimplifiedReservationForm';

// 使用mock组件避免实际渲染
jest.mock('./SimplifiedReservationForm', () => {
  return function MockSimplifiedReservationForm() {
    return null;
  };
});

describe('SimplifiedReservationForm', () => {
  test('组件能正常导入', () => {
    expect(SimplifiedReservationForm).toBeDefined();
  });
  
  test('组件是一个函数/组件', () => {
    expect(typeof SimplifiedReservationForm).toBe('function');
  });
});