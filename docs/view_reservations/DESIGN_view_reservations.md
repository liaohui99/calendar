# 查看所有预约数据功能 - 架构设计文档

## 1. 架构概览

### 1.1 整体架构图
```mermaid
flowchart TD
    A[用户] --> B[DeviceReservationPage]    
    B --> C[查看所有预约按钮]
    C --> D[ReservationListPage]
    D --> E[API调用层 reservationApi]
    E --> F[后端API /reservations]
    D --> G[数据展示组件 Table]
    D --> H[分页组件 Pagination]
    D --> I[状态展示组件]
```

## 2. 模块划分与依赖关系

### 2.1 模块划分

| 模块名称 | 职责描述 | 文件路径 | 依赖模块 |
|---------|---------|---------|--------|
| DeviceReservationPage | 设备预约主页面，包含跳转按钮 | src/pages/DeviceReservationPage.tsx | React, Semi UI, Router |
| ReservationListPage | 预约列表展示页面 | src/pages/ReservationListPage.tsx | React, Semi UI, reservationApi |
| reservationApi | 预约数据API调用服务 | src/services/api.ts | axios |
| App | 应用入口，包含路由配置 | src/App.tsx | React Router, 各页面组件 |

### 2.2 依赖关系图
```mermaid
graph LR
    A[App] --> B[DeviceReservationPage]
    A --> C[ReservationListPage]
    C --> D[reservationApi]
    B --> E[Router]
    C --> E
```

## 3. 接口定义与数据流

### 3.1 组件接口定义

#### DeviceReservationPage 组件接口
```typescript
interface DeviceReservationPageProps {
  // 现有属性保持不变
}

// 添加跳转按钮相关状态和方法
interface DeviceReservationPageState {
  // 现有状态保持不变
}

// 按钮点击处理方法
const handleViewAllReservations = () => {
  navigate('/reservations');
};
```

#### ReservationListPage 组件接口
```typescript
interface ReservationListPageProps {
  // 无特殊属性
}

interface ReservationListPageState {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  total: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
}
```

### 3.2 API接口定义

使用现有的reservationApi.getReservations方法，接口定义如下：

```typescript
// 获取预约数据列表
export const reservationApi = {
  // 现有实现保持不变
  getReservations: async (params: {
    deviceId?: string;
    date?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    return apiClient.get<ApiResponse<{ list: Reservation[]; total: number }>>('/reservations', { params });
  },
  // 其他方法保持不变
};
```

### 3.3 数据流

```mermaid
sequenceDiagram
    participant User as 用户
    participant DRP as DeviceReservationPage
    participant RLP as ReservationListPage
    participant API as reservationApi
    participant Backend as 后端API

    User->>DRP: 访问设备预约页面
    DRP->>User: 渲染页面，显示"查看所有预约"按钮
    User->>DRP: 点击"查看所有预约"按钮
    DRP->>RLP: 跳转到/reservations路由
    RLP->>API: 调用getReservations()获取数据
    API->>Backend: 发送GET请求到/reservations
    Backend-->>API: 返回预约数据列表
    API-->>RLP: 返回处理后的响应
    RLP->>User: 渲染预约数据表格
    User->>RLP: 切换分页或排序
    RLP->>API: 重新调用getReservations()
    API->>Backend: 发送带分页/排序参数的请求
    Backend-->>API: 返回新的数据列表
    API-->>RLP: 返回处理后的响应
    RLP->>User: 更新表格显示
```

## 4. 错误处理机制

### 4.1 错误类型定义

| 错误类型 | 错误信息 | 处理方式 |
|---------|---------|--------|
| 网络错误 | 网络连接失败 | 显示错误提示，提供重试按钮 |
| API错误 | API返回错误状态码 | 显示具体错误信息 |
| 数据解析错误 | 数据格式不正确 | 显示通用错误信息 |
| 权限错误 | 无权限访问数据 | 显示权限不足提示 |

### 4.2 错误处理流程

```mermaid
flowchart TD
    A[API调用开始] --> B{调用成功?}
    B -->|是| C[检查响应状态]
    B -->|否| D[处理网络错误]
    C -->|成功| E[解析数据]
    C -->|失败| F[处理API错误]
    E -->|成功| G[更新状态]
    E -->|失败| H[处理解析错误]
    D --> I[显示错误提示]
    F --> I
    H --> I
    I --> J[提供重试选项]
```

### 4.3 代码实现示例

```typescript
const fetchReservations = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await reservationApi.getReservations({
      page: currentPage,
      pageSize: pageSize,
      sortField,
      sortOrder
    });
    setReservations(response.data.list);
    setTotal(response.data.total);
  } catch (error) {
    if (error instanceof Error) {
      setError(error.message || '获取预约数据失败，请稍后重试');
    } else {
      setError('未知错误，请联系管理员');
    }
  } finally {
    setLoading(false);
  }
};
```

## 5. 性能优化考虑

### 5.1 数据加载优化
- 实现分页加载，避免一次性加载大量数据
- 添加数据缓存机制，减少重复请求
- 实现虚拟滚动，优化大数据量渲染性能

### 5.2 组件渲染优化
- 使用React.memo避免不必要的重渲染
- 优化Table组件的渲染性能
- 延迟加载非关键资源

## 6. 安全考虑

### 6.1 数据安全
- 确保所有API调用使用HTTPS
- 避免在前端存储敏感信息
- 实现请求超时和重试机制

### 6.2 防止滥用
- 限制单次请求的数据量
- 实现合理的API请求频率限制
- 防止SQL注入和XSS攻击