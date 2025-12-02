// src/components/ai-chat/ChatInterface.tsx
import React, { useState, useEffect } from 'react';
import { Spin, Typography } from '@douyinfe/semi-ui';
import { sendChatMessage } from '../../services/aiChatService';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

/**
 * 消息类型定义
 */
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}
import './ChatInterface.css';

const { Title } = Typography;

interface ChatInterfaceProps {
  initialMessages?: Message[];
}

/**
 * AI对话界面主组件
 * 整合所有子组件，管理聊天状态和业务逻辑
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialMessages = [] }) => {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 组件挂载时，显示欢迎消息（如果没有初始消息）
  useEffect(() => {
    if (initialMessages.length === 0) {
      // 显示AI的欢迎消息
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        content: `# 你好，我是日历AI助手

我可以帮你管理日程安排、创建和查询预约。

## 我能做什么

- 查询日历上的预约信息
- 创建新的设备预约
- 修改或取消现有的预约
- 提供日历视图和时间建议

## 使用示例

你可以这样和我交流：
- "查询明天的所有预约"
- "帮我在后天下午2点预约会议室A"
- "取消我今天下午3点的预约"`,
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [initialMessages]);

  // 生成唯一ID
  const generateId = (): string => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // 处理发送消息
  const handleSendMessage = async (text: string) => {
    // 添加用户消息到列表
    const userMessage: Message = {
      id: generateId(),
      content: text,
      isUser: true,
      timestamp: Date.now(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // 清除之前的错误
    setError(null);
    // 设置加载状态
    setIsLoading(true);

    try {
      // 调用API服务发送消息
      const response = await sendChatMessage({ message: text });

      if (response.success && response.data) {
        // 添加AI回复到列表
        const aiMessage: Message = {
          id: generateId(),
          content: response.data.content,
          isUser: false,
          timestamp: Date.now(),
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } else {
        // 处理API错误
        throw new Error(response.error || '未知错误');
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      setError(err instanceof Error ? err.message : '发送消息失败，请重试');
      
      // 添加错误消息到列表
      const errorMessage: Message = {
        id: generateId(),
        content: '抱歉，我暂时无法回复。请稍后再试。',
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      // 无论成功失败，都要重置加载状态
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      {/* 聊天标题 */}
      <div className="chat-header">
        <Title heading={4} style={{ margin: 0 }}>AI 对话助手</Title>
      </div>

      {/* 消息列表区域 */}
      <MessageList messages={messages} />

      {/* 加载指示器 */}
      {isLoading && (
        <div className="loading-indicator">
          <Spin size="small" />
          <span style={{ marginLeft: 8 }}>AI正在思考...</span>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="error-message">
          <Typography.Text type="danger">{error}</Typography.Text>
        </div>
      )}

      {/* 输入区域 */}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatInterface;