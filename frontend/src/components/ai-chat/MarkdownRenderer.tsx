// src/components/ai-chat/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography } from '@douyinfe/semi-ui';

const { Paragraph } = Typography;

interface MarkdownRendererProps {
  content: string;
}

/**
 * Markdown渲染器组件
 * 负责将Markdown格式文本转换为HTML并渲染
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // 默认mock数据，用于组件预览和测试
  const defaultContent = `# 你好，我是日历AI助手

我可以帮你管理日程安排、创建和查询预约。

## 我能做什么

- 查询日历上的预约信息
- 创建新的设备预约
- 修改或取消现有的预约
- 提供日历视图和时间建议

## 使用示例

你可以这样和我交流：
- "查询明天的所有预约"
- "帮我在后天下午2点预约会议室A"
- "取消我今天下午3点的预约"`;

  // 如果没有提供内容，使用默认mock数据
  const displayContent = content || defaultContent;

  return (
    <div className="markdown-renderer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => (
            <Paragraph style={{ marginBottom: 12, marginBlockStart: 0, marginBlockEnd: 0 }} {...props} />
          ),
          h1: ({ node, ...props }) => (
            <Typography.Title heading={1} style={{ marginBottom: 16, marginTop: 8 }} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <Typography.Title heading={2} style={{ marginBottom: 12, marginTop: 8 }} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <Typography.Title heading={3} style={{ marginBottom: 10, marginTop: 8 }} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul style={{ marginBottom: 12, marginTop: 0, paddingLeft: 20 }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol style={{ marginBottom: 12, marginTop: 0, paddingLeft: 20 }} {...props} />
          ),
          li: ({ node, ...props }) => (
            <li style={{ marginBottom: 4 }} {...props} />
          ),
          code: ({ node, ...props }) => (
            <code style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '2px 4px', 
              borderRadius: '3px',
              fontFamily: 'monospace'
            }} {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '6px',
              overflow: 'auto',
              fontFamily: 'monospace',
              marginBottom: 12,
              marginTop: 0
            }} {...props} />
          ),
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;