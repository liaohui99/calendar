// src/pages/AIChatPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Button } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ai-chat/ChatInterface';

const STORAGE_KEY = 'calendar-chat-memory-id';

/**
 * 生成基于UUID和时间戳的整数memoryId
 * @returns 整数类型的memoryId
 */
const generateMemoryId = (): number => {
  const uuid = crypto.randomUUID();
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
  
  // 持久化memoryId到localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, memoryId.toString());
  }, [memoryId]);

  // 处理新会话按钮点击
  const handleNewSession = useCallback(() => {
    // 清除当前会话的消息
    const oldStorageKey = `calendar-chat-messages-${memoryId}`;
    localStorage.removeItem(oldStorageKey);
    
    // 生成新的memoryId
    const newMemoryId = generateMemoryId();
    setMemoryId(newMemoryId);
    localStorage.setItem(STORAGE_KEY, newMemoryId.toString());
  }, [memoryId]);

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
          <Button 
            type="primary" 
            onClick={handleNewSession}
            size="small"
          >
            新会话
          </Button>
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