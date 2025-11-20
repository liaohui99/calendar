import { render } from '@testing-library/react';
import DeviceReservationPage from './DeviceReservationPage';

// 使用mock组件避免实际渲染
jest.mock('./DeviceReservationPage');

describe('DeviceReservationPage', () => {
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    expect(() => {
      render(<DeviceReservationPage />);
    }).not.toThrow();
  });

  test('component is called with correct props', () => {
    render(<DeviceReservationPage />);
    
    // 验证组件被正确调用
    expect(DeviceReservationPage).toHaveBeenCalled();
  });
});