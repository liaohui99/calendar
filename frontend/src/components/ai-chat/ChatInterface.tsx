// src/components/ai-chat/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, List, Avatar, Typography, Empty, IconButton } from '@douyinfe/semi-ui';
import { sendChatMessage, sendChatMessageStream } from '../../services/aiChatService';
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
  isError?: boolean; // 标识是否为错误消息
}

/**
 * 聊天界面组件
 * 提供用户与AI助手的交互界面，实现输入框固定定位和内容滚动功能
 */
interface ChatInterfaceProps {
  memoryId: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ memoryId }) => {
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

    // 生成唯一的用户消息ID（使用时间戳+随机数）
    const userMessageId = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // 添加用户消息
    console.log('准备添加用户消息到界面，消息ID:', userMessageId);
    const userMessage: Message = {
      id: userMessageId,
      content: inputValue,
      sender: 'user'
    };

    setMessages(prevMessages => {
      const newMessages = [...prevMessages, userMessage];
      console.log('添加用户消息后，消息列表:', newMessages);
      return newMessages;
    });
    setInputValue('');
    setIsLoading(true);

    // 生成唯一的AI消息ID（使用时间戳+随机数）
    const botMessageId = `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // 创建初始的AI回复消息
    console.log('准备添加AI初始消息，消息ID:', botMessageId);
    const initialBotMessage: Message = {
      id: botMessageId,
      content: '',
      sender: 'bot',
      isError: false
    };
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, initialBotMessage];
      console.log('添加AI初始消息后，消息列表:', newMessages);
      return newMessages;
    });

    try {
      console.log('调用聊天服务sendChatMessageStream');
      
      // 定义部分响应处理函数
      const handlePartialResponse = (chunk: string) => {
        console.log('收到流式响应chunk:', chunk);
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
          console.log('查找AI消息，ID:', botMessageId, '索引:', botMessageIndex);
          if (botMessageIndex !== -1) {
            // 创建新的消息对象，确保React能检测到变化
            updatedMessages[botMessageIndex] = {
              ...updatedMessages[botMessageIndex],
              content: updatedMessages[botMessageIndex].content + chunk
            };
            console.log('更新AI消息内容后:', updatedMessages[botMessageIndex]);
          } else {
            console.error('未找到AI消息，ID:', botMessageId);
          }
          return updatedMessages;
        });
      };
      
      // 调用聊天服务（流式）
      const response = await sendChatMessageStream({ message: inputValue, memoryId }, handlePartialResponse);
      
      console.log('收到聊天服务完整响应:', response);
      
      // 流式响应已经通过handlePartialResponse实时更新了消息内容，这里只需要确保最终内容正确
      if (response && !response.success) {
        console.error('服务返回失败:', response);
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
          if (botMessageIndex !== -1) {
            updatedMessages[botMessageIndex] = {
              ...updatedMessages[botMessageIndex],
              content: response.error ? `处理失败: ${response.error}` : '抱歉，我无法处理您的请求。',
              isError: true
            };
          }
          return updatedMessages;
        });
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
      
      // 更新AI消息为错误信息
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
        if (botMessageIndex !== -1) {
          updatedMessages[botMessageIndex] = {
            ...updatedMessages[botMessageIndex],
            content: errorContent,
            isError: true
          };
        }
        return updatedMessages;
      });
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

  // 监听memoryId变化，重置聊天记录
  useEffect(() => {
    // memoryId变化时，重置聊天记录
    setMessages([
      {
        id: 'welcome',
        content: '你好！我是日历图表助手，有什么可以帮到你的吗？',
        sender: 'bot'
      }
    ]);
  }, [memoryId]);

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
                        backgroundColor: 'rgba(24, 144, 255, 0.8)', // 淡蓝色背景，添加80%透明度，参考市面AI工具设计
                        color: '#ffffff' // 白色文字，提高对比度
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
                      <MarkdownRenderer 
                        content={item.content} 
                        style={item.isError ? { color: '#ff4d4f' } : undefined}
                      />
                    ) : (
                      <Text style={item.isError ? { color: '#ff4d4f' } : undefined}>
                        {item.content}
                      </Text>
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
