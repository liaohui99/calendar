// src/services/aiChatService.ts

/**
 * 聊天请求参数定义
 */
export interface ChatRequest {
  message: string;
  memoryId: number;
}

/**
 * 后端AI聊天请求参数定义
 */
export interface BackendChatRequest {
  memoryId: number;
  userMessage: string;
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

/**
 * 模拟聊天回复数据
 * 用于在没有后端服务时提供响应
 */
const mockResponses: {[key: string]: string} = {
  '你好': '你好！我是日历图表助手，有什么可以帮到你的吗？',
  '帮助': '我可以帮你了解设备预约系统的使用方法。你可以问我关于预约流程、设备查询等问题。',
  '预约': '要预约设备，你可以在首页选择设备类型，然后选择可用时间进行预约。',
  '查询': '你可以在"我的预约"页面查看所有已预约的设备信息。',
  '取消预约': '在"我的预约"页面，找到要取消的预约记录，点击取消按钮即可。'
};

/**
 * 获取默认回复
 * @returns 默认回复内容
 */
const getDefaultResponse = (): string => {
  return '感谢你的提问！我是日历图表助手。\n\n我目前支持的功能：\n- 查询设备预约信息\n- 了解预约流程\n- 帮助解决常见问题\n\n请尝试输入："你好"、"预约"、"帮助"等关键词。';
};

/**
 * 发送聊天消息到AI接口
 * 优先调用后端API，失败时回退到模拟数据
 * @param request 聊天请求参数
 * @returns 聊天响应数据
 */
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    console.log('开始处理聊天消息:', request);
    console.log('消息内容长度:', request.message.length);
    console.log('消息内容类型:', typeof request.message);
    
    // 尝试调用后端API
    try {
      console.log('尝试调用后端AI聊天API');
      // 构造符合后端接口要求的请求参数
      const backendRequest: BackendChatRequest = {
        memoryId: request.memoryId, // 使用传入的memoryId
        userMessage: request.message
      };
      
      console.log('发送请求参数:', JSON.stringify(backendRequest));
      
      // 设置fetch超时
      const controller = new AbortController();
      // 将超时时间设置为1分钟
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch('/ai/calendar/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRequest),
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // 清除超时计时器
      
      console.log('API响应状态:', response.status, response.statusText);
      
      if (response.ok) {
        // 注意：后端返回的是纯文本，不是JSON格式
        const content = await response.text();
        console.log('API调用成功，响应数据长度:', content.length);
        
        const responseData = {
          success: true,
          data: {
            content: content || '收到你的消息！'
          },
          error: null
        };
        console.log('API调用成功，准备返回响应数据');
        return responseData;
      } else {
        console.warn(`API响应失败: ${response.status}，将返回错误信息`);
        // API调用失败，直接返回错误信息
        return {
          success: false,
          data: {
            content: '',
          },
          error: `请求失败: 状态码 ${response.status}`
        };
      }
    } catch (apiError) {
      console.warn('API调用异常，将返回错误信息:', apiError);
      // API调用异常，直接返回错误信息
      return {
        success: false,
        data: {
          content: '',
        },
        error: apiError instanceof Error ? apiError.message : '网络请求异常'
      };
    }
  } catch (error) {
    console.error('聊天消息处理失败:', error);
    // 返回错误响应格式
    return {
      success: false,
      data: {
        content: '',
      },
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
};

// 备用函数：直接调用后端API（当后端服务可用时使用）
export const sendChatMessageToBackend = async (request: ChatRequest): Promise<ChatResponse> => {
  const controller = new AbortController();
  // 将超时时间设置为1分钟
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  
  try {
    console.log('调用AI聊天API:', request);
    // 构造符合后端接口要求的请求参数
    const backendRequest: BackendChatRequest = {
      memoryId: request.memoryId, // 使用传入的memoryId
      userMessage: request.message
    };
    
    const response = await fetch('/ai/calendar/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequest),
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API响应失败: ${response.status}`);
    }
    
    // 注意：后端返回的是纯文本，不是JSON格式
    const content = await response.text();
    console.log('API响应数据:', content);
    
    return {
      success: true,
      data: {
        content: content || '收到你的消息！'
      },
      error: null
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API调用失败:', error);
    throw error;
  }
};

/**
 * 发送聊天消息到AI接口（流式响应）
 * 调用后端的流式API接口
 * @param request 聊天请求参数
 * @param onPartialResponse 接收部分响应的回调函数
 * @returns Promise<ChatResponse> 聊天响应数据
 */
export const sendChatMessageStream = async (request: ChatRequest, onPartialResponse: (content: string) => void): Promise<ChatResponse> => {
  const controller = new AbortController();
  // 将超时时间设置为1分钟
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  
  try {
    console.log('调用AI聊天流式API:', request);
    // 构造符合后端接口要求的请求参数
    const backendRequest: BackendChatRequest = {
      memoryId: request.memoryId,
      userMessage: request.message
    };
    
    const response = await fetch('/ai/calendar/chat/flux', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequest),
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API响应失败: ${response.status}`);
    }
    
    if (!response.body) {
      throw new Error('API响应没有body');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    
    // 循环读取流数据
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      onPartialResponse(chunk);
    }
    
    await reader.releaseLock();
    
    return {
      success: true,
      data: {
        content: fullResponse || '收到你的消息！'
      },
      error: null
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('流式API调用失败:', error);
    throw error;
  }
};

/**
 * 清空指定对话的历史记录
 * 调用后端的清空对话历史接口
 * @param memoryId 对话内存ID
 * @returns Promise<boolean> 操作是否成功
 */
export const clearChatMemory = async (memoryId: number): Promise<boolean> => {
  try {
    console.log('清空对话历史记录:', memoryId);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(`/ai/calendar/chat/memory/${memoryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('清空对话历史成功');
      return true;
    } else {
      console.warn(`清空对话历史失败: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('清空对话历史异常:', error);
    return false;
  }
};

/**
 * 创建新的对话会话
 * 调用后端创建新会话接口
 * @returns Promise<number> 新创建的对话内存ID
 */
export const createNewSession = async (): Promise<number | null> => {
  try {
    console.log('创建新对话会话');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch('/ai/calendar/chat/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('创建新会话成功:', data.data);
      return data.data;
    } else {
      console.warn(`创建新会话失败: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('创建新会话异常:', error);
    return null;
  }
};