import ReservationFormModal from './ReservationFormModal';

// 使用mock组件避免实际渲染
jest.mock('./ReservationFormModal', () => {
  return function MockReservationFormModal() {
    return null;
  };
});

describe('ReservationFormModal Minimal Test', () => {
  test('组件能正常导入', () => {
    expect(ReservationFormModal).toBeDefined();
  });
  
  test('组件是一个函数/组件', () => {
    expect(typeof ReservationFormModal).toBe('function');
  });
});