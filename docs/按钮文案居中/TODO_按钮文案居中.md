# 按钮文案居中 - 后续优化建议

## 1. 样式统一管理

### 建议
创建一个专门的按钮样式组件或CSS类，统一管理所有按钮的样式，包括居中显示属性。

### 实施方案
- 在 `src/styles` 目录下创建 `ButtonStyles.ts` 文件
- 定义统一的按钮样式常量
- 在组件中导入并使用这些样式常量

```typescript
// src/styles/ButtonStyles.ts
export const buttonStyles = {
  centerText: {
    textAlign: 'center',
    borderRadius: '8px'
  },
  smallButton: {
    textAlign: 'center',
    borderRadius: '8px',
    margin: '4px 0'
  }
};

// 在组件中使用
import { buttonStyles } from '../styles/ButtonStyles';
// ...
<Button size="small" style={buttonStyles.smallButton}>刷新</Button>
```

## 2. 使用主题配置

### 建议
利用semi.design的主题配置功能，在全局范围内设置按钮文字居中。

### 实施方案
- 在 `src/App.tsx` 或 `src/index.tsx` 中配置主题
- 重写Button组件的默认样式

```typescript
import { ConfigProvider } from '@douyinfe/semi-ui';
import './index.css';

const theme = {
  Button: {
    textAlign: 'center'
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
```

## 3. 可访问性优化

### 建议
确保按钮不仅视觉上居中，还符合可访问性标准。

### 实施方案
- 添加适当的 `aria-label` 属性
- 确保按钮有足够的点击区域
- 为按钮添加键盘焦点样式

```typescript
<Button
  size="small"
  icon="reload"
  onClick={handleRefresh}
  style={{ borderRadius: '8px', margin: '4px 0', textAlign: 'center' }}
  aria-label="刷新数据"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleRefresh();
    }
  }}
>
  刷新
</Button>
```

## 4. 性能优化

### 建议
避免在组件中重复定义样式对象，使用React.memo或useMemo优化渲染性能。

### 实施方案
- 使用 `useMemo` 缓存样式对象
- 确保样式对象引用的稳定性

```typescript
import { useMemo } from 'react';

const ReservationCalendar: React.FC = () => {
  const buttonStyle = useMemo(() => ({
    borderRadius: '8px',
    margin: '4px 0',
    textAlign: 'center'
  }), []);
  
  // 使用buttonStyle代替内联样式
  return (
    // ...
    <Button size="small" style={buttonStyle}>刷新</Button>
    // ...
  );
};
```

## 5. 测试覆盖

### 建议
添加单元测试和端到端测试，确保按钮样式在不同场景下正确应用。

### 实施方案
- 使用Jest和React Testing Library编写单元测试
- 使用Cypress进行端到端测试
- 测试不同屏幕尺寸下的按钮显示效果

```typescript
// src/components/__tests__/ReservationCalendar.test.tsx
import { render, screen } from '@testing-library/react';
import ReservationCalendar from '../ReservationCalendar';

describe('ReservationCalendar', () => {
  test('按钮文案应该居中显示', () => {
    render(<ReservationCalendar />);
    const refreshButton = screen.getByText('刷新');
    expect(refreshButton).toHaveStyle('textAlign: center');
  });
});
```