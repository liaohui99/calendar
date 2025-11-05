# 按钮图标修改需求共识文档

## 确认后的需求
将前端应用中的两个日期导航按钮的图标分别修改为Semi Design图标库中的IconChevronLeft和IconChevronRight组件。

## 验收标准
1. 成功导入IconChevronLeft和IconChevronRight组件
2. 第一个按钮（上一天）使用IconChevronLeft图标
3. 第二个按钮（下一天）使用IconChevronRight图标
4. 按钮中不再包含文本符号（< 和 >）
5. 前端应用构建成功，无编译错误
6. 应用运行时图标正确显示

## 技术方案
1. 在ReservationCalendar.tsx文件顶部导入所需图标组件
2. 将第一个按钮的icon属性从"double-left"改为`<IconChevronLeft />`
3. 将第二个按钮的icon属性从"double-right"改为`<IconChevronRight />`
4. 移除按钮内的文本内容
5. 运行构建命令验证代码正确性