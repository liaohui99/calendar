// src/pages/AIChatPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock crypto.randomUUID for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }),
  },
  writable: true,
});

// Mock @douyinfe/semi-ui组件 - 使用工厂函数
const MockMenu = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <ul 
    data-testid="menu" 
    style={style}
  >
    {children}
  </ul>
);

// 为MockMenu添加Item属性
MockMenu.Item = ({ children, onClick, disabled, style }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  disabled?: boolean;
  style?: React.CSSProperties;
}) => (
  <li 
    data-testid="menu-item"
    onClick={disabled ? undefined : onClick}
    style={style}
    data-disabled={disabled}
  >
    {children}
  </li>
);

jest.mock('@douyinfe/semi-ui', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
  Button: ({ children, loading, onClick, type, size }: { 
    children: React.ReactNode; 
    loading?: boolean; 
    onClick?: () => void;
    type?: 'primary' | 'secondary' | 'tertiary';
    size?: 'small' | 'medium' | 'large';
  }) => (
    <button 
      data-testid="button" 
      onClick={onClick}
      aria-busy={loading}
      data-button-type={type}
      data-button-size={size}
    >
      {children}
    </button>
  ),
  Dropdown: ({ 
    children, 
    overlay, 
    trigger, 
    position, 
    onOpenChange, 
    visible 
  }: {
    children: React.ReactNode;
    overlay: React.ReactNode;
    trigger?: 'click' | 'hover';
    position?: string;
    onOpenChange?: (open: boolean) => void;
    visible?: boolean;
  }) => (
    <div 
      data-testid="dropdown"
      data-trigger={trigger}
      data-position={position}
      data-visible={visible}
      onMouseEnter={() => trigger === 'hover' && onOpenChange?.(true)}
      onMouseLeave={() => trigger === 'hover' && onOpenChange?.(false)}
    >
      {children}
      {visible && (
        <div data-testid="dropdown-overlay">
          {overlay}
        </div>
      )}
    </div>
  ),
  Menu: MockMenu,
  Toast: {
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

// 模拟aiChatService
jest.mock('../services/aiChatService', () => ({
  clearChatMemory: jest.fn(),
}));

// 模拟react-router-dom的useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// 模拟ChatInterface组件
jest.mock('../components/ai-chat/ChatInterface', () => {
  return function MockChatInterface({ memoryId }: { memoryId: number }) {
    return (
      <div data-testid="chat-interface">
        <span data-testid="memory-id">{memoryId}</span>
      </div>
    );
  };
});

// 现在导入组件
import AIChatPage from './AIChatPage';
import { clearChatMemory } from '../services/aiChatService';

describe('AIChatPage组件测试', () => {
  beforeEach(() => {
    // 清除所有模拟和本地存储
    jest.clearAllMocks();
    localStorage.clear();
    (clearChatMemory as jest.Mock).mockResolvedValue(true);
  });

  test('应正确渲染AIChatPage组件', () => {
    render(<AIChatPage />);
    
    // 检查标题
    expect(screen.getByText('日历AI助手')).toBeInTheDocument();
    
    // 检查返回按钮
    expect(screen.getByText('返回预约系统')).toBeInTheDocument();
    
    // 检查新会话按钮
    expect(screen.getByText('新会话')).toBeInTheDocument();
    
    // 检查ChatInterface组件被渲染
    expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
  });

  test('新会话按钮应在加载时显示loading状态', async () => {
    // 设置慢速响应的clearChatMemory
    (clearChatMemory as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 500)));
    
    render(<AIChatPage />);
    
    const newSessionButton = screen.getByText('新会话');
    
    // 点击新会话按钮
    fireEvent.click(newSessionButton);
    
    // 按钮应该显示loading状态
    expect(newSessionButton.closest('button')).toHaveAttribute('aria-busy', 'true');
    
    // 等待异步操作完成并确保Toast有时间显示（duration=2秒，但测试环境中不生效）
    await waitFor(() => {
      expect(screen.queryByText('正在创建新对话...')).toBeInTheDocument();
    }, { timeout: 500 });
    
    // 等待足够时间确保Toast成功创建
    await waitFor(() => {
      expect(clearChatMemory).toHaveBeenCalled();
    }, { timeout: 1000 });
    
    // 等待按钮loading状态结束
    await waitFor(() => {
      expect(newSessionButton.closest('button')).toHaveAttribute('aria-busy', 'false');
    }, { timeout: 3000 });
  });

  test('点击新会话按钮应调用clearChatMemory并生成新的memoryId', async () => {
    // 初始渲染
    render(<AIChatPage />);
    
    // 获取初始memoryId
    const initialMemoryId = screen.getByTestId('memory-id').textContent;
    expect(initialMemoryId).not.toBeNull();
    
    // 点击新会话按钮
    const newSessionButton = screen.getByText('新会话');
    fireEvent.click(newSessionButton);
    
    // 等待异步操作完成
    await waitFor(() => {
      expect(clearChatMemory).toHaveBeenCalledWith(parseInt(initialMemoryId!, 10));
    });
    
    // 验证localStorage已更新
    await waitFor(() => {
      const savedMemoryId = localStorage.getItem('calendar-chat-memory-id');
      expect(savedMemoryId).not.toBe(initialMemoryId);
    });
  });

  test('返回按钮应导航到预约系统页面', () => {
    render(<AIChatPage />);
    
    const backButton = screen.getByText('返回预约系统');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('memoryId应正确传递给ChatInterface', () => {
    // 设置特定的memoryId
    const testMemoryId = 1234567890;
    localStorage.setItem('calendar-chat-memory-id', testMemoryId.toString());
    
    render(<AIChatPage />);
    
    // 检查ChatInterface接收到正确的memoryId
    expect(screen.getByTestId('memory-id')).toHaveTextContent(testMemoryId.toString());
  });

  test('新会话按钮点击后应阻止重复点击', async () => {
    let callCount = 0;
    (clearChatMemory as jest.Mock).mockImplementation(() => {
      callCount++;
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    
    render(<AIChatPage />);
    
    const newSessionButton = screen.getByText('新会话');
    
    // 快速点击两次
    fireEvent.click(newSessionButton);
    fireEvent.click(newSessionButton);
    
    // 等待完成
    await waitFor(() => {
      expect(callCount).toBe(1);
    });
  });

  test('新会话功能应能正确处理clearChatMemory失败的情况', async () => {
    // 模拟clearChatMemory失败
    (clearChatMemory as jest.Mock).mockResolvedValue(false);
    
    render(<AIChatPage />);
    
    // 获取初始memoryId
    const initialMemoryId = screen.getByTestId('memory-id').textContent;
    
    // 点击新会话按钮
    const newSessionButton = screen.getByText('新会话');
    fireEvent.click(newSessionButton);
    
    // 等待异步操作完成
    await waitFor(() => {
      // 即使clearChatMemory失败，memoryId也应该更新
      const newMemoryId = screen.getByTestId('memory-id').textContent;
      expect(newMemoryId).not.toBe(initialMemoryId);
    });
  });
});
