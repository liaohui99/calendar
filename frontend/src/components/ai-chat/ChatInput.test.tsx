// src/components/ai-chat/ChatInput.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInput from './ChatInput';

describe('ChatInput 组件测试', () => {
  test('初始状态下发送按钮应被禁用', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={false} />);
    
    const sendButton = screen.getByRole('button', { name: /发送/i });
    expect(sendButton).toBeDisabled();
  });

  test('输入内容后发送按钮应启用', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={false} />);
    
    const textArea = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /发送/i });
    
    // 输入内容
    fireEvent.change(textArea, { target: { value: '测试消息' } });
    
    // 验证发送按钮已启用
    expect(sendButton).not.toBeDisabled();
  });

  test('点击发送按钮应调用onSend回调', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={false} />);
    
    const textArea = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /发送/i });
    
    // 输入内容并发送
    fireEvent.change(textArea, { target: { value: '测试发送' } });
    fireEvent.click(sendButton);
    
    // 验证回调被调用且内容正确
    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith('测试发送');
  });

  test('按下Enter键应发送消息（不使用Shift）', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={false} />);
    
    const textArea = screen.getByRole('textbox');
    
    // 输入内容并按Enter键
    fireEvent.change(textArea, { target: { value: 'Enter发送' } });
    fireEvent.keyDown(textArea, { key: 'Enter', shiftKey: false });
    
    // 验证回调被调用
    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith('Enter发送');
  });

  test('按下Shift+Enter键不应发送消息，而是添加换行', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={false} />);
    
    const textArea = screen.getByRole('textbox');
    
    // 输入内容并按Shift+Enter键
    fireEvent.change(textArea, { target: { value: '第一行' } });
    fireEvent.keyDown(textArea, { key: 'Enter', shiftKey: true });
    
    // 验证回调未被调用
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  test('禁用状态下应禁用输入和按钮', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={true} />);
    
    const textArea = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /发送/i });
    
    // 验证禁用状态
    expect(textArea).toBeDisabled();
    expect(sendButton).toBeDisabled();
    
    // 尝试交互
    fireEvent.change(textArea, { target: { value: '不应生效' } });
    fireEvent.click(sendButton);
    
    // 验证回调未被调用
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  test('显示正确的字数统计', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={false} />);
    
    const textArea = screen.getByRole('textbox');
    const counter = screen.getByText(/0\/2000/);
    
    // 初始状态应为0
    expect(counter).toBeInTheDocument();
    
    // 输入内容后字数应更新
    fireEvent.change(textArea, { target: { value: '测试字数' } });
    expect(screen.getByText(/4\/2000/)).toBeInTheDocument();
  });

  test('发送消息后应清空输入框', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={false} />);
    
    const textArea = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /发送/i });
    
    // 输入内容并发送
    fireEvent.change(textArea, { target: { value: '测试清空' } });
    fireEvent.click(sendButton);
    
    // 验证输入框已清空
    expect(textArea).toHaveValue('');
  });
});