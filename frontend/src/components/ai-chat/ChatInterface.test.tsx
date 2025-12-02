// src/components/ai-chat/ChatInterface.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from './ChatInterface';

// Mock服务
jest.mock('../../services/aiChatService', () => ({
  sendChatMessage: jest.fn(),
}));

// Mock子组件
jest.mock('./MessageList', () => ({
  __esModule: true,
  default: ({ messages }: { messages: any[] }) => (
    <div data-testid="message-list">
      {messages.map(msg => (
        <div key={msg.id} data-role={msg.isUser ? 'user' : 'ai'}>
          {msg.content}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('./ChatInput', () => ({
  __esModule: true,
  default: ({ onSend, disabled }: { onSend: (text: string) => void, disabled: boolean }) => (
    <div>
      <textarea
        data-testid="chat-input"
        disabled={disabled}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            onSend(target.value);
            target.value = '';
          }
        }}
      />
      <button
        data-testid="send-button"
        disabled={disabled}
        onClick={() => {
          const textarea = document.querySelector('[data-testid="chat-input"]') as HTMLTextAreaElement;
          onSend(textarea.value);
          textarea.value = '';
        }}
      >
        发送
      </button>
    </div>
  ),
}));

import { sendChatMessage } from '../../services/aiChatService';
const mockSendChatMessage = sendChatMessage as jest.MockedFunction<typeof sendChatMessage>;

describe('ChatInterface 组件测试', () => {
  beforeEach(() => {
    // 重置mock
    jest.clearAllMocks();
  });

  test('初始渲染时显示欢迎消息', () => {
    render(<ChatInterface />);
    
    // 验证消息列表存在
    const messageList = screen.getByTestId('message-list');
    expect(messageList).toBeInTheDocument();
    
    // 验证欢迎消息（来自MessageList组件的默认欢迎消息）
    // 由于我们mock了MessageList，这里我们只验证组件被正确渲染
    expect(messageList).toHaveTextContent('你好，我是日历AI助手');
  });

  test('发送消息应调用服务并更新消息列表', async () => {
    // 设置mock返回值
    const mockResponse = {
      message: {
        id: 'ai-response-123',
        content: '# AI回复\n\n这是AI的回复内容。',
        isUser: false,
        timestamp: expect.any(Number),
      },
    };
    mockSendChatMessage.mockResolvedValue(mockResponse);
    
    render(<ChatInterface />);
    
    // 模拟用户输入和发送
    const textarea = screen.getByTestId('chat-input') as HTMLTextAreaElement;
    const sendButton = screen.getByTestId('send-button');
    
    // 输入消息并发送
    fireEvent.change(textarea, { target: { value: '测试发送消息' } });
    fireEvent.click(sendButton);
    
    // 验证服务被调用
    await waitFor(() => {
      expect(mockSendChatMessage).toHaveBeenCalledTimes(1);
      expect(mockSendChatMessage).toHaveBeenCalledWith({
        message: '测试发送消息',
        timestamp: expect.any(Number),
      });
    });
    
    // 验证消息列表更新
    await waitFor(() => {
      const messageList = screen.getByTestId('message-list');
      expect(messageList).toHaveTextContent('测试发送消息');
      expect(messageList).toHaveTextContent('AI回复');
    });
  });

  test('加载状态应在请求期间显示', async () => {
    // 设置一个延迟的mock
    mockSendChatMessage.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            message: {
              id: 'ai-response-delay',
              content: '延迟回复',
              isUser: false,
              timestamp: Date.now(),
            },
          });
        }, 100);
      });
    });
    
    render(<ChatInterface />);
    
    // 发送消息
    const textarea = screen.getByTestId('chat-input') as HTMLTextAreaElement;
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(textarea, { target: { value: '测试加载状态' } });
    fireEvent.click(sendButton);
    
    // 验证加载状态显示
    await waitFor(() => {
      const loadingIndicator = screen.getByText(/正在思考/i);
      expect(loadingIndicator).toBeInTheDocument();
    });
  });

  test('请求失败时应显示错误消息', async () => {
    // 设置mock拒绝
    mockSendChatMessage.mockRejectedValue(new Error('网络错误'));
    
    render(<ChatInterface />);
    
    // 发送消息
    const textarea = screen.getByTestId('chat-input') as HTMLTextAreaElement;
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(textarea, { target: { value: '测试错误处理' } });
    fireEvent.click(sendButton);
    
    // 验证错误消息显示
    await waitFor(() => {
      const errorMessage = screen.getByText(/发送失败/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('加载状态期间应禁用输入', async () => {
    // 设置延迟的mock
    mockSendChatMessage.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            message: {
              id: 'ai-response',
              content: '回复内容',
              isUser: false,
              timestamp: Date.now(),
            },
          });
        }, 100);
      });
    });
    
    render(<ChatInterface />);
    
    // 发送消息
    const textarea = screen.getByTestId('chat-input') as HTMLTextAreaElement;
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(textarea, { target: { value: '测试禁用输入' } });
    fireEvent.click(sendButton);
    
    // 验证输入和按钮被禁用
    await waitFor(() => {
      expect(textarea).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });
  });

  test('多次发送消息应正确处理消息队列', async () => {
    // 设置mock响应
    mockSendChatMessage.mockResolvedValueOnce({
      message: {
        id: 'response-1',
        content: '回复1',
        isUser: false,
        timestamp: Date.now(),
      },
    }).mockResolvedValueOnce({
      message: {
        id: 'response-2',
        content: '回复2',
        isUser: false,
        timestamp: Date.now(),
      },
    });
    
    render(<ChatInterface />);
    const textarea = screen.getByTestId('chat-input') as HTMLTextAreaElement;
    const sendButton = screen.getByTestId('send-button');
    
    // 第一次发送
    fireEvent.change(textarea, { target: { value: '消息1' } });
    fireEvent.click(sendButton);
    
    // 等待第一个响应
    await waitFor(() => {
      expect(screen.getByTestId('message-list')).toHaveTextContent('消息1');
      expect(screen.getByTestId('message-list')).toHaveTextContent('回复1');
    });
    
    // 第二次发送
    fireEvent.change(textarea, { target: { value: '消息2' } });
    fireEvent.click(sendButton);
    
    // 等待第二个响应
    await waitFor(() => {
      expect(screen.getByTestId('message-list')).toHaveTextContent('消息2');
      expect(screen.getByTestId('message-list')).toHaveTextContent('回复2');
    });
    
    // 验证服务调用次数
    expect(mockSendChatMessage).toHaveBeenCalledTimes(2);
  });
});