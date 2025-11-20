import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// 先模拟所有外部依赖
jest.mock('../services/api', () => ({
  reservationApi: {
    createReservation: jest.fn().mockResolvedValue({ status: 200 })
  }
}));

// 模拟dayjs
jest.mock('dayjs', () => (dateStr: string) => {
  return {
    format: () => dateStr || '2024-01-01 00:00',
    isBefore: () => false,
    isSame: () => false
  };
});

// 模拟Semi-UI组件 - 使用更简单的实现
jest.mock('@douyinfe/semi-ui', () => {
  return {
    Modal: ({ children, title }: { children: React.ReactNode; title: string }) => (
      <div className="semi-modal">
        <div className="semi-modal-title">{title}</div>
        <div className="semi-modal-content">{children}</div>
      </div>
    ),
    Form: ({ children, layout, onChange }: any) => (
      <form className="semi-form" onChange={onChange}>
        {children}
      </form>
    ),
    Typography: {
      Text: ({ children, type, strong }: { children: React.ReactNode; type?: string; strong?: boolean }) => (
        <span className={`semi-text ${type || ''} ${strong ? 'semi-text-strong' : ''}`}>
          {children}
        </span>
      )
    },
    Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button className="semi-button" onClick={onClick}>{children}</button>
    )
  };
});

// 手动添加Form.Input和Form.TextArea
const mockForm = {
  Input: ({ field, label, placeholder }: { field: string; label: string; placeholder?: string }) => (
    <div className="form-item">
      <label htmlFor={field}>{label}</label>
      <input id={field} name={field} placeholder={placeholder} />
    </div>
  ),
  TextArea: ({ field, label, placeholder }: { field: string; label: string; placeholder?: string }) => (
    <div className="form-item">
      <label htmlFor={field}>{label}</label>
      <textarea id={field} name={field} placeholder={placeholder} />
    </div>
  )
};

// 手动模拟Form组件的静态属性
beforeEach(() => {
  // 模拟Form.Input和Form.TextArea
  const semiUI = require('@douyinfe/semi-ui');
  semiUI.Form.Input = mockForm.Input;
  semiUI.Form.TextArea = mockForm.TextArea;
});

// 现在导入组件
const ReservationFormModal = require('./ReservationFormModal').default;

describe('ReservationFormModal Fixed Test', () => {
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
    expect(result).toBeDefined();
  });

  test('should contain modal title', () => {
    render(<ReservationFormModal {...defaultProps} />);
    expect(screen.getByText('创建设备预约')).toBeInTheDocument();
  });
});