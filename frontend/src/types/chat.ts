// src/types/chat.ts

/**
 * 消息类型定义
 */
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

/**
 * 聊天请求参数定义
 */
export interface ChatRequest {
  message: string;
}

/**
 * 聊天响应数据定义
 */
export interface ChatResponse {
  success: boolean;
  data: {
    content: string;
  };
  error: string | null;
}
