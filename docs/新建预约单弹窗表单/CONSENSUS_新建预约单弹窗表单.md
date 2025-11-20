# 新建预约单弹窗表单 - 需求共识文档

## 确认后的需求

基于原始需求和项目现状分析，我们对新建预约单弹窗表单功能达成以下共识：

1. **功能需求**：
   - 点击"新建预约单"按钮时，打开一个模态窗口
   - 在模态窗口中显示完整的预约表单
   - 表单需包含设备选择、时间段选择、预约人信息和预约事由等字段
   - 实现表单验证逻辑，确保必填字段已填写
   - 提交预约信息到后端API
   - 提供成功/失败的反馈信息

2. **技术要求**：
   - 前端使用React + TypeScript
   - UI组件使用Semi Design组件库
   - 弹窗使用Semi的Modal组件
   - 表单实现使用Semi的Form组件
   - 时间选择器使用Semi的DatePicker和TimePicker组件
   - 设备选择使用Semi的Select组件
   - 与后端通信使用现有的API服务层

## 验收标准

1. **功能验收**：
   - 点击"新建预约单"按钮能成功打开模态窗口
   - 表单包含所有必要的输入字段
   - 表单验证正常工作，提示必填信息
   - 能成功提交预约数据到后端
   - 预约成功后显示提示信息并关闭窗口
   - 预约失败时显示友好的错误提示

2. **技术验收**：
   - 代码符合TypeScript规范，无编译错误
   - 组件结构合理，遵循React最佳实践
   - 所有组件都有对应的测试用例
   - 测试用例全部通过
   - API调用错误处理完善

3. **UI验收**：
   - 弹窗布局清晰，符合Semi Design设计规范
   - 表单字段排版合理，易于填写
   - 按钮和交互元素明确可辨
   - 响应式设计，适配不同屏幕尺寸

## 技术方案

### 前端实现方案

1. **组件设计**：
   - 修改现有`FilterComponent.tsx`，为"新建预约单"按钮添加点击事件
   - 创建新的通用预约表单组件`GeneralReservationForm.tsx`，用于手动输入所有预约信息
   - 在`DeviceReservationPage.tsx`中管理模态窗口的显示状态

2. **数据流设计**：
   - `FilterComponent`中的按钮点击事件通知`DeviceReservationPage`
   - `DeviceReservationPage`管理模态窗口的显示/隐藏状态
   - 新的预约表单组件从API获取设备列表供用户选择
   - 表单提交时调用`reservationApi.createReservation`接口

3. **文件结构**：
   ```
   src/
   ├── components/
   │   ├── FilterComponent.tsx         // 修改现有组件，添加按钮点击事件
   │   ├── GeneralReservationForm.tsx  // 新增通用预约表单组件
   │   └── ReservationFormModal.tsx    // 复用现有模态窗口组件
   ├── pages/
   │   └── DeviceReservationPage.tsx   // 修改，添加模态窗口控制
   ├── services/
   │   └── api.ts                      // 使用现有API服务
   └── tests/
       └── components/
           └── GeneralReservationForm.test.tsx  // 新增测试文件
   ```