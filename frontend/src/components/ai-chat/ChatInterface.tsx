// src/components/ai-chat/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, List, Avatar, Typography, Empty, IconButton, Tooltip } from '@douyinfe/semi-ui';
import { sendChatMessage, sendChatMessageStream } from '../../services/aiChatService';
import { IconArrowUpRight } from '@douyinfe/semi-icons';
import MarkdownRenderer from './MarkdownRenderer';

// 样式常量 - 参考优秀AI问答页面设计
const STYLES = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-bg)',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 0 100px',
    scrollBehavior: 'smooth'
  },
  messageListWrapper: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '80px',
    width: '100%'
  },
  inputContainer: {
    position: 'fixed',
    bottom: 0,
    left: '0',
    right: '0',
    backgroundColor: '#ffffff',
    padding: '12px 8px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px solid #e5e7eb',
    boxShadow: 'none'
  },
  inputWrapper: {
    width: '100%',
    maxWidth: '1200px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    padding: '0 10px'
  },
  textarea: {
    width: 'calc(100% - 0px)',
    minWidth: 'calc(100% - 0px)',
    maxWidth: 'calc(100% - 0px)',
    borderRadius: '20px',
    height: '56px',
    minHeight: '56px',
    maxHeight: '180px',
    padding: '14px 56px 14px 20px',
    fontSize: '14px',
    backgroundColor: '#f7f7f8',
    border: '1px solid #e5e7eb',
    resize: 'none',
    overflow: 'auto',
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    outline: 'none',
    lineHeight: '1.5',
    color: '#1f2937',
    margin: '0 auto',
    boxSizing: 'border-box',
    flexShrink: 0
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '1.6',
    wordBreak: 'break-word'
  },
  aiMessageBubble: {
    backgroundColor: '#ffffff',
    color: 'var(--text-primary)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px 16px 16px 4px'
  },
  userMessageBubble: {
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    borderRadius: '16px 16px 4px 16px'
  },
  avatar: {
    margin: '0 8px',
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    fontSize: '14px'
  },
  userAvatar: {
    margin: '0 0 0 8px',
    backgroundColor: 'var(--success-color)'
  },
  scrollButton: {
    position: 'absolute',
    bottom: '100%',
    right: '16px',
    marginBottom: '8px',
    opacity: 0.8,
    transition: 'opacity 0.3s'
  },
  disclaimerText: {
    width: '100%',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    marginTop: '8px'
  },
  typingIndicator: {
    padding: '16px 20px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    color: 'var(--text-tertiary)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    opacity: '0.3'
  }
} as const;

