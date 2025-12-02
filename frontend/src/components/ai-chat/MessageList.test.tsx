// src/components/ai-chat/MessageList.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageList from './MessageList';

// Mock MessageBubble组件
jest.mock('./MessageBubble', () => ({
  __esModule: true,
  default: ({ message }: { message: any }) => (
    <div data-testid="message-bubble" data-role={message.isUser ? 'user' : 'ai'}>
      {message.content}
    </div>
  ),
}));

describe('MessageList 组件测试', () => {
  // 创建测试消息数组
  const createTestMessages = () => [
    {
      id: '1',
      content: '你好，AI！',
      isUser: true,
      timestamp: Date.now() - 300000,
    },
    {
      id: '2',
      content: '# 欢迎使用日历AI助手\n\n我可以帮你回答关于日历的问题。',
      isUser: false,
      timestamp: Date.now() - 290000,
    },
    {
      id: '3',
      content: '如何添加日程？',
      isUser: true,
      timestamp: Date.now() - 280000,
    },
  ];

  test('渲染消息列表', () => {
    const messages = createTestMessages();
    render(<MessageList messages={messages} />);
    
    // 验证所有消息都被渲染
    const bubbles = screen.getAllByTestId('message-bubble');
    expect(bubbles).toHaveLength(messages.length);
    
    // 验证消息内容
    messages.forEach(message => {
      expect(screen.getByText(message.content)).toBeInTheDocument();
    });
    
    // 验证消息角色
    const userBubbles = screen.getAllByTestId('message-bubble').filter(el => 
      el.getAttribute('data-role') === 'user'
    );
    const aiBubbles = screen.getAllByTestId('message-bubble').filter(el => 
      el.getAttribute('data-role') === 'ai'
    );
    
    expect(userBubbles).toHaveLength(2);
    expect(aiBubbles).toHaveLength(1);
  });

  test('渲染空消息列表时显示欢迎消息', () => {
    render(<MessageList messages={[]} />);
    
    // 验证欢迎消息存在
    const welcomeMessage = screen.getByRole('heading', { level: 1 });
    expect(welcomeMessage).toBeInTheDocument();
    expect(welcomeMessage.textContent).toContain('你好，我是日历AI助手');
    
    // 验证欢迎描述存在
    const welcomeDescription = screen.getByText(/有什么关于日历的问题/i);
    expect(welcomeDescription).toBeInTheDocument();
    
    // 验证没有消息气泡
    expect(screen.queryAllByTestId('message-bubble')).toHaveLength(0);
  });

  test('当只有一条消息时应正确渲染', () => {
    const singleMessage = [{
      id: 'single',
      content: '只有一条消息',
      isUser: false,
      timestamp: Date.now(),
    }];
    
    render(<MessageList messages={singleMessage} />);
    
    // 验证消息被渲染
    expect(screen.getByText('只有一条消息')).toBeInTheDocument();
    expect(screen.getAllByTestId('message-bubble')).toHaveLength(1);
    
    // 验证欢迎消息不存在
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  test('容器类名应正确设置', () => {
    const messages = createTestMessages();
    const { container } = render(<MessageList messages={messages} />);
    
    const messageListContainer = container.querySelector('.message-list');
    expect(messageListContainer).toBeInTheDocument();
    expect(messageListContainer).toHaveClass('message-list');
  });

  test('消息顺序应与输入数组一致', () => {
    const messages = createTestMessages();
    render(<MessageList messages={messages} />);
    
    // 获取所有消息文本
    const bubbles = screen.getAllByTestId('message-bubble');
    const renderedContents = bubbles.map(bubble => bubble.textContent);
    
    // 验证顺序
    messages.forEach((message, index) => {
      expect(renderedContents[index]).toBe(message.content);
    });
  });
});