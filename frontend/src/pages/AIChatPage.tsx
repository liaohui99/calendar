// src/pages/AIChatPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ai-chat/ChatInterface';
import { clearChatMemory } from '../services/aiChatService';

const STORAGE_KEY = 'calendar-chat-memory-id';

/**
 * 生成基于UUID和时间戳的整数memoryId
 * @returns 整数类型的memoryId
 */
const generateMemoryId = (): number => {
  // 使用crypto.getRandomValues作为随机源，兼容不支持randomUUID的环境
  const getRandomValues = (length: number): Uint8Array => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return crypto.getRandomValues(new Uint8Array(length));
    }
    // 降级方案：使用Math.random
    const arr = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };
  
  // 生成UUID v4格式的字符串
  const generateUUID = (): string => {
    const values = getRandomValues(16);
    values[6] = (values[6] & 0x0f) | 0x40;
    values[8] = (values[8] & 0x3f) | 0x80;
    
    const hex = Array.from(values).map(b => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  };
  
  const uuid = generateUUID();
  const timestamp = Math.floor(Date.now() / 1000);
  
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const absHash = Math.abs(hash);
  return timestamp * 1000000000 + absHash % 1000000000;
};

/**
 * AI聊天页面组件
 * 作为AI对话功能的主页面，集成聊天界面组件
 */
interface SessionItem {
  id: number;
  title: string;
  timestamp: number;
  messages: any[];
}

