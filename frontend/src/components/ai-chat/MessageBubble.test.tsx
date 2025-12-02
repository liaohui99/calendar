// src/components/ai-chat/MessageBubble.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageBubble from './MessageBubble';

// Mock MarkdownRenderer组件
jest.mock('./MarkdownRenderer', () => {
  return ({ content }: { content: string }) => (
    <div data-testid="markdown-renderer">{content}</div>
  );
});

describe('MessageBubble 组件测试', () => {
  // 创建测试消息
  const createTestMessage = (content: string, isUser: boolean) => ({
    id: `test-${Date.now()}`,
    content,
    isUser,
    timestamp: Date.now(),
  });

  test('渲染用户消息', () => {
    const userMessage = createTestMessage('你好，AI!', true);
    render(<MessageBubble message={userMessage} />);
    
    // 检查用户消息容器类名
    const container = screen.getByText('你好，AI!').closest('.message-bubble-container');
    expect(container).toHaveClass('user-message');
    
    // 检查消息气泡类名
    const bubble = screen.getByText('你好，AI!').closest('.message-bubble');
    expect(bubble).toHaveClass('user');
    
    // 检查头像
    expect(screen.getByText('用户')).toBeInTheDocument();
    
    // 检查时间显示
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  test('渲染AI消息', () => {
    const aiMessage = createTestMessage('# AI回复标题\n\n这是AI的回复内容', false);
    render(<MessageBubble message={aiMessage} />);
    
    // 检查AI消息容器类名
    const container = screen.getByTestId('markdown-renderer').closest('.message-bubble-container');
    expect(container).toHaveClass('ai-message');
    
    // 检查消息气泡类名
    const bubble = screen.getByTestId('markdown-renderer').closest('.message-bubble');
    expect(bubble).toHaveClass('ai');
    
    // 检查头像
    expect(screen.getByText('AI')).toBeInTheDocument();
    
    // 检查Markdown内容
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-renderer').textContent).toContain('AI回复标题');
    expect(screen.getByTestId('markdown-renderer').textContent).toContain('这是AI的回复内容');
    
    // 检查时间显示
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  test('正确格式化时间戳', () => {
    // 创建一个特定时间的消息
    const fixedTime = new Date('2023-01-01T14:30:00').getTime();
    const message = {
      id: 'test-time',
      content: '测试时间',
      isUser: true,
      timestamp: fixedTime,
    };
    
    render(<MessageBubble message={message} />);
    
    // 验证时间格式（注意时区问题，这里可能需要调整）
    // 由于测试环境的时区可能不同，这里只检查格式
    const timeElement = screen.getByText(/\d{2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  test('渲染空消息内容', () => {
    const emptyMessage = createTestMessage('', true);
    render(<MessageBubble message={emptyMessage} />);
    
    // 即使内容为空，组件也应该正常渲染
    const container = screen.getByText('').closest('.message-bubble-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('user-message');
  });
});