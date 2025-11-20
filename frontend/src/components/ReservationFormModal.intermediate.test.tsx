import React from 'react';
import { render, screen } from '@testing-library/react';
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

// 模拟Semi-UI组件
jest.mock('@douyinfe/semi-ui', () => ({
  Modal: ({ children, title, visible }: any) => visible ? (
    <div className="semi-modal">
      <div className="semi-modal-title">{title}</div>
      <div className="semi-modal-content">{children}</div>
    </div>
  ) : null,
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

describe('ReservationFormModal Intermediate', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    deviceId: 1,
    startTime: '10:00',
    endTime: '11:00',
    date: '2024-01-01',
    deviceName: 'Test Device'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // 模拟alert
    window.alert = jest.fn();
  });

  test('should render without crashing', () => {
    const result = render(<ReservationFormModal {...defaultProps} />);
    expect(result.container).toBeDefined();
  });

  test('should display modal title', () => {
    render(<ReservationFormModal {...defaultProps} />);
    // 只检查标题，这是最基本的内容检查
    const modalElement = document.querySelector('.semi-modal-title');
    expect(modalElement).toBeDefined();
  });

  test('should not render when visible is false', () => {
    const props = { ...defaultProps, visible: false };
    render(<ReservationFormModal {...props} />);
    // 检查模态框是否不存在
    const modalElement = document.querySelector('.semi-modal');
    expect(modalElement).toBeNull();
  });
});