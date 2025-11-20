// 扩展Window接口，添加JSSDK属性
declare global {
  interface Window {
    JSSDK?: {
      tab?: {
        getContext: () => Promise<any>
      },
      page?: {
        getContext: () => Promise<any>
      }
    }
  }
}

export {}; // 确保这是一个模块文件，而不是全局脚本