// 扩展ImportMeta接口，添加env属性
declare interface ImportMeta {
  env: {
    DEV?: boolean;
    PROD?: boolean;
    BASE_URL?: string;
    MODE?: string;
    [key: string]: any;
  };
}

export {}; // 确保这是一个模块文件