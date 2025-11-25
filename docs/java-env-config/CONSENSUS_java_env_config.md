# Java环境设置共识文档

## 已确认需求
设置当前项目java环境为E:\\JDK\\jdk-17.0.7

## 技术方案
1. 修改VSCode的settings.json文件，更新java.home和相关Java配置
2. 更新pom.xml文件，将Java版本从1.8更新到17
3. 更新launch.json文件中的JDK路径配置
4. 运行Maven命令验证配置是否生效

## 验收标准
1. VSCode能正确识别JDK 17环境
2. Maven项目能使用Java 17成功编译
3. 项目运行时使用的是JDK 17
