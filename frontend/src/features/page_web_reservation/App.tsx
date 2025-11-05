import React, { type ReactElement } from 'react';
import DeviceReservationPage from '../../pages/DeviceReservationPage';

/**
 * 飞书导航功能页入口组件
 * 用于集成设备预约日历主页面到飞书导航功能
 */
function App(): ReactElement {
  // 初始化飞书JSSDK（如果需要）
  const initializeFeishuJSSDK = async () => {
    try {
      if (window.JSSDK) {
        // 获取页面上下文信息
        const context = await window.JSSDK.page.getContext();
        console.log('飞书页面上下文:', context);
        
        // 可以在这里添加其他JSSDK初始化逻辑
      }
    } catch (error) {
      console.error('飞书JSSDK初始化失败:', error);
    }
  };

  // 组件挂载时初始化JSSDK
  React.useEffect(() => {
    initializeFeishuJSSDK();
  }, []);

  // 渲染设备预约日历主页面
  return <DeviceReservationPage />;
}

export default App;