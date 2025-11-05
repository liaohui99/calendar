# 修复飞书插件资源加载失败 - 需求共识

## 确认的需求
飞书插件中打开设备预约页面'tab-web'时显示资源加载失败，需要修复配置文件中的不匹配问题。

## 确认的技术方案

### 问题根源
配置文件之间的命名不一致：
- `plugin.config.json` 中定义的资源ID为 `tab-web`
- `vite.config.ts` 中为该资源生成的输出文件名为 `tab-resource-web.js`

### 解决方案
1. 修改 `vite.config.ts` 中的输出文件名配置，将 `tabWorkItemPage` 的输出文件名从 `tab-resource-web.js` 改为 `tab-web.js`
2. 重新构建项目以生成正确命名的输出文件

## 验收标准
1. 构建成功，生成的文件名与配置文件中的资源ID一致
2. 飞书插件能够成功加载'tab-web'资源
3. 设备预约页面能够正常显示

## 实施步骤
1. 修改 `vite.config.ts` 文件中的输出文件名配置
2. 运行 `npm run build` 命令重新构建项目
3. 验证构建输出是否包含正确命名的 `tab-web.js` 文件
4. 在飞书插件中测试页面加载情况