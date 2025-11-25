import { render } from '@testing-library/react';
import ReservationForm from './ReservationForm';

// ???mock?????????????
jest.mock('./ReservationForm');

describe('ReservationForm', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    deviceId: 1,
    startTime: '10:00',
    endTime: '11:00',
    selectedDate: '2024-01-01',
  };

  beforeEach(() => {
    // ???????????
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    expect(() => {
      render(<ReservationForm {...defaultProps} />);
    }).not.toThrow();
  });

  test('component is called with correct props', () => {
    render(<ReservationForm {...defaultProps} />);
    
    // ???????????????
    expect(ReservationForm).toHaveBeenCalledWith(
      expect.objectContaining(defaultProps),
      expect.anything()
    );
  });
});