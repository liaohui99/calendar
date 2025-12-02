// src/pages/AIChatPage.tsx
import React from 'react';
import { Layout } from '@douyinfe/semi-ui';
import ChatInterface from '../components/ai-chat/ChatInterface';

const { Header, Content, Footer } = Layout;

/**
 * AI聊天页面组件
 * 作为AI对话功能的主页面，集成聊天界面组件
 */
const AIChatPage: React.FC = () => {
  return (
    <Layout className="chat-page">
      <Header>
        <h1 style={{ color: 'white', margin: 0 }}>日历AI助手</h1>
      </Header>
      
      <Content style={{ padding: 24, minHeight: 280 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ChatInterface />
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        日历AI助手 ©2023 - 提供智能日历相关咨询服务
      </Footer>
    </Layout>
  );
};

export default AIChatPage;