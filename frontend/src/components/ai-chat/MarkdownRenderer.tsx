// src/components/ai-chat/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Markdown渲染组件
 * 用于安全地渲染Markdown内容，支持CommonMark语法和GFM扩展
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-renderer">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // 自定义样式以匹配Semi Design设计系统
          p: ({ node, ...props }) => <p {...props} style={{ margin: '0.5em 0' }} />,
          strong: ({ node, children, ...props }) => <span {...props} style={{...props.style, fontWeight: 'bold'}}>{children}</span>,
          em: ({ node, children, ...props }) => <span {...props} style={{...props.style, fontStyle: 'italic'}}>{children}</span>,
          // 为链接添加样式
          a: ({ node, ...props }) => (
            <a
              {...props}
              style={{
                color: '#1890ff',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            />
          ),
          // 为列表添加样式
          ul: ({ node, ...props }) => (
            <ul {...props} style={{ paddingLeft: '1.5em', margin: '0.5em 0' }} />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} style={{ paddingLeft: '1.5em', margin: '0.5em 0' }} />
          ),
          li: ({ node, ...props }) => (
            <li {...props} style={{ marginBottom: '0.3em' }} />
          ),
          // 为代码块添加样式
          code: ({ node, ...props }) => {
            const className = props.className || '';
            const match = /language-(\w+)/.exec(className);
            const isInline = !className || !match;
            return !isInline ? (
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  overflowX: 'auto',
                  fontSize: '0.9em',
                  margin: '0.8em 0'
                }}
              >
                <code {...props} />
              </pre>
            ) : (
              <code
                {...props}
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '0.2em 0.4em',
                  borderRadius: '3px',
                  fontSize: '0.9em'
                }}
              />
            );
          },
          // 为标题添加样式
          h1: ({ node, ...props }) => (
            <h1 {...props} style={{ fontSize: '1.5em', margin: '0.8em 0' }} />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} style={{ fontSize: '1.3em', margin: '0.7em 0' }} />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} style={{ fontSize: '1.1em', margin: '0.6em 0' }} />
          ),
          // 为引用添加样式
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              style={{
                borderLeft: '4px solid #d9d9d9',
                paddingLeft: '16px',
                color: '#666',
                margin: '0.8em 0'
              }}
            />
          ),
          // 为表格添加样式
          table: ({ node, ...props }) => (
            <table
              {...props}
              style={{
                borderCollapse: 'collapse',
                width: '100%',
                margin: '0.8em 0'
              }}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              style={{
                border: '1px solid #e8e8e8',
                padding: '8px',
                backgroundColor: '#fafafa',
                textAlign: 'left'
              }}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              {...props}
              style={{
                border: '1px solid #e8e8e8',
                padding: '8px'
              }}
            />
          )
        }}
      />
    </div>
  );
};

export default MarkdownRenderer;