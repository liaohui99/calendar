// src/components/ai-chat/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, List, Avatar, Typography, Empty, IconButton } from '@douyinfe/semi-ui';
import { sendChatMessage } from '../../services/aiChatService';
import { IconArrowUpRight } from '@douyinfe/semi-icons';
import MarkdownRenderer from './MarkdownRenderer';

// 样式常量
const STYLES = {
  messageList: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '100px' // 为固定输入框留出空间
  },
  inputContainer: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: '70%',
    width: '100%',
    backgroundColor: '#ffffff',
    padding: '16px',
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center' // 居中显示输入框和按钮
  },
  scrollButton: {
    position: 'absolute',
    bottom: '100%',
    right: '16px',
    marginBottom: '8px',
    opacity: 0.8,
    transition: 'opacity 0.3s'
  },
  textarea: {
    width: '100%', // 占满容器宽度
    marginRight: 8
  }
} as const;

// 添加CSS样式标签到文档头
const addResponsiveStyles = () => {
  const existingStyle = document.getElementById('chat-interface-responsive-styles');
  if (existingStyle) return;
  
  const style = document.createElement('style');
  style.id = 'chat-interface-responsive-styles';
  style.textContent = `
    /* 中屏幕响应式适配 */
    @media (max-width: 768px) {
      .chat-input-container {
        padding: 12px !important;
        paddingBottom: env(safe-area-inset-bottom, 12px) !important;
        maxWidth: 75% !important;
      }
      .message-list {
        padding-bottom: 80px !important;
      }
      .scroll-to-bottom-button {
        right: 12px !important;
        marginBottom: 6px !important;
      }
    }
    
    /* 小屏幕响应式适配 */
    @media (max-width: 480px) {
      .chat-input-container {
        padding: 8px !important;
        paddingBottom: env(safe-area-inset-bottom, 24px) !important;
        maxWidth: 85% !important;
      }
      .message-list {
        padding-bottom: 90px !important;
      }
      .scroll-to-bottom-button {
        right: 8px !important;
        marginBottom: 4px !important;
      }
      .chat-input {
        marginRight: 4px !important;
      }
    }
    
    /* 大屏幕响应式适配 */
    @media (min-width: 768px) {
      .chat-input {
        max-height: none !important;
      }
    }
  `;
  document.head.appendChild(style);
};

const { Text } = Typography;

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
}

/**
 * 聊天界面组件
 * 提供用户与AI助手的交互界面，实现输入框固定定位和内容滚动功能
 */
const ChatInterface: React.FC = () => {
  // 添加响应式样式
  useEffect(() => {
    addResponsiveStyles();
  }, []);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: '你好！我是日历图表助手，有什么可以帮到你的吗？',
      sender: 'bot'
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  /**
   * 处理发送消息
   */
  const handleSendMessage = async () => {
    console.log('开始发送消息流程');
    if (!inputValue.trim() || isLoading) {
      console.log('消息为空或正在加载，不发送');
      return;
    }

    // 添加用户消息
    console.log('准备添加用户消息到界面');
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user'
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('调用聊天服务sendChatMessage');
      // 调用聊天服务
      const response = await sendChatMessage({ message: inputValue });
      
      console.log('收到聊天服务响应:', response);
      
      // 添加AI回复，更健壮的响应处理
      if (response && response.success && response.data && response.data.content) {
        const botMessage: Message = {
          id: Date.now().toString(),
          content: response.data.content,
          sender: 'bot'
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } else {
        console.error('服务返回不完整或失败:', response);
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: response && response.error ? `处理失败: ${response.error}` : '抱歉，我无法处理您的请求。',
          sender: 'bot'
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 添加错误消息，区分不同类型的错误
      let errorContent = '抱歉，我遇到了一些问题，请稍后再试。';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorContent = '请求超时，请稍后重试';
        } else if (error.message.includes('Network')) {
          errorContent = '网络连接失败，请检查您的网络';
        } else {
          errorContent = `处理异常: ${error.message}`;
        }
      }
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: errorContent,
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      console.log('消息发送流程结束');
      setIsLoading(false);
    }
  };

  /**
   * 处理回车键发送消息
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  /**
   * 检测输入框内容是否溢出
   */
  const checkContentOverflow = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const shouldShowScrollButton = textarea.scrollHeight > textarea.clientHeight;
    
    if (shouldShowScrollButton !== showScrollButton) {
      setShowScrollButton(shouldShowScrollButton);
    }
  };

  /**
   * 将输入框内容滚动到底部
   */
  const scrollToBottom = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    textarea.scrollTop = textarea.scrollHeight;
  };

  /**
   * 处理滚动按钮点击
   */
  const handleScrollButtonClick = () => {
    scrollToBottom();
  };

  // 监听输入框内容变化和组件挂载/卸载
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.addEventListener('input', checkContentOverflow);
    textarea.addEventListener('scroll', checkContentOverflow);
    
    // 初始检查
    checkContentOverflow();
    
    return () => {
      textarea.removeEventListener('input', checkContentOverflow);
      textarea.removeEventListener('scroll', checkContentOverflow);
    };
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div 
          ref={messageListRef}
          className="message-list"
          style={STYLES.messageList}
        >
        {messages.length === 0 ? (
          <Empty description="暂无消息" />
        ) : (
          <List>
            {messages.map((item) => (
              <List.Item key={item.id}>
                <div
                  style={{
                    padding: '8px 0',
                    display: 'flex',
                    justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    width: '100%'
                  }}
                >
                  {/* AI消息：头像在左，文本在右 */}
                  {item.sender === 'bot' && (
                    <Avatar
                      size="small"
                      style={{
                        margin: '0 8px 0 0',
                      }}
                    >
                      A
                    </Avatar>
                  )}
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      backgroundColor: item.sender === 'user' ? '#e6f7ff' : '#f0f0f0',
                      textAlign: item.sender === 'user' ? 'right' : 'left',
                      alignSelf: 'flex-start'
                    }}
                  >
                    {item.sender === 'bot' ? (
                      <MarkdownRenderer content={item.content} />
                    ) : (
                      <Text>{item.content}</Text>
                    )}
                  </div>
                  {/* 用户消息：头像在右，文本在左 */}
                  {item.sender === 'user' && (
                    <Avatar
                      size="small"
                      style={{
                        margin: '0 0 0 8px',
                      }}
                    >
                      U
                    </Avatar>
                  )}
                </div>
              </List.Item>
            ))}
          </List>
        )}
        {isLoading && (
          <div style={{ padding: '8px 16px', textAlign: 'center' }}>
            <Text type="secondary">AI助手正在思考...</Text>
          </div>
        )}
      </div>
      <div 
          ref={inputContainerRef}
          className="chat-input-container"
          style={STYLES.inputContainer}
        >
        {showScrollButton && (
          <IconButton
            type="primary"
            size="small"
            icon={<IconArrowUpRight />}
            onClick={handleScrollButtonClick}
            style={STYLES.scrollButton}
            onMouseEnter={(e) => {
              if (e.currentTarget) {
                e.currentTarget.style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              if (e.currentTarget) {
                e.currentTarget.style.opacity = '0.8';
              }
            }}
            data-testid="scroll-to-bottom-button"
          />
        )}
        <Input
            value={inputValue}
            onChange={(value) => setInputValue(value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题..."
            disabled={isLoading}
            className="chat-input"
              style={STYLES.textarea}
              ref={textareaRef}
          />
        <Button onClick={handleSendMessage} disabled={isLoading}>发送</Button>
      </div>
    </div>
  );
};

export default ChatInterface;
