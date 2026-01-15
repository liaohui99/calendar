// src/pages/AIChatPage.tsx
import React, { useState } from 'react';
import { Layout, Button } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ai-chat/ChatInterface';

const { Header, Content, Footer } = Layout;

/**
 * AI聊天页面组件
 * 作为AI对话功能的主页面，集成聊天界面组件
 */
const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  
  /**
   * 生成基于UUID和时间戳的整数memoryId
   * @returns 整数类型的memoryId
   */
  const generateMemoryId = (): number => {
    // 生成UUID
    const uuid = crypto.randomUUID();
    // 获取当前时间戳（秒）
    const timestamp = Math.floor(Date.now() / 1000);
    
    // 将UUID转换为哈希值
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      const char = uuid.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // 取哈希值的绝对值，并与时间戳结合
    const absHash = Math.abs(hash);
    // 使用时间戳作为高位，哈希值作为低位，确保唯一性
    return timestamp * 1000000000 + absHash % 1000000000;
  };

  // 管理memoryId状态
  const [memoryId, setMemoryId] = useState<number>(() => generateMemoryId());

  // 处理新会话按钮点击
  const handleNewSession = () => {
    setMemoryId(generateMemoryId());
  };

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
        width: '100%'
      }}>
        <div style={{ margin: '0 auto' }}>
          <ChatInterface memoryId={memoryId} />
        </div>
      </main>
    </div>
  );
};

export default AIChatPage;