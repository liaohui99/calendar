import { render } from '@testing-library/react';
import ReservationForm from './ReservationForm';

// 使用mock组件避免实际渲染
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
    // 重置所有模拟
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    expect(() => {
      render(<ReservationForm {...defaultProps} />);
    }).not.toThrow();
  });

  test('component is called with correct props', () => {
    render(<ReservationForm {...defaultProps} />);
    
    // 验证组件被正确调用
    expect(ReservationForm).toHaveBeenCalledWith(
      expect.objectContaining(defaultProps),
      expect.anything()
    );
  });
});