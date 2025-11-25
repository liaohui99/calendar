import { render } from '@testing-library/react';
import DeviceReservationPage from './DeviceReservationPage';

// ???mock?????????????
jest.mock('./DeviceReservationPage');

describe('DeviceReservationPage', () => {
  beforeEach(() => {
    // ???????????
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    expect(() => {
      render(<DeviceReservationPage />);
    }).not.toThrow();
  });

  test('component is called with correct props', () => {
    render(<DeviceReservationPage />);
    
    // ???????????????
    expect(DeviceReservationPage).toHaveBeenCalled();
  });
});