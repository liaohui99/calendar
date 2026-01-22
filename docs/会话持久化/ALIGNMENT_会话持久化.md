# 会话持久化功能 - 需求对齐文档

## 1. 原始需求

用户要求为 `button` 实现新建会话的会话持久化功能，具体要求如下：

1. 实现完整的会话数据保存机制，确保所有会话相关信息（包括但不限于会话ID、用户输入、模型响应、对话时间戳等）被完整、准确地存储到数据库中。
2. 实现会话恢复功能：当用户切换回之前的会话ID时，系统应能从数据库中正确加载该会话的完整历史记录。
3. 确保会话恢复后，用户能够基于历史会话继续与模型进行无缝对话，新的对话内容应自动追加到该会话记录中并持久化保存。
4. 实现必要的错误处理机制，确保在数据存储和加载过程中出现异常时能够进行适当处理并提供明确的错误提示。
5. 优化数据库操作性能，确保会话数据的存储和加载操作高效、可靠。
6. 参考目前内存持久化，使用langchain4j对会话消息持久化到数据库
7. 新建的相关表结构与初始化需要保留至init.sql中
8. 保持现有的页面布局和按钮点位及其他布局不变动，只实现新需求

## 2. 任务范围

### 2.1 包括的内容

- **后端改造**：
  - 将 `chatMemoryStore` Bean 从 `InMemoryChatMemoryStore` 切换为 `MysqlChatMemoryStore`
  - 确保 `MysqlChatMemoryStore` 正确实现 LangChain4j 的 `ChatMemoryStore` 接口
  - 优化数据库表结构（如需要）
  - 添加必要的错误处理和日志记录

- **前端改造**：
  - 修改 `AIChatPage.tsx`，从数据库加载会话历史而不是从 localStorage
  - 实现会话切换时的数据加载逻辑
  - 确保新建会话时正确初始化

- **数据库改造**：
  - 调整 `chat_messages` 表结构（如需要）
  - 更新 `init.sql` 中的表定义和初始化脚本

- **测试**：
  - 编写后端单元测试
  - 编写前端组件测试
  - 集成测试确保会话持久化功能正常工作

### 2.2 不包括的内容

- 不修改现有的页面布局和按钮点位
- 不修改现有的 UI 组件样式
- 不修改 AI 模型配置和提示词
- 不修改现有的业务逻辑（设备预约等）

## 3. 项目现状分析

### 3.1 技术栈

**后端**：
- Spring Boot 3.2.0
- Java 17
- MyBatis-Plus 3.5.5
- H2 数据库（内存数据库）
- LangChain4j 1.9.1

**前端**：
- React 18
- TypeScript
- Semi Design UI
- Axios

### 3.2 现有实现

**数据库表**：
- `chat_messages` 表已存在，包含字段：
  - `id` (主键)
  - `message_id` (会话ID)
  - `content` (会话消息JSON)

**后端实现**：
- `ChatMessages` 实体类
- `ChatMemoryStoreDao` DAO层
- `ChatMemoryStoreDao.xml` MyBatis映射文件
- `MysqlChatMemoryStore` 实现了 `ChatMemoryStore` 接口（但未被使用）
- `PersistentChatMemoryStore` 实现了 `ChatMemoryStore` 接口（内存存储，当前使用）
- `SpringLLMConfig` 配置类中 `chatMemoryStore()` Bean 返回 `InMemoryChatMemoryStore`

**前端实现**：
- `AIChatPage.tsx` 使用 localStorage 存储会话消息
- `ChatInterface.tsx` 使用 localStorage 持久化消息
- `aiChatService.ts` 提供聊天服务接口

### 3.3 问题识别

1. 后端配置使用 `InMemoryChatMemoryStore`，会话消息只存储在内存中，重启后丢失
2. 前端使用 localStorage 存储会话消息，与后端数据库不同步
3. `MysqlChatMemoryStore` 已实现但未被使用
4. 数据库表结构可能需要调整以支持更完整的信息（如时间戳）

## 4. 疑问清单

### 4.1 需要用户确认的问题

1. **会话ID生成策略**：
   - 当前前端使用基于UUID和时间戳的算法生成memoryId
   - 后端 `createNewSession` 接口使用 `System.currentTimeMillis()`
   - **问题**：是否需要统一会话ID生成策略？建议由后端统一生成

