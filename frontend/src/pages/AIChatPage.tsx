// src/pages/AIChatPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ai-chat/ChatInterface';
import { clearChatMemory, createNewSession, getSessions } from '../services/aiChatService';

const STORAGE_KEY = 'calendar-chat-memory-id';

/**
 * 会话信息定义
 */
interface SessionInfo {
  memoryId: number;
  title: string;
  messageCount: number;
  createTime: string;
  updateTime: string;
}

/**
 * AI聊天页面组件
 * 作为AI对话功能的主页面，集成聊天界面组件
 */
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
    return Date.now();
  });
  
  // 新建会话加载状态
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
  
  // 历史会话列表
  const [sessionHistory, setSessionHistory] = useState<SessionInfo[]>([]);
  
  // 鼠标是否悬浮在会话菜单上
  const [isSessionMenuHovered, setIsSessionMenuHovered] = useState<boolean>(false);
  
  /**
   * 获取所有历史会话
   */
  const getSessionHistory = useCallback(async () => {
    try {
      const sessions = await getSessions();
      return sessions;
    } catch (error) {
      console.error('获取会话历史失败:', error);
      return [];
    }
  }, []);
  
  /**
   * 切换到历史会话
   */
  const switchToSession = useCallback(async (sessionId: number) => {
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
    getSessionHistory().then(sessions => setSessionHistory(sessions));
    
    // 每5秒刷新一次会话列表
    const intervalId = setInterval(() => {
      getSessionHistory().then(sessions => setSessionHistory(sessions));
    }, 5000);
    
    return () => {
      clearInterval(intervalId);
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
      
      // 调用后端API创建新会话
      const newMemoryId = await createNewSession();
      
      if (newMemoryId) {
        console.log('创建新会话成功:', newMemoryId);
        setMemoryId(newMemoryId);
        localStorage.setItem(STORAGE_KEY, newMemoryId.toString());
      } else {
        console.warn('创建新会话失败，使用本地生成');
        // 降级方案：使用本地生成的时间戳
        const fallbackMemoryId = Date.now();
        setMemoryId(fallbackMemoryId);
        localStorage.setItem(STORAGE_KEY, fallbackMemoryId.toString());
      }
      
      // 显示成功提示
      console.info('新对话已创建');
      
    } catch (error) {
      console.error('创建新会话失败:', error);
      
      // 即使后端失败，也尝试创建新对话
      const fallbackMemoryId = Date.now();
      setMemoryId(fallbackMemoryId);
      localStorage.setItem(STORAGE_KEY, fallbackMemoryId.toString());
      
      console.warn('新对话已创建（后端同步失败）');
    } finally {
      setIsCreatingSession(false);
    }
  }, [isCreatingSession]);

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
              onClick={handleNewSession}
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
                {/* 历史会话列表 */}
                {sessionHistory.length > 0 ? (
                  sessionHistory.map((session) => (
                    <div
                      key={session.memoryId}
                      onClick={() => switchToSession(session.memoryId)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-primary)',
                        backgroundColor: session.memoryId === memoryId ? 'var(--color-bg-light)' : 'transparent',
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
                          fontWeight: session.memoryId === memoryId ? 'bold' : 'normal',
                          color: session.memoryId === memoryId ? 'var(--primary-color)' : 'var(--text-primary)',
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
                          {new Date(session.createTime).toLocaleString('zh-CN', {
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