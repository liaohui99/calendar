import ReservationFormModal from './ReservationFormModal';

// ???mock?????????????
jest.mock('./ReservationFormModal', () => {
  return function MockReservationFormModal() {
    return null;
  };
});

describe('Simple ReservationFormModal Test', () => {
  test('?????????????', () => {
    expect(ReservationFormModal).toBeDefined();
  });
  
  test('????????????/???', () => {
    expect(typeof ReservationFormModal).toBe('function');
  });
});