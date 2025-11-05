// 飞书JSSDK TypeScript类型定义

interface Window {
  JSSDK?: FeishuJSSDK;
}

interface TabContext {
  spaceId: string;
  workObjectId: string;
  workItemId: string;
  [key: string]: any;
}

interface FeishuJSSDK {
  // 页面相关API
  page: {
    getContext: () => Promise<{
      spaceId: string;
      projectId: string;
      userId: string;
      [key: string]: any;
    }>;
  };
  
  // 详情页Tab相关API
  tab: {
    /**
     * 获取详情页Tab上下文信息
     * @returns 包含spaceId、workObjectId、workItemId等信息的Promise
     */
    getContext: () => Promise<TabContext>;
  };
  
  // 空间相关API
  Space: {
    load: (spaceId: string) => Promise<{
      enabledWorkObjectList: Array<{
        id: string;
        name: string;
        [key: string]: any;
      }>;
      id: string;
      [key: string]: any;
    }>;
  };
  
  // 导航相关API
  navigation: {
    openWorkItemCreatePage: (params: {
      workobjectTypeId: string;
      projectId: string;
      [key: string]: any;
    }) => Promise<any>;
    
    openWorkItemDetailPage: (params: {
      workItemId: string;
      projectId: string;
      [key: string]: any;
    }) => Promise<any>;
  };
  
  // 提示相关API
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
  
  // 存储相关API
  storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };
}