// src/components/ai-chat/ChatInput.tsx
import React, { useState, useRef } from 'react';
import { Button } from '@douyinfe/semi-ui';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

/**
 * 聊天输入框组件
 * 提供文本输入和发送功能，支持Enter键发送
 */
const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  // 处理发送消息
  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
      // 发送后重新聚焦
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter键发送，Shift+Enter换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      <div className="input-wrapper">
        {/* 使用原生textarea代替Input.TextArea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="请输入消息..."
          disabled={disabled}
          rows={1}
          maxLength={2000}
          className="chat-textarea"
        />
        {/* 使用semi-ui的Button组件 */}
        <Button
          type="primary"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="send-button"
          size="large"
        >
          发送
        </Button>
      </div>
      <div className="input-footer">
        <span className="char-count">{value.length}/2000</span>
      </div>
    </div>
  );
};

export default ChatInput;