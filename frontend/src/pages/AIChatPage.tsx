// src/pages/AIChatPage.tsx
import React, { useState } from 'react';
import { Layout, Button } from '@douyinfe/semi-ui';
import ChatInterface from '../components/ai-chat/ChatInterface';

const { Header, Content, Footer } = Layout;

/**
 * AI聊天页面组件
 * 作为AI对话功能的主页面，集成聊天界面组件
 */
const AIChatPage: React.FC = () => {
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
    <Layout className="chat-page">
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'white', margin: 0 }}>日历AI助手</h1>
          <Button 
            type="primary" 
            theme="solid" 
            onClick={handleNewSession}
            size="small"
          >
            新会话
          </Button>
        </div>
      </Header>
      
      <Content style={{ padding: 24, minHeight: 280 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ChatInterface memoryId={memoryId} />
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        日历AI助手 ©2023 - 提供智能日历相关咨询服务
      </Footer>
    </Layout>
  );
};

export default AIChatPage;