2. **会话列表展示**：
   - 当前前端从 localStorage 读取会话历史
   - **问题**：是否需要后端提供获取会话列表的API？还是继续使用前端从数据库读取的方式？

3. **时间戳存储**：
   - 当前 `chat_messages` 表没有时间戳字段
   - **问题**：是否需要添加 `create_time` 和 `update_time` 字段？

4. **错误处理**：
   - **问题**：当数据库操作失败时，是否需要降级到内存存储？还是直接返回错误？

5. **性能优化**：
   - **问题**：是否需要添加数据库索引以提高查询性能？

### 4.2 基于项目假设的回答

如果用户未明确回答，将采用以下假设：

1. **会话ID生成策略**：由后端统一生成，前端调用后端 `createNewSession` 接口获取新的会话ID
2. **会话列表展示**：添加后端 API 获取会话列表，前端调用该接口展示历史会话
3. **时间戳存储**：添加 `create_time` 和 `update_time` 字段到 `chat_messages` 表
4. **错误处理**：数据库操作失败时记录日志并返回错误，不降级到内存存储
5. **性能优化**：在 `message_id` 字段上添加索引

## 5. 技术方案概述

### 5.1 架构设计

```
前端 (React)
    ↓ HTTP请求
后端 (Spring Boot)
    ↓ LangChain4j
MysqlChatMemoryStore
    ↓ MyBatis-Plus
H2数据库
```

### 5.2 数据流

1. **新建会话**：
   - 前端调用 `POST /ai/calendar/chat/session`
   - 后端生成新的会话ID
   - 返回会话ID给前端

2. **发送消息**：
   - 前端调用 `POST /ai/calendar/chat/flux` (流式)
   - 后端使用 `MysqlChatMemoryStore` 存储消息
   - 消息自动持久化到数据库

3. **切换会话**：
   - 前端调用 `GET /ai/calendar/chat/sessions` 获取会话列表
   - 前端调用 `GET /ai/calendar/chat/messages/{memoryId}` 获取会话消息
   - 后端从数据库加载消息并返回

### 5.3 关键技术点

- 使用 LangChain4j 的 `ChatMemoryStore` 接口实现持久化
- 使用 MyBatis-Plus 简化数据库操作
- 使用 LangChain4j 的 `Json.toJson()` 和 `Json.fromJson()` 进行消息序列化/反序列化
- 前端使用 Semi Design 组件保持UI一致性

## 6. 验收标准

### 6.1 功能验收

1. ✅ 新建会话后，会话ID正确生成并返回
2. ✅ 发送消息后，消息正确保存到数据库
3. ✅ 切换到历史会话后，能正确加载完整的历史消息
4. ✅ 在历史会话中继续对话，新消息正确追加并保存
5. ✅ 数据库操作失败时，有明确的错误提示

### 6.2 性能验收

1. ✅ 消息保存响应时间 < 500ms
2. ✅ 消息加载响应时间 < 300ms
3. ✅ 会话列表加载响应时间 < 500ms

### 6.3 代码质量验收

1. ✅ 所有代码符合项目现有规范
2. ✅ 所有公共方法有函数级注释
3. ✅ 所有测试用例通过
4. ✅ 无 lint 错误和警告

## 7. 风险评估

### 7.1 技术风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| LangChain4j JSON序列化/反序列化问题 | 高 | 中 | 使用 LangChain4j 提供的 `Json` 工具类 |
| H2数据库兼容性问题 | 中 | 低 | 测试H2数据库的SQL语法兼容性 |
| 前后端数据同步问题 | 高 | 中 | 统一数据格式和错误处理 |

### 7.2 业务风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| 用户体验下降 | 中 | 低 | 保持现有UI布局不变 |
| 数据丢失 | 高 | 低 | 添加事务处理和错误日志 |

## 8. 下一步行动

等待用户确认以下内容：

1. 任务范围是否覆盖所有需求？
2. 技术方案是否可行？
3. 疑问清单中的假设是否合理？
4. 验收标准是否明确？

用户确认后，将进入 **Architect（架构设计）** 阶段。