// 空状态图标组件
const EmptyChatIcon: React.FC = () => (
  <svg 
    width="64" 
    height="64" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    style={{ opacity: 0.3 }}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// 添加CSS样式标签到文档头
const addResponsiveStyles = () => {
  const existingStyle = document.getElementById('chat-interface-responsive-styles');
  if (existingStyle) return;
  
  const style = document.createElement('style');
  style.id = 'chat-interface-responsive-styles';
  style.textContent = `
    /* 输入框宽度强制一致 */
    .chat-input {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      flex-shrink: 0 !important;
    }
    
    /* 中屏幕响应式适配 */
    @media (max-width: 768px) {
      .chat-input-container {
        padding: '12px' !important;
        paddingBottom: env(safe-area-inset-bottom, 12px) !important;
      }
      .message-list {
        padding-bottom: '80px' !important;
      }
      .message-bubble {
        maxWidth: '80%' !important;
      }
    }
    
    /* 小屏幕响应式适配 */
    @media (max-width: 480px) {
      .chat-input-container {
        padding: '8px' !important;
        paddingBottom: env(safe-area-inset-bottom, 24px) !important;
      }
      .message-list {
        padding-bottom: '90px' !important;
      }
      .message-bubble {
        maxWidth: '85%' !important;
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
  isError?: boolean;
}

/**
 * 动态思考状态组件
 * 显示"AI助手正在思考"带循环点号动画效果
 */
const ThinkingIndicator: React.FC = () => {
  const [dotCount, setDotCount] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 7);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      AI助手正在思考
      <span style={{ display: 'inline-block', width: '20px', textAlign: 'left' }}>
        {'.'.repeat(dotCount)}
      </span>
    </span>
  );
};

// 创建自定义纸飞机图标组件
const PaperPlaneIcon: React.FC = () => {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 1024 1024" 
      fill="currentColor"
    >
      <path d="M896 512v352q0 13-9.5 22.5T864 896h-64L656 752l-272 272L0 0l1024 384zm-64 0L128 128l704 704z"/>
    </svg>
  );
};

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
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  /**
   * 处理发送消息
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) {
      return;
    }

    // 生成唯一的用户消息ID
    const userMessageId = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // 添加用户消息
    const userMessage: Message = {
      id: userMessageId,
      content: inputValue,
      sender: 'user'
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 定义部分响应处理函数
      let botMessageId = '';
      let isFirstChunk = true;
      
      const handlePartialResponse = (chunk: string) => {
        setMessages(prevMessages => {
          if (isFirstChunk) {
            // 首次收到响应，创建AI消息
            botMessageId = `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            isFirstChunk = false;
            return [...prevMessages, {
              id: botMessageId,
              content: chunk,
              sender: 'bot',
              isError: false
            }];
          } else {
            // 更新已有AI消息
            const updatedMessages = [...prevMessages];
            const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
            if (botMessageIndex !== -1) {
              updatedMessages[botMessageIndex] = {
                ...updatedMessages[botMessageIndex],
                content: updatedMessages[botMessageIndex].content + chunk
              };
            }
            return updatedMessages;
          }
        });
      };
      
      // 调用聊天服务（流式）
      const response = await sendChatMessageStream({ message: inputValue, memoryId }, handlePartialResponse);
      
      // 处理服务返回的完整响应
      if (response && !response.success) {
        // 如果没有收到任何流响应，但服务返回了错误
        if (isFirstChunk) {
          const errorBotMessageId = `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          setMessages(prevMessages => [...prevMessages, {
            id: errorBotMessageId,
            content: response.error ? `处理失败: ${response.error}` : '抱歉，我无法处理您的请求。',
            sender: 'bot',
            isError: true
          }]);
        } else {
          // 更新已有AI消息为错误状态
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
      
      // 创建错误消息
      const errorBotMessageId = `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setMessages(prevMessages => [...prevMessages, {
        id: errorBotMessageId,
        content: errorContent,
        sender: 'bot',
        isError: true
      }]);
    } finally {
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
    scrollMessageListToBottom();
    setAutoScrollEnabled(true);
  };

  /**
   * 检测用户是否滚动到了底部
   */
  const checkIsAtBottom = () => {
    if (!messageListRef.current) return false;
    
    const messageList = messageListRef.current;
    const { scrollTop, scrollHeight, clientHeight } = messageList;
    const threshold = 50;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  /**
   * 将消息列表滚动到底部
   */
  const scrollMessageListToBottom = () => {
    if (!messageListRef.current) return;
    
    const messageList = messageListRef.current;
    messageList.scrollTop = messageList.scrollHeight;
  };

  /**
   * 处理消息列表滚动事件
   */
  const handleMessageListScroll = () => {
    const isAtBottom = checkIsAtBottom();
    
    if (isAtBottom) {
      setAutoScrollEnabled(true);
    } else {
      setAutoScrollEnabled(false);
    }
  };

  // 监听messages变化，自动滚动到底部
  useEffect(() => {
    if (autoScrollEnabled) {
      scrollMessageListToBottom();
    }
  }, [messages, isLoading, autoScrollEnabled]);

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
    setMessages([
      {
        id: 'welcome',
        content: '你好！我是日历图表助手，有什么可以帮到你的吗？',
        sender: 'bot'
      }
    ]);
  }, [memoryId]);

  // 设置消息列表滚动监听
  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;
    
    messageList.addEventListener('scroll', handleMessageListScroll);
    
    return () => {
      messageList.removeEventListener('scroll', handleMessageListScroll);
    };
  }, []);

  return (
    <div style={STYLES.container}>
      <div 
          ref={messageListRef}
          className="message-list"
          style={STYLES.messageList}
        >
        {messages.length === 0 ? (
          <div style={STYLES.emptyState}>
            <EmptyChatIcon />
            <Text type="secondary" style={{ fontSize: '16px', marginBottom: '10px' }}>
              暂无消息
            </Text>
            <Text type="tertiary" style={{ fontSize: '14px' }}>
              开始与日历图表助手对话吧
            </Text>
          </div>
        ) : (
          <List
              style={{
                padding: '0 20px'
              }}
            >
            {messages.map((item) => (
              <List.Item key={item.id} style={{ padding: '8px 0' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    width: '100%'
                  }}
                >
                  {/* AI消息：头像在左，文本在右 */}
                  {item.sender === 'bot' && (
                    <Avatar
                      size="medium"
                      style={STYLES.avatar}
                    >
                      A
                    </Avatar>
                  )}
                  <div
                    className="message-bubble"
                    style={{
                      ...STYLES.messageBubble,
                      ...(item.sender === 'bot' ? STYLES.aiMessageBubble : STYLES.userMessageBubble),
                      border: item.isError ? `1px solid var(--error-color)` : 'none'
                    }}
                  >
                    {item.sender === 'bot' ? (
                      <MarkdownRenderer 
                        content={item.content} 
                        style={item.isError ? { color: 'var(--error-color)' } : { color: 'var(--text-primary)' }}
                      />
                    ) : (
                      <Text style={item.isError ? { color: '#ffcccc' } : { color: '#ffffff' }}>
                        {item.content}
                      </Text>
                    )}
                  </div>
                  {/* 用户消息：头像在右，文本在左 */}
                  {item.sender === 'user' && (
                    <Avatar
                      size="medium"
                      style={{
                        ...STYLES.avatar,
                        ...STYLES.userAvatar
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
          <div style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}>
            <Avatar
              size="medium"
              style={STYLES.avatar}
            >
              A
            </Avatar>
            <div style={STYLES.typingIndicator}>
              <Text type="secondary"><ThinkingIndicator /></Text>
            </div>
          </div>
        )}
      </div>
      <div 
            ref={inputContainerRef}
            className="chat-input-container"
            style={STYLES.inputContainer}
          >
          {/* 输入框容器 */}
          <div style={STYLES.inputWrapper}>
            {/* 输入框 */}
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="有问题，尽管问，shift+enter换行"
              disabled={isLoading}
              className="chat-input"
              style={STYLES.textarea}
              ref={textareaRef}
            />
            
            {/* 发送按钮 - 箭头图标 */}
            <Tooltip 
              content={!inputValue.trim() && !isLoading ? "请输入你的问题" : "发送消息"}
              position="top"
            >
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading}
                type="tertiary"
                size="small"
                icon={<IconArrowUpRight style={{ transform: 'rotate(-45deg)' }} />}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  minWidth: 'auto',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#6b7280'
                }}
              />
            </Tooltip>
          </div>
          
          {/* 底部提示文字 - 调整位置 */}
          <div style={{ ...STYLES.disclaimerText, marginTop: '6px' }}>
            <span>内容由AI生成, 请仔细甄别</span>
          </div>
      </div>
    </div>
  );
};

export default ChatInterface;