const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 从localStorage读取或生成memoryId
  const [memoryId, setMemoryId] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return generateMemoryId();
  });
  
  // 新建会话加载状态
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
  
  // 历史会话列表
  const [sessionHistory, setSessionHistory] = useState<SessionItem[]>([]);
  
  // 鼠标是否悬浮在会话菜单上
  const [isSessionMenuHovered, setIsSessionMenuHovered] = useState<boolean>(false);
  
  /**
   * 获取所有历史会话
   */
  const getSessionHistory = useCallback(() => {
    const sessions: SessionItem[] = [];
    const keys = Object.keys(localStorage);
    
    // 收集所有会话消息键
    const messageKeys = keys.filter(key => key.startsWith('calendar-chat-messages-'));
    
    messageKeys.forEach(key => {
      try {
        // 从键名中提取memoryId
        const idStr = key.replace('calendar-chat-messages-', '');
        const id = parseInt(idStr, 10);
        
        if (!isNaN(id)) {
          // 获取会话消息
          const messagesJson = localStorage.getItem(key);
          if (messagesJson) {
            const messages = JSON.parse(messagesJson);
            if (Array.isArray(messages) && messages.length > 0) {
              // 提取第一条用户消息作为会话标题
              const firstUserMessage = messages.find(msg => msg.sender === 'user');
              const title = firstUserMessage ? firstUserMessage.content.substring(0, 20) + (firstUserMessage.content.length > 20 ? '...' : '') : '空会话';
              
              // 获取会话创建时间（从memoryId中提取，memoryId包含时间戳）
              const timestamp = Math.floor(id / 1000000000);
              
              sessions.push({
                id,
                title,
                timestamp,
                messages
              });
            }
          }
        }
      } catch (error) {
        console.error('解析会话数据失败:', error);
      }
    });
    
    // 按时间倒序排列，最新的会话在最前面
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  }, []);
  
  /**
   * 切换到历史会话
   */
  const switchToSession = useCallback((sessionId: number) => {
    // 更新当前会话ID
    setMemoryId(sessionId);
    localStorage.setItem(STORAGE_KEY, sessionId.toString());
    
    // 显示成功提示
    console.info('已切换到历史会话');
  }, []);
  
  /**
   * 定期更新会话历史
   */
  useEffect(() => {
    // 初始加载会话历史
    setSessionHistory(getSessionHistory());
    
    // 监听localStorage变化，更新会话历史
    const handleStorageChange = () => {
      setSessionHistory(getSessionHistory());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [getSessionHistory]);
  
  // 持久化memoryId到localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, memoryId.toString());
  }, [memoryId]);

  /**
   * 处理新会话按钮点击
   * 清空当前对话历史，创建新对话
   */
  const handleNewSession = useCallback(async () => {
    // 防止重复点击
    if (isCreatingSession) {
      return;
    }
    
    setIsCreatingSession(true);
    
    try {
      // 显示加载提示
      console.info('正在创建新对话...');
      
      // 调用后端API清空当前对话历史
      const clearSuccess = await clearChatMemory(memoryId);
      
      if (clearSuccess) {
        console.log('后端对话历史清空成功');
      } else {
        console.warn('后端对话历史清空失败，但继续创建新对话');
      }
      
      // 清除前端本地存储的当前会话消息
      const oldStorageKey = `calendar-chat-messages-${memoryId}`;
      localStorage.removeItem(oldStorageKey);
      
      // 生成新的memoryId
      const newMemoryId = generateMemoryId();
      setMemoryId(newMemoryId);
      localStorage.setItem(STORAGE_KEY, newMemoryId.toString());
      
      // 显示成功提示
      console.info('新对话已创建');
      
    } catch (error) {
      console.error('创建新会话失败:', error);
      
      // 即使后端失败，也尝试创建新对话
      const oldStorageKey = `calendar-chat-messages-${memoryId}`;
      localStorage.removeItem(oldStorageKey);
      
      const newMemoryId = generateMemoryId();
      setMemoryId(newMemoryId);
      localStorage.setItem(STORAGE_KEY, newMemoryId.toString());
      
      console.warn('新对话已创建（后端同步失败）');
    } finally {
      setIsCreatingSession(false);
    }
  }, [memoryId, isCreatingSession]);

  return (
    <div className="page-layout" style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <header style={{ 
        backgroundColor: 'var(--bg-primary)', 
        padding: '16px 24px', 
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: 'var(--text-primary)', 
          fontSize: '20px',
          fontWeight: 700
        }}>
          日历AI助手
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 返回按钮 */}
          <Button 
            icon="left" 
            onClick={() => navigate('/')} 
            size="small"
            type="secondary"
          >
            返回预约系统
          </Button>
          
          {/* 会话菜单 - 包含新建会话和历史会话 */}
          <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => {
              // 延迟显示菜单，确保鼠标已进入稳定区域
              setTimeout(() => {
                setIsSessionMenuHovered(true);
              }, 50);
            }}
            onMouseLeave={() => {
              // 延迟隐藏菜单，给用户时间移入子菜单
              setTimeout(() => {
                setIsSessionMenuHovered(false);
              }, 150);
            }}
          >
            <Button 
              type="primary" 
              size="small"
              loading={isCreatingSession}
              style={{ marginBottom: 0 }}
            >
              新会话
            </Button>
            
            {/* 历史会话下拉菜单 */}
            {isSessionMenuHovered && (
              <div
                onMouseEnter={() => {
                  // 鼠标进入菜单时取消隐藏定时器
                  setTimeout(() => {
                    setIsSessionMenuHovered(true);
                  }, 50);
                }}
                onMouseLeave={() => {
                  // 延迟隐藏
                  setTimeout(() => {
                    setIsSessionMenuHovered(false);
                  }, 150);
                }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '2px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '6px',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: '280px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}
              >
                {/* 新建会话菜单项 */}
                <div
                  onClick={handleNewSession}
                  style={{
                    padding: '12px 16px',
                    fontWeight: 'bold',
                    borderBottom: '1px solid var(--border-primary)',
                    cursor: isCreatingSession ? 'not-allowed' : 'pointer',
                    color: isCreatingSession ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  新建会话
                </div>
                
                {/* 历史会话列表 */}
                {sessionHistory.length > 0 ? (
                  sessionHistory.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => switchToSession(session.id)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-primary)',
                        backgroundColor: session.id === memoryId ? 'var(--color-bg-light)' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: session.id === memoryId ? 'bold' : 'normal',
                          color: session.id === memoryId ? 'var(--primary-color)' : 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {session.title}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-tertiary)'
                        }}>
                          {new Date(session.timestamp * 1000).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '20px 16px',
                    textAlign: 'center',
                    color: 'var(--text-tertiary)'
                  }}>
                    暂无历史会话
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main style={{ 
        padding: '20px 24px 100px', 
        backgroundColor: 'var(--bg-secondary)',
        minHeight: 'calc(100vh - 80px)',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ margin: '0 auto', height: 'calc(100vh - 160px)' }}>
          <ChatInterface memoryId={memoryId} />
        </div>
      </main>
    </div>
  );
};

export default AIChatPage;