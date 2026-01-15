import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock useNavigate at the top level
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// 更彻底地mock所有依赖，避免ES模块问题
jest.mock('@douyinfe/semi-ui', () => ({
  Typography: {
    Title: ({ children, ...props }: any) => (
      <h1 data-testid="page-title" {...props}>{children}</h1>
    )
  },
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="view-all-button" onClick={onClick} {...props}>{children}</button>
  )
}));

// Mock所有子组件
jest.mock('../components/CalendarView', () => () => <div data-testid="calendar-view">CalendarView</div>);
jest.mock('../components/FilterComponent', () => ({ onFilterChange, onNewReservationClick }: any) => (
  <div data-testid="filter-component">
    <button data-testid="new-reservation" onClick={onNewReservationClick} />
  </div>
));
jest.mock('../components/ReservationFormModal', () => ({ visible, onClose }: any) => (
  <div data-testid="reservation-modal" style={{ display: visible ? 'block' : 'none' }}>
    <button data-testid="close-modal" onClick={onClose} />
  </div>
));
jest.mock('../components/GeneralReservationForm', () => ({ visible, onClose }: any) => (
  <div data-testid="general-reservation-form" style={{ display: visible ? 'block' : 'none' }}>
    <button data-testid="close-general-form" onClick={onClose} />
  </div>
));

// 在mock完所有依赖后再导入组件
import DeviceReservationPage from './DeviceReservationPage';

describe('DeviceReservationPage', () => {
  // 移除renderWithRouter函数，直接在测试中使用BrowserRouter

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('渲染页面标题', () => {
    render(
      <BrowserRouter>
        <DeviceReservationPage />
      </BrowserRouter>
    );

    expect(screen.getByText('设备预约系统')).toBeInTheDocument();
  });

  test('显示"查看所有预约"按钮', () => {
    render(
      <BrowserRouter>
        <DeviceReservationPage />
      </BrowserRouter>
    );
    const viewAllButton = screen.getByTestId('view-all-button');
    expect(viewAllButton).toBeInTheDocument();
    expect(viewAllButton).toHaveTextContent('查看所有预约');
  });

  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  test('点击"查看所有预约"按钮调用navigate', () => {
    render(
      <BrowserRouter>
        <DeviceReservationPage />
      </BrowserRouter>
    );
    const viewAllButton = screen.getByTestId('view-all-button');
    fireEvent.click(viewAllButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/reservations');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  test('页面包含所有必要的子组件', () => {
    render(
      <BrowserRouter>
        <DeviceReservationPage />
      </BrowserRouter>
    );
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    expect(screen.getByTestId('filter-component')).toBeInTheDocument();
  });
});