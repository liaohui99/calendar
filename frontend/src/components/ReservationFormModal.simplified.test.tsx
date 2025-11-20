import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// 先模拟所有外部依赖
jest.mock('../services/api', () => ({
  reservationApi: {
    createReservation: jest.fn()
  }
}));

// 模拟dayjs
jest.mock('dayjs', () => (dateStr?: string) => ({
  format: () => dateStr || '2024-01-01 00:00'
}));

// 模拟Semi-UI组件 - 使用最简单的实现
jest.mock('@douyinfe/semi-ui', () => ({
  Modal: ({ children, title }: any) => (
    <div className="semi-modal">
      <div className="semi-modal-title">{title}</div>
      <div className="semi-modal-content">{children}</div>
    </div>
  ),
  Form: ({ children }: any) => (
    <div className="semi-form">{children}</div>
  ),
  Typography: {
    Text: ({ children }: any) => <span>{children}</span>
  },
  Button: ({ children }: any) => <button>{children}</button>
}));

// 手动模拟Form的静态属性
beforeEach(() => {
  const semiUI = require('@douyinfe/semi-ui');
  semiUI.Form.Input = ({ label }: any) => <div className="form-input">{label}</div>;
  semiUI.Form.TextArea = ({ label }: any) => <div className="form-textarea">{label}</div>;
});

// 导入组件
const ReservationFormModal = require('./ReservationFormModal').default;

describe('ReservationFormModal Simplified', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    deviceId: 1,
    startTime: '10:00',
    endTime: '11:00',
    date: '2024-01-01',
    deviceName: 'Test Device'
  };

  test('should render without crashing', () => {
    // 最简单的测试，只验证渲染不崩溃
    const result = render(<ReservationFormModal {...defaultProps} />);
    expect(result.container).toBeDefined();
  });
});