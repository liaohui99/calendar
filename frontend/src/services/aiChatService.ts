// src/services/aiChatService.ts

/**
 * 聊天请求参数定义
 */
export interface ChatRequest {
  message: string;
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
export const sendChatMessage = async (request: { message: string }): Promise<ChatResponse> => {
  try {
    console.log('正在处理聊天消息:', request);
    
    // 首先尝试调用后端API
    try {
      console.log('尝试调用后端AI聊天API');
      // 构造符合后端接口要求的请求参数
      const backendRequest: BackendChatRequest = {
        memoryId: 1, // 使用默认memoryId
        userMessage: request.message
      };
      
      const response = await fetch('/ai/calendar/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRequest),
        credentials: 'include',
      });
      
      if (response.ok) {
        // 注意：后端返回的是纯文本，不是JSON格式
        const content = await response.text();
        console.log('API调用成功，响应数据:', content);
        
        return {
          success: true,
          data: {
            content: content || '收到你的消息！'
          },
          error: null
        };
      } else {
        console.warn(`API响应失败: ${response.status}，将回退到模拟数据`);
        // API调用失败，继续执行模拟数据响应逻辑
      }
    } catch (apiError) {
      console.warn('API调用异常，将回退到模拟数据:', apiError);
      // API调用异常，继续执行模拟数据响应逻辑
    }
    
    // API调用失败或不可用，使用模拟数据响应
    console.log('使用模拟数据响应');
    await new Promise(resolve => setTimeout(resolve, 800)); // 模拟网络延迟
    
    // 尝试匹配预定义的回复
    const lowercaseMessage = request.message.toLowerCase();
    for (const [key, response] of Object.entries(mockResponses)) {
      if (lowercaseMessage.includes(key)) {
        console.log('匹配到预设回复，关键词:', key);
        return {
          success: true,
          data: {
            content: response
          },
          error: null
        };
      }
    }
    
    // 如果没有匹配到，返回默认回复
    const defaultResponse = getDefaultResponse();
    console.log('使用默认回复');
    return {
      success: true,
      data: {
        content: defaultResponse
      },
      error: null
    };
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
export const sendChatMessageToBackend = async (request: { message: string }): Promise<ChatResponse> => {
  try {
    console.log('调用AI聊天API:', request);
    // 构造符合后端接口要求的请求参数
    const backendRequest: BackendChatRequest = {
      memoryId: 1, // 使用默认memoryId
      userMessage: request.message
    };
    
    const response = await fetch('/ai/calendar/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequest),
      credentials: 'include',
    });
    
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
    console.error('API调用失败:', error);
    throw error;
  }
};