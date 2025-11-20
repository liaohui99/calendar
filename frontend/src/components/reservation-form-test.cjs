const React = require('react');
const { render } = require('@testing-library/react');
require('@testing-library/jest-dom');

// 模拟所有依赖
jest.mock('../services/api', () => ({
  reservationApi: {
    createReservation: jest.fn().mockResolvedValue({ status: 200 })
  }
}));

jest.mock('dayjs', () => (dateStr) => ({
  format: (format) => dateStr || '2024-01-01 00:00',
  isBefore: () => false,
  isSame: () => false
}));

// 使用require导入组件
const ReservationFormModal = require('./ReservationFormModal').default;

describe('ReservationFormModal CJS Test', function() {
  const defaultProps = {
    visible: true,
    onClose: function() {},
    deviceId: 1,
    startTime: '10:00',
    endTime: '11:00',
    date: '2024-01-01',
    deviceName: 'Test Device'
  };

  beforeEach(function() {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  it('should render without crashing', function() {
    expect(function() {
      render(React.createElement(ReservationFormModal, defaultProps));
    }).not.toThrow();
  });
});