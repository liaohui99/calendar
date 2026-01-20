// src/components/ai-chat/ChatInterface.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, List, Avatar, Typography, Tooltip } from '@douyinfe/semi-ui';
import { sendChatMessageStream, getChatMessages } from '../../services/aiChatService';
import { IconArrowUpRight } from '@douyinfe/semi-icons';
import MarkdownRenderer from './MarkdownRenderer';

/**
 * 会话消息数据定义
 */
interface ChatMessageData {
  memoryId: number;
  messages: any[];
}

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
    padding: '0'
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
    backgroundColor: 'var(--bg-secondary)',
    padding: '12px 0',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: 'none',
    boxShadow: 'none'
  },
  inputWrapper: {
    width: '100%',
    maxWidth: '1000px', /* 缩小输入框长度 */
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    padding: '0 20px'
  },
  textarea: {
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    borderRadius: '20px',
    minHeight: '83px', /* 3行文本高度 (14px字体 * 1.5行高 * 3行 + 20px内边距) */
    maxHeight: '120px', /* 调整最大高度，允许更多行 */
    padding: '12px 60px 12px 18px', /* 增加内边距，提升视觉舒适度 */
    fontSize: '14px',
    backgroundColor: '#ffffff', /* 保持白色背景 */
    border: '1px solid #e5e7eb',
    resize: 'none',
    overflow: 'hidden',
    boxShadow: 'none',
    transition: 'height 0.3s ease',
    outline: 'none',
    lineHeight: '1.5',
    color: '#1f2937',
    margin: '0 auto',
    boxSizing: 'border-box',
    flexShrink: 0,
    position: 'relative' /* 设置为相对定位，使按钮可以相对于输入框定位 */
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
    position: 'fixed',
    bottom: '150px',
    right: '40px',
    zIndex: 1000,
    transition: 'all 0.4s ease-in-out' // 调整过渡动画时长为0.4秒，使用ease-in-out缓动函数
  },
  scrollButtonWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    boxShadow: '2px 4px 6px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.4s ease-in-out', // 调整过渡动画时长为0.4秒，使用ease-in-out缓动函数
    border: 'none',
    outline: 'none'
  },
  scrollButtonIcon: {
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
        padding: 12px !important;
        padding-bottom: env(safe-area-inset-bottom, 12px) !important;
      }
      .message-list {
        padding-bottom: 80px !important;
      }
      .message-bubble {
        max-width: 80% !important;
      }
      /* 中屏幕发送按钮调整 */
      .chat-input-container button {
        right: 16px !important;
        bottom: 16px !important;
        width: 36px !important;
        height: 36px !important;
      }
    }
    
    /* 小屏幕响应式适配 */
    @media (max-width: 480px) {
      .chat-input-container {
        padding: 8px !important;
        padding-bottom: env(safe-area-inset-bottom, 24px) !important;
      }
      .message-list {
        padding-bottom: 90px !important;
      }
      .message-bubble {
        max-width: 85% !important;
      }
      /* 小屏幕发送按钮调整 */
      .chat-input-container button {
        right: 12px !important;
        bottom: 12px !important;
        width: 36px !important;
        height: 36px !important;
      }
    }
    /* 中屏幕响应式适配 */
    @media (max-width: 768px) {
      /* 中屏幕发送按钮调整 */
      .chat-input-container button {
        right: 16px !important;
        bottom: 16px !important;
        width: 36px !important;
        height: 36px !important;
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
  
  // 加载状态
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(true);
  
  const [messages, setMessages] = useState<Message[]>([]);
  
  /**
   * 从后端加载会话消息
   */
  const loadMessagesFromBackend = useCallback(async () => {
    setIsMessagesLoading(true);
    try {
      const chatMessageData = await getChatMessages(memoryId);
      if (chatMessageData && chatMessageData.messages && chatMessageData.messages.length > 0) {
        // 转换后端消息格式为前端消息格式
        const convertedMessages = chatMessageData.messages.map((msg: any) => ({
          id: `${msg.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          content: msg.text || '',
          sender: msg.type === 'USER' ? 'user' : 'bot',
          isError: false
        }));
        setMessages(convertedMessages);
      } else {
        // 没有消息时显示欢迎消息
        setMessages([
          {
            id: 'welcome',
            content: '你好！我是日历图表助手，有什么可以帮到你的吗？',
            sender: 'bot'
          }
        ]);
      }
    } catch (error) {
      console.error('加载会话消息失败:', error);
      // 加载失败时显示欢迎消息
      setMessages([
        {
          id: 'welcome',
          content: '你好！我是日历图表助手，有什么可以帮到你的吗？',
          sender: 'bot'
        }
      ]);
    } finally {
      setIsMessagesLoading(false);
    }
  }, [memoryId]);
  
  // 初始加载会话消息
  useEffect(() => {
    loadMessagesFromBackend();
  }, [loadMessagesFromBackend]);
  
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [scrollButtonHovered, setScrollButtonHovered] = useState<boolean>(false);
  const [scrollButtonPressed, setScrollButtonPressed] = useState<boolean>(false);
  const [textareaFocused, setTextareaFocused] = useState<boolean>(false);
  const [scrollButtonPosition, setScrollButtonPosition] = useState<{ bottom: string; right: string }>({ 
    bottom: '150px',
    right: '40px'
  });
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 计算滚动到底部按钮的位置
   * 与发送按钮保持垂直对齐，位于输入框外部，并根据屏幕尺寸自适应
   */
  const calculateScrollButtonPosition = useCallback(() => {
    const inputContainer = inputContainerRef.current;
    if (!inputContainer) return;

    try {
      // 查找输入框元素
      const textarea = inputContainer.querySelector('textarea');
      
      // 查找发送按钮元素
      const sendButton = inputContainer.querySelector('.send-button') || 
                        inputContainer.querySelector('[alt="发送"]') || 
                        inputContainer.querySelector('button');
      
      if (sendButton && textarea) {
        // 获取发送按钮的位置和尺寸
        const sendButtonRect = sendButton.getBoundingClientRect();
        
        // 获取输入框的位置和尺寸
        const textareaRect = textarea.getBoundingClientRect();
        
        // 滚动按钮高度固定为36px，与发送按钮一致
        const buttonHeight = 36;
        
        // 计算滚动按钮的垂直位置，与发送按钮保持中心对齐
        const centerAlign = sendButtonRect.top + sendButtonRect.height / 2 - buttonHeight / 2;
        
        // 将相对于视口的top值转换为相对于视口底部的bottom值
        let bottomPosition = window.innerHeight - centerAlign;
        
        // 确保滚动按钮位于输入框外部区域
        // 输入框顶部距离视口底部的距离
        const textareaBottomDistance = window.innerHeight - textareaRect.top;
        // 滚动按钮底部距离视口底部的距离应该大于输入框底部距离视口底部的距离
        const minBottomPosition = textareaBottomDistance + 20; // 保持20px的间距
        
        // 取两者中的较大值，确保按钮在输入框外部
        bottomPosition = Math.max(bottomPosition, minBottomPosition);
        
        // 边界检测：确保按钮不会超出视口底部
        const viewportPadding = 20; // 视口内边距
        bottomPosition = Math.min(bottomPosition, window.innerHeight - buttonHeight - viewportPadding);
        
        // 确保按钮不会超出视口顶部（至少保持20px的间距）
        bottomPosition = Math.max(bottomPosition, buttonHeight + viewportPadding);
        
        // 计算按钮的right值，直接使用发送按钮相对于视口的right值
        const sendButtonRightFromViewport = window.innerWidth - sendButtonRect.right;
        const rightPosition = sendButtonRightFromViewport;
        
        // 更新按钮位置
        setScrollButtonPosition({ 
          bottom: `${bottomPosition}px`,
          right: `${rightPosition}px`
        });
      } else {
        // 如果找不到发送按钮或输入框，使用默认逻辑
        // 获取输入框容器的位置和尺寸
        const containerRect = inputContainer.getBoundingClientRect();
        
        // 滚动按钮高度固定为36px
        const buttonHeight = 36;
        
        // 计算按钮的bottom值：输入框容器顶部距离视口底部的距离 + 20px偏移量
        let bottomPosition = window.innerHeight - containerRect.top + 20;
        
        // 边界检测：确保按钮不会超出视口底部
        const viewportPadding = 20; // 视口内边距
        bottomPosition = Math.min(bottomPosition, window.innerHeight - buttonHeight - viewportPadding);
        
        // 确保按钮不会超出视口顶部（至少保持20px的间距）
        bottomPosition = Math.max(bottomPosition, buttonHeight + viewportPadding);
        
        // 计算按钮的right值，与发送按钮保持水平对齐，并根据屏幕尺寸自适应
        let rightOffset = 36; // 默认大屏幕：20px（padding）+ 16px（发送按钮right）
        if (window.innerWidth <= 480) {
          rightOffset = 32; // 小屏幕：20px（padding）+ 12px（发送按钮right）
        }
        const rightPosition = window.innerWidth - containerRect.right + rightOffset;
        
        // 更新按钮位置
        setScrollButtonPosition({ 
          bottom: `${bottomPosition}px`,
          right: `${rightPosition}px`
        });
      }
    } catch (error) {
      console.error('计算滚动按钮位置失败:', error);
      // 错误时恢复默认位置
      setScrollButtonPosition({ 
        bottom: '150px',
        right: '40px'
      });
    }
  }, []);

  /**
   * 防抖处理函数
   */
  const debouncedCalculatePosition = useCallback(() => {
    // 清除之前的定时器
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // 设置新的定时器，100ms后执行位置计算
    debounceTimeoutRef.current = setTimeout(() => {
      calculateScrollButtonPosition();
    }, 100);
  }, [calculateScrollButtonPosition]);

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
    setAutoScrollEnabled(true);
    
    // 重置输入框高度为默认三行
    setTimeout(() => {
      adjustTextareaHeight();
      scrollMessageListToBottom();
    }, 0);

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
        // 立即滚动到底部
        setTimeout(() => scrollMessageListToBottom(), 0);
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
    // 只有单独按下Enter键时发送消息，Shift+Enter允许换行
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage();
    }
  };
  
  /**
   * 自动调整文本框高度
   */
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // 重置高度以计算正确的滚动高度
    textarea.style.height = 'auto';
    
    const minHeight = 72; // 3行
    const maxHeight = 120; // 5行
    const scrollHeight = textarea.scrollHeight;
    
    // 计算新高度，不超过最大值
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
    
    // 当达到最大高度时显示滚动条，否则隐藏
    textarea.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
    
    // 调整文本框高度后，重新计算滚动按钮位置和高度
    debouncedCalculatePosition();
  };

  /**
   * 检测消息列表是否需要显示滚动按钮
   */
  const checkContentOverflow = useCallback(() => {
    if (!messageListRef.current) return;
    
    const messageList = messageListRef.current;
    const { scrollTop, scrollHeight, clientHeight } = messageList;
    const threshold = 50;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < threshold;
    
    // 只有当消息列表内容足够滚动时，才根据滚动位置设置状态
    if (scrollHeight > clientHeight) {
      if (isAtBottom) {
        setAutoScrollEnabled(true);
      } else {
        setAutoScrollEnabled(false);
      }
    } else {
      // 如果内容不足以滚动，设置为自动滚动状态
      setAutoScrollEnabled(true);
    }
  }, []);

  /**
   * 处理滚动按钮点击
   */
  const handleScrollButtonClick = () => {
    scrollMessageListToBottom();
    setAutoScrollEnabled(true);
  };

  /**
   * 将消息列表滚动到底部
   */
  const scrollMessageListToBottom = useCallback(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;
    
    const scrollToBottom = () => {
      const scrollHeight = messageList.scrollHeight;
      messageList.scrollTop = scrollHeight;
      // 如果一次不行，再试一次确保滚动到位
      if (messageList.scrollTop !== scrollHeight) {
        messageList.scrollTop = scrollHeight;
      }
    };
    
    // 立即执行
    scrollToBottom();
    // 稍后再执行一次，确保DOM更新后也能滚动
    setTimeout(scrollToBottom, 50);
    setTimeout(scrollToBottom, 100);
  }, []);

  // 监听messages变化，自动滚动到底部
  useEffect(() => {
    if (autoScrollEnabled) {
      scrollMessageListToBottom();
    }
  }, [messages, isLoading, autoScrollEnabled]);

  // 监听消息列表滚动事件，更新自动滚动状态
  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;
    
    // 监听消息列表滚动事件
    messageList.addEventListener('scroll', checkContentOverflow);
    
    // 初始检查一次位置
    setTimeout(checkContentOverflow, 100);
    
    return () => {
      messageList.removeEventListener('scroll', checkContentOverflow);
    };
  }, [checkContentOverflow]);
  
  // 监听输入值变化，调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // 监听输入框高度变化，调整滚动按钮位置
  useEffect(() => {
    // 检查浏览器是否支持ResizeObserver
    if (typeof ResizeObserver !== 'undefined') {
      // 初始化ResizeObserver
      resizeObserverRef.current = new ResizeObserver(() => {
        debouncedCalculatePosition();
      });

      // 监听输入框容器
      if (inputContainerRef.current) {
        resizeObserverRef.current.observe(inputContainerRef.current);
      }
    }

    // 监听窗口大小变化
    const handleWindowResize = () => {
      debouncedCalculatePosition();
    };
    window.addEventListener('resize', handleWindowResize);

    // 监听输入框容器尺寸变化（作为ResizeObserver的降级方案）
    const handleInputContainerResize = () => {
      debouncedCalculatePosition();
    };
    if (inputContainerRef.current) {
      inputContainerRef.current.addEventListener('resize', handleInputContainerResize);
    }

    // 初始计算位置
    calculateScrollButtonPosition();

    // 清理函数
    return () => {
      // 停止ResizeObserver监听
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      
      // 清除窗口大小变化监听
      window.removeEventListener('resize', handleWindowResize);
      
      // 清除输入框容器尺寸变化监听
      if (inputContainerRef.current) {
        inputContainerRef.current.removeEventListener('resize', handleInputContainerResize);
      }
      
      // 清除防抖定时器
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [calculateScrollButtonPosition, debouncedCalculatePosition]);

  // 监听输入框高度变化事件（输入、聚焦、失焦等）
  useEffect(() => {
    // 延迟执行，确保DOM已经更新
    setTimeout(() => {
      debouncedCalculatePosition();
    }, 0);
  }, [inputValue, textareaFocused, isLoading, debouncedCalculatePosition]);

  return (
    <div style={STYLES.container}>
      <div 
          ref={messageListRef}
          className="message-list"
          style={STYLES.messageList}
        >
        {isMessagesLoading ? (
          <div style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text type="secondary">加载中...</Text>
          </div>
        ) : messages.length === 0 ? (
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
      
      {/* 滚动到底部按钮 - 当消息列表不在底部时显示 */}
      {!autoScrollEnabled && messages.length > 1 && (
        <div 
          className="scroll-button"
          style={{ ...STYLES.scrollButton, bottom: scrollButtonPosition.bottom, right: scrollButtonPosition.right }}
        >
          <button
            onClick={handleScrollButtonClick}
            onMouseEnter={() => setScrollButtonHovered(true)}
            onMouseLeave={() => {
              setScrollButtonHovered(false);
              setScrollButtonPressed(false);
            }}
            onMouseDown={() => setScrollButtonPressed(true)}
            onMouseUp={() => setScrollButtonPressed(false)}
            aria-label="回到最新消息"
            style={{
              ...STYLES.scrollButtonWrapper,
              transform: scrollButtonPressed ? 'scale(0.95)' : scrollButtonHovered ? 'scale(1.05)' : 'scale(1)',
              backgroundColor: '#FFFFFF',
              boxShadow: scrollButtonPressed
                ? '2px 4px 4px rgba(0, 0, 0, 0.12)'
                : scrollButtonHovered
                  ? '2px 4px 8px rgba(0, 0, 0, 0.2)'
                  : '2px 4px 6px rgba(0, 0, 0, 0.15)'
            }}
          >
            <span style={STYLES.scrollButtonIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeLinecap="round" strokeWidth="2" width="18" height="18">
                <path d="M12 4v16m-6-6l6 6l6-6"/>
              </svg>
            </span>
          </button>
        </div>
      )}
      
      <div 
            ref={inputContainerRef}
            className="chat-input-container"
            style={STYLES.inputContainer}
          >
          {/* 输入框容器 - 相对定位，用于包含内嵌按钮 */}
          <div style={STYLES.inputWrapper}>
            {/* 输入框包装器 - 相对定位，用于准确放置按钮 */}
            <div style={{position: 'relative', width: '100%'}}>
              {/* 输入框 */}
              <textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  setTextareaFocused(true);
                  adjustTextareaHeight();
                }}
                onBlur={() => {
                  setTextareaFocused(false);
                  adjustTextareaHeight();
                }}
                placeholder="有问题，尽管问，shift+enter换行"
                disabled={isLoading}
                className="chat-input"
                style={{
                  ...STYLES.textarea,
                  boxShadow: textareaFocused ? '0 0 0 2px rgba(0, 123, 255, 0.25)' : 'none',
                  position: 'static', // 改为静态定位，避免影响按钮定位
                  zIndex: 0 // 确保输入框在按钮下方
                }}
                ref={textareaRef}
              />
              
              {/* 发送按钮 - 箭头图标，位于输入框内右下角 */}
      <div
        className="send-button"
        onClick={handleSendMessage}
        style={{
          position: 'absolute',
          right: '16px', // 调整右边距，使其位于输入框内右下角
          bottom: '16px', // 调整底边距，使其位于输入框内右下角
          borderRadius: '50%',
          width: '36px', // 保持合适的按钮尺寸
          height: '36px', // 保持合适的按钮尺寸
          minWidth: '36px',
          minHeight: '36px',
          maxWidth: '36px',
          maxHeight: '36px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff', // 与输入框背景色一致
          border: '1px solid #e5e7eb', // 与输入框边框颜色一致
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)', // 适当增强阴影，提升层次感
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          cursor: (!inputValue.trim() || isLoading) ? 'not-allowed' : 'pointer',
          opacity: (!inputValue.trim() || isLoading) ? 0.6 : 1,
          // 确保没有任何样式影响圆角
          boxSizing: 'border-box',
          lineHeight: '1',
          zIndex: 10 // 确保按钮在所有元素上方
        }}
        // 确保禁用状态下不响应点击
        onMouseDown={(e) => { if (!inputValue.trim() || isLoading) e.preventDefault(); }}
      >
                {/* 发送图标 - 使用指定的base64编码 */}
                <img 
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTYgMTYiPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTE2IDBMMCA4bDQuNyAxLjZMNSAxNWwyLjUtMi44TDEwIDE2ek03LjUgMTAuNGw0LjMtNS45bC02LjIgNC4zbC0zLTFMMTQuMiAyTDkuNyAxMy44eiIvPjwvc3ZnPg==" 
                  alt="发送" 
                  style={{ 
                    width: '16px', // 调整图标大小，与按钮匹配
                    height: '16px',
                    display: 'block',
                    // 根据按钮状态调整图标颜色，始终保持黑色或深色
                    filter: (!inputValue.trim() || isLoading) ? 'invert(50%)' : 'invert(0%)', // 有文本时黑色图标，无文本时灰色图标
                    // 确保图标居中
                    margin: '0',
                    padding: '0'
                  }} 
                />
              </div>
            </div>
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
