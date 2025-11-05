# 飞书导航功能页设置 - 需求共识

## 确认后的需求
根据飞书项目的导航功能页/ Page开发要求，将前端的预约日历主页面设置成导航功能页能访问的地址。具体包括：

1. 创建飞书导航功能页的配置文件 `plugin.config.json`，配置ID为 `reservation_calendar_page`，入口为 `./src/features/page_web_reservation/App.tsx`
2. 创建导航页面入口组件 `App.tsx`，集成现有的 `DeviceReservationPage` 组件
3. 配置 `vite.config.ts` 支持多入口构建，生成独立的导航功能页构建产物
4. 添加TypeScript类型定义文件，确保正确识别飞书JSSDK对象
5. 验证构建是否成功，确保所有配置正确无误

## 验收标准

1. **配置文件正确性**：`plugin.config.json` 文件格式正确，包含必要的入口配置
2. **入口组件完整性**：导航页面入口组件能正确导入和使用 `DeviceReservationPage`
3. **构建配置有效性**：修改后的 `vite.config.ts` 能成功构建出导航功能页的独立产物
4. **类型定义准确性**：TypeScript能正确识别 `window.JSSDK` 对象及其方法
5. **构建成功验证**：执行 `npm run build` 命令无错误，生成 `reservationCalendarPage.js` 等文件

## 技术方案

1. **创建配置文件**：
   - 文件位置：`frontend/plugin.config.json`
   - 配置内容：包含 `main`、`pages` 和 `features` 字段
   - `pages` 数组中配置预约日历页面，ID为 `reservation_calendar_page`

2. **创建入口组件**：
   - 文件位置：`frontend/src/features/page_web_reservation/App.tsx`
   - 组件功能：导入并使用 `DeviceReservationPage`，处理飞书JSSDK初始化

3. **配置构建系统**：
   - 修改 `vite.config.ts`，添加 `build.rollupOptions` 配置
   - 设置多入口：`main` 和 `reservationCalendarPage`
   - 配置输出文件名规则

4. **添加类型定义**：
   - 文件位置：`frontend/src/types/feishu.d.ts`
   - 内容：扩展 `Window` 接口，定义 `JSSDK` 相关类型

5. **验证构建**：
   - 执行 `npm run build` 命令
   - 检查输出目录是否包含 `reservationCalendarPage.js` 文件
   - 确认TypeScript编译无错误

## 注意事项

1. 严格遵循飞书导航功能页的配置规范
2. 确保导入路径正确，避免构建错误
3. TypeScript类型定义需要覆盖使用到的JSSDK功能
4. 构建配置需要兼容现有的构建流程