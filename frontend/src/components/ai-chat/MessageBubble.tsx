// src/components/ai-chat/MessageBubble.tsx
import React from 'react';
import { Typography, Avatar } from '@douyinfe/semi-ui';
import MarkdownRenderer from './MarkdownRenderer';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: number;
  };
}

/**
 * 消息气泡组件
 * 根据消息类型（用户/AI）显示不同样式的消息气泡
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { content, isUser } = message;

  // 格式化时间戳为可读时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className={`message-bubble-container ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        <Avatar 
          size="small" 
          style={{
            backgroundColor: isUser ? '#1890ff' : '#52c41a',
            color: 'white'
          }}
        >
          {isUser ? '用户' : 'AI'}
        </Avatar>
      </div>
      
      <div className="message-content-wrapper">
        <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
          {isUser ? (
            <Typography.Text>{content}</Typography.Text>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
        
        <div className="message-time">
          <Typography.Text type="secondary" size="small">
            {formatTime(message.timestamp)}
          </Typography.Text>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;