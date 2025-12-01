import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DeviceReservationPage from '../DeviceReservationPage';

// 为每个测试文件单独mock useNavigate，确保测试隔离
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(() => mockNavigate)
}));

// Mock所有子组件
jest.mock('../../components/CalendarView', () => () => (
  <div data-testid="calendar-view">Calendar View Component</div>
));

jest.mock('../../components/FilterComponent', () => () => (
  <div data-testid="filter-component">Filter Component</div>
));

jest.mock('../../components/ReservationFormModal', () => () => null);
jest.mock('../../components/GeneralReservationForm', () => () => null);

// Mock Semi UI组件
jest.mock('@douyinfe/semi-ui', () => ({
  Typography: {
    Title: ({ children, style }: any) => (
      <h1 style={style}>{children}</h1>
    )
  },
  Button: ({ onClick, children }: any) => (
    <button 
      data-testid="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}));

// Mock dayjs
jest.mock('dayjs', () => {
  const mockDayjs = jest.fn(() => ({
    format: jest.fn(() => '2023-01-01')
  }));
  return mockDayjs;
});

// 实现renderWithRouter辅助函数
const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <DeviceReservationPage />
    </BrowserRouter>
  );
};

describe('DeviceReservationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('正确渲染页面标题', () => {
    render(
      <BrowserRouter>
        <DeviceReservationPage />
      </BrowserRouter>
    );

    expect(screen.getByText('设备预约')).toBeInTheDocument();
  });

  test('"查看所有预约"按钮存在且可点击', () => {
    // 在每个测试前清除mock调用历史
    mockNavigate.mockClear();

    render(
      <BrowserRouter>
        <DeviceReservationPage />
      </BrowserRouter>
    );

    const viewAllButton = screen.getByText('查看所有预约');
    expect(viewAllButton).toBeInTheDocument();
    
    fireEvent.click(viewAllButton);
    
    // 验证按钮点击触发导航
    expect(mockNavigate).toHaveBeenCalledWith('/reservations');
  });

  test('正确渲染子组件', () => {
    render(
      <BrowserRouter>
        <DeviceReservationPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    expect(screen.getByTestId('filter-component')).toBeInTheDocument();
  });
});