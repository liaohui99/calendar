// src/components/ai-chat/MarkdownRenderer.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarkdownRenderer from './MarkdownRenderer';

// Mock react-markdown 以避免实际的Markdown渲染
jest.mock('react-markdown', () => {
  return ({ children, components }: any) => {
    const content = typeof children === 'string' ? children : JSON.stringify(children);
    return <div data-testid="markdown-content">{content}</div>;
  };
});

jest.mock('remark-gfm', () => jest.fn());

describe('MarkdownRenderer 组件测试', () => {
  test('渲染带内容的Markdown', () => {
    const testContent = '# 测试标题\n\n这是测试内容';
    render(<MarkdownRenderer content={testContent} />);
    
    const markdownElement = screen.getByTestId('markdown-content');
    expect(markdownElement).toBeInTheDocument();
    expect(markdownElement.textContent).toContain('测试标题');
    expect(markdownElement.textContent).toContain('测试内容');
  });

  test('渲染空内容时使用默认内容', () => {
    render(<MarkdownRenderer content="" />);
    
    const markdownElement = screen.getByTestId('markdown-content');
    expect(markdownElement).toBeInTheDocument();
    // 默认内容应该包含欢迎信息
    expect(markdownElement.textContent).toContain('你好，我是日历AI助手');
  });

  test('渲染undefined内容时使用默认内容', () => {
    render(<MarkdownRenderer content={undefined as any} />);
    
    const markdownElement = screen.getByTestId('markdown-content');
    expect(markdownElement).toBeInTheDocument();
    expect(markdownElement.textContent).toContain('你好，我是日历AI助手');
  });

  test('渲染特殊Markdown语法', () => {
    const specialContent = '## 列表测试\n\n- 项目1\n- 项目2\n\n```javascript\nconst test = 123;\n```';
    render(<MarkdownRenderer content={specialContent} />);
    
    const markdownElement = screen.getByTestId('markdown-content');
    expect(markdownElement).toBeInTheDocument();
    expect(markdownElement.textContent).toContain('列表测试');
    expect(markdownElement.textContent).toContain('项目1');
    expect(markdownElement.textContent).toContain('项目2');
    expect(markdownElement.textContent).toContain('const test = 123;');
  });
});