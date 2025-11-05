# 需求对齐：div按钮失焦报错

## 原始需求
用户报告："div 按钮失焦报错 2 条日志"

## 问题分析
从日志信息可以看出，系统中存在与findDOMNode相关的错误警告：

1. 警告信息1：`Warning: findDOMNode is deprecated and will be removed in the next major release. Instead, add a ref directly to the element you want to reference.`
2. 警告信息2：`Warning: %s is deprecated in StrictMode. %s was passed an instance of %s which is inside StrictMode. Instead, add a ref directly to the element you want to reference.`

错误来源：
- `clickOutsideHandler`函数中调用了`findDOMNode`
- 涉及组件：Popover、Select等Semi UI组件
- 这些组件在React 19环境下出现兼容性问题，因为React 19移除了`findDOMNode`方法

## 任务范围

### 要做的事
1. 修复div按钮失焦时出现的findDOMNode相关错误
2. 确保Select组件等UI元素在点击外部时能正常关闭，且不再报错
3. 保持组件的原有功能和交互体验

### 不做的事
1. 不修改组件的基本功能和UI设计
2. 不重构整个组件结构
3. 不引入新的UI库或框架

## 疑问清单
1. 是否需要对项目的React版本进行调整以解决兼容性问题？
2. 是否需要对Semi UI组件进行特殊配置来解决这个问题？
3. 是否有其他组件也存在类似的findDOMNode兼容性问题？