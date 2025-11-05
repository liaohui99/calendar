# 日历表格预约信息提示 - 需求共识文档

## 确认的功能需求

基于原始需求和代码分析，我们确认以下功能需求：

1. **功能目标**：鼠标悬停在已预约的表格单元格上时，显示完整的预约信息
2. **显示内容**：
   - 预约人姓名（userName）
   - 预约人联系方式（userContact）
   - 预约时间段（startTime - endTime）
   - 预约事由（reason）
   - 预约状态（status，如待确认、已确认、已取消）
3. **交互要求**：仅通过鼠标悬停触发，无需点击交互
4. **样式要求**：确保提示信息格式清晰，支持文字换行显示

## 技术约束

1. 基于现有React组件架构实现
2. 使用semi.design的Tooltip组件
3. 解决React警告（findDOMNode is deprecated）
4. 不修改现有数据模型和API

## 验收标准

1. **功能验证**：
   - 鼠标悬停已预约单元格时，正确显示所有指定的预约信息
   - 提示信息格式清晰，易于阅读
   - 无React警告出现

2. **兼容性验证**：
   - 在主流浏览器（Chrome、Firefox、Safari、Edge）中正常工作
   - 在不同尺寸的屏幕上显示正常

## 技术方案

1. 修改`CalendarView.tsx`中的`renderTimeSlot`函数
2. 优化Tooltip实现，添加React.useRef来避免findDOMNode警告
3. 创建辅助函数将预约状态数字转换为中文文本
4. 构建格式化的提示信息内容