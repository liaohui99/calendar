# 设备预约系统共识文档

## 确认需求

基于原始需求和技术要求，以下是确认后的系统需求：

### 1. 前端功能

- **日历图展示**：使用网格形式展示设备预约情况，横轴为时间（按小时划分），纵轴为设备列表
- **预约流程**：点击日历单元格触发预约流程，弹出表单供用户填写
- **筛选功能**：实现地点和设备类型的下拉筛选，筛选结果实时更新
- **响应式设计**：适配不同屏幕尺寸
- **UI组件**：使用Semi Design组件库

### 2. 后端功能

- **设备管理**：支持设备CRUD操作
- **预约管理**：支持预约创建、查询、取消
- **类型和地点管理**：支持设备类型和预约地点的CRUD
- **冲突检测**：确保同一设备在同一时间段内无重复预约
- **数据缓存**：使用Redis缓存热点数据

### 3. 数据存储

- **MySQL**：存储结构化数据，包括设备、预约、类型、地点信息
- **Redis**：缓存设备列表、预约记录等频繁访问的数据

## 验收标准

### 功能验收

1. **日历展示**：日历图能正确显示所有设备的预约状态，占用和空闲时段清晰可辨
2. **预约功能**：成功创建预约，重复预约时有适当提示
3. **筛选功能**：地点和类型筛选能正确过滤设备列表
4. **后台管理**：设备、类型、地点的增删改查功能正常工作
5. **数据一致性**：前后端数据保持一致，无数据丢失

### 性能验收

1. 日历图加载时间不超过2秒
2. 预约操作响应时间不超过1秒
3. 筛选操作实时响应（500ms内）

### 非功能验收

1. 代码结构清晰，遵循最佳实践
2. 接口设计符合RESTful规范
3. 包含必要的错误处理和日志记录
4. 提供基础的API文档

## 技术方案

### 前端技术栈

- **框架**：React 18
- **组件库**：Semi Design
- **构建工具**：Vite
- **路由**：React Router
- **状态管理**：React Context/useState
- **HTTP请求**：Axios

### 后端技术栈

- **语言**：Java 1.8
- **框架**：Spring Boot 2.7.x
- **ORM**：MyBatis-Plus
- **数据库**：MySQL 8.0
- **缓存**：Redis 6.x
- **API文档**：Swagger/OpenAPI

### 数据库设计

#### 设备表(device)
- id: 主键
- name: 设备名称
- type_id: 设备类型ID（外键）
- location_id: 所属地点ID（外键）
- status: 设备状态（可用、维护中、已报废）
- created_at: 创建时间
- updated_at: 更新时间

#### 设备类型表(device_type)
- id: 主键
- name: 类型名称
- description: 描述
- created_at: 创建时间
- updated_at: 更新时间

#### 预约地点表(location)
- id: 主键
- name: 地点名称
- description: 描述
- created_at: 创建时间
- updated_at: 更新时间

#### 预约记录表(reservation)
- id: 主键
- device_id: 设备ID（外键）
- user_name: 预约人姓名
- user_contact: 联系方式
- start_time: 开始时间
- end_time: 结束时间
- reason: 预约事由
- status: 预约状态（待确认、已确认、已取消）
- created_at: 创建时间
- updated_at: 更新时间

### 核心API设计

#### 前端路由

- `/`：日历图展示页面
- `/admin/devices`：设备管理页面
- `/admin/types`：设备类型管理页面
- `/admin/locations`：预约地点管理页面
- `/admin/reservations`：预约记录管理页面

#### 后端接口

##### 设备管理
- GET `/api/devices`：获取设备列表
- GET `/api/devices/{id}`：获取设备详情
- POST `/api/devices`：创建设备
- PUT `/api/devices/{id}`：更新设备
- DELETE `/api/devices/{id}`：删除设备

##### 预约管理
- GET `/api/reservations`：获取预约列表
- GET `/api/reservations/{id}`：获取预约详情
- POST `/api/reservations`：创建预约
- PUT `/api/reservations/{id}`：更新预约
- DELETE `/api/reservations/{id}`：取消预约

##### 类型管理
- GET `/api/types`：获取设备类型列表
- POST `/api/types`：创建设备类型
- PUT `/api/types/{id}`：更新设备类型
- DELETE `/api/types/{id}`：删除设备类型

##### 地点管理
- GET `/api/locations`：获取预约地点列表
- POST `/api/locations`：创建预约地点
- PUT `/api/locations/{id}`：更新预约地点
- DELETE `/api/locations/{id}`：删除预约地点

### 关键流程

#### 预约创建流程
1. 用户选择日期、时间和设备
2. 前端验证选择有效性
3. 调用预约创建接口
4. 后端检查时间冲突
5. 无冲突则创建预约并返回成功
6. 前端更新日历显示