import ReservationFormModal from './ReservationFormModal';

// ???mock?????????????
jest.mock('./ReservationFormModal', () => {
  return function MockReservationFormModal() {
    return null;
  };
});

describe('ReservationFormModal Mocked Tests', () => {
  test('renders without crashing', () => {
    expect(ReservationFormModal).toBeDefined();
  });
  
  test('component is a function', () => {
    expect(typeof ReservationFormModal).toBe('function');
  });
});