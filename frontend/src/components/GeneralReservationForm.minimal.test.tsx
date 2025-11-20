import React from 'react';
import { render, screen } from '@testing-library/react';
// 导入jest-dom扩展以支持toBeInTheDocument等匹配器
import '@testing-library/jest-dom';

// 先模拟所有依赖，再导入组件

// 模拟Semi UI组件
jest.mock('@douyinfe/semi-ui', () => ({
  Modal: ({ children }: any) => <div data-testid="modal">{children}</div>,
  Input: () => <input data-testid="input" />,
  Select: () => <select data-testid="select" />,
  DatePicker: () => <input data-testid="datepicker" />,
  TextArea: () => <textarea data-testid="textarea" />,
  Button: ({ children }: any) => <button data-testid="button">{children}</button>
}));

// 模拟API服务
jest.mock('../services/api', () => ({
  deviceApi: { getDevices: jest.fn().mockResolvedValue([]) },
  locationApi: { getLocations: jest.fn().mockResolvedValue([]) },
  typeApi: { getTypes: jest.fn().mockResolvedValue([]) },
  reservationApi: { createReservation: jest.fn() }
}));

// 导入组件
import GeneralReservationForm from './GeneralReservationForm';

describe('GeneralReservationForm', () => {
  test('renders without crashing', () => {
    // 禁用console.error以避免测试中出现不必要的警告
    const originalError = console.error;
    console.error = jest.fn();
    
    try {
      // 渲染组件
      render(
        <GeneralReservationForm 
          visible={true}
          onClose={() => {}}
          onSuccess={() => {}}
        />
      );
      
      // 检查Modal是否渲染（使用Semi UI组件的测试ID）
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      
    } finally {
      // 恢复console.error
      console.error = originalError;
    }
  });
});