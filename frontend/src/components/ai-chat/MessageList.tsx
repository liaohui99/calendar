// src/components/ai-chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './MessageList.css';

interface MessageListProps {
  messages: Array<{
    id: string;
    content: string;
    isUser: boolean;
    timestamp: number;
  }>;
  autoScroll?: boolean;
}

/**
 * 消息列表组件
 * 展示对话历史记录，支持自动滚动到最新消息
 */
const MessageList: React.FC<MessageListProps> = ({ messages, autoScroll = true }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息列表更新时，自动滚动到底部
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  // 监听容器滚动，当用户滚动时可能需要禁用自动滚动
  const handleScroll = () => {
    // 这里可以添加逻辑来检测用户是否手动滚动了列表
    // 例如，如果滚动位置不是在底部，可以设置一个标志来禁用自动滚动
  };

  return (
    <div 
      className="message-list-container" 
      ref={containerRef}
      onScroll={handleScroll}
    >
      {/* 欢迎消息，当没有消息时显示 */}
      {messages.length === 0 && (
        <div className="welcome-message">
          <p>👋 你好！我是日历AI助手</p>
          <p>有什么可以帮助你的吗？</p>
        </div>
      )}
      
      {/* 消息列表 */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {/* 用于自动滚动的占位元素 */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;