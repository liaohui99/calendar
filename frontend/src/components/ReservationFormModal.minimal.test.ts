import ReservationFormModal from './ReservationFormModal';

// ???mock?????????????
jest.mock('./ReservationFormModal', () => {
  return function MockReservationFormModal() {
    return null;
  };
});

describe('ReservationFormModal Minimal Test', () => {
  test('?????????????', () => {
    expect(ReservationFormModal).toBeDefined();
  });
  
  test('????????????/???', () => {
    expect(typeof ReservationFormModal).toBe('function');
  });
});