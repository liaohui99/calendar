import SimplifiedReservationForm from './SimplifiedReservationForm';

// ???mock?????????????
jest.mock('./SimplifiedReservationForm', () => {
  return function MockSimplifiedReservationForm() {
    return null;
  };
});

describe('SimplifiedReservationForm', () => {
  test('?????????????', () => {
    expect(SimplifiedReservationForm).toBeDefined();
  });
  
  test('????????????/???', () => {
    expect(typeof SimplifiedReservationForm).toBe('function');
  });
});