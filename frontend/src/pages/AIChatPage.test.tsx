// src/pages/AIChatPage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIChatPage from './AIChatPage';

// Mock ChatInterface组件
jest.mock('../components/ai-chat/ChatInterface', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="chat-interface">
      Chat Interface Component
    </div>
  ),
}));

describe('AIChatPage 页面测试', () => {
  test('渲染页面标题', () => {
    render(<AIChatPage />);
    
    const title = screen.getByText('日历AI助手');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('semi-heading-1');
  });

  test('集成ChatInterface组件', () => {
    render(<AIChatPage />);
    
    const chatInterface = screen.getByTestId('chat-interface');
    expect(chatInterface).toBeInTheDocument();
    expect(chatInterface.textContent).toContain('Chat Interface Component');
  });

  test('渲染页脚信息', () => {
    render(<AIChatPage />);
    
    const footerText = screen.getByText(/日历AI助手 ©2023/);
    expect(footerText).toBeInTheDocument();
    expect(footerText).toHaveTextContent('提供智能日历相关咨询服务');
  });

  test('页面布局结构正确', () => {
    const { container } = render(<AIChatPage />);
    
    // 验证Layout组件结构
    const layoutElement = container.querySelector('.semi-layout.chat-page');
    expect(layoutElement).toBeInTheDocument();
    
    // 验证Header组件
    const headerElement = container.querySelector('.semi-layout-header');
    expect(headerElement).toBeInTheDocument();
    
    // 验证Content组件
    const contentElement = container.querySelector('.semi-layout-content');
    expect(contentElement).toBeInTheDocument();
    
    // 验证Footer组件
    const footerElement = container.querySelector('.semi-layout-footer');
    expect(footerElement).toBeInTheDocument();
  });

  test('内容区域样式正确', () => {
    const { container } = render(<AIChatPage />);
    
    // 验证内容容器的样式
    const contentWrapper = container.querySelector('.semi-layout-content > div');
    expect(contentWrapper).toBeInTheDocument();
    
    // 由于我们无法直接测试CSS样式，可以验证元素存在性
    expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
  });
});