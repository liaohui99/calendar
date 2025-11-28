# Java程序UTF-8编码配置指南

## 概述
本文档详细说明如何在Trae IDE中配置Java程序，使其在启动时自动使用UTF-8编码参数，解决中文等非ASCII字符显示问题。

## 配置方法

### 1. VSCode设置文件配置

#### 修改settings.json
在 `.vscode/settings.json` 文件中进行以下配置：

1. 在Java语言服务器VM参数中添加UTF-8编码设置：
   ```json
   "java.jdt.ls.vmargs": "-XX:+UseParallelGC -XX:GCTimeRatio=4 -XX:AdaptiveSizePolicyWeight=90 -Dsun.zip.disableMemoryMapping=false -Xmx2G -Xms200m -Dfile.encoding=UTF-8 -Dconsole.encoding=UTF-8"
   ```

2. 设置默认文件编码：
   ```json
   "files.encoding": "utf8"
   ```

3. 配置Java测试时的编码参数：
   ```json
   "java.test.config": [
       {
           "name": "Default",
           "vmArgs": ["-Dfile.encoding=UTF-8"]
       }
   ]
   ```

#### 修改launch.json
在 `.vscode/launch.json` 文件中，为每个Java运行配置添加UTF-8编码参数：

1. 为单个Java文件运行配置添加：
   ```json
   "vmArgs": "-Dfile.encoding=UTF-8"
   ```

2. 为Spring Boot应用配置添加：
   ```json
   "vmArgs": "-Djava.home=E:\\JDK\\jdk-17.0.7 -Dfile.encoding=UTF-8"
   ```

### 2. 运行时环境配置

#### 使用Maven运行时
如果通过Maven运行Java程序，可以在命令行中设置环境变量：

```powershell
$env:MAVEN_OPTS="-Dfile.encoding=UTF-8"
mvn exec:java -Dexec.mainClass="com.example.MainClass"
```

或者在pom.xml中配置exec-maven-plugin：

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>exec-maven-plugin</artifactId>
    <version>3.0.0</version>
    <configuration>
        <executable>java</executable>
        <commandlineArgs>-Dfile.encoding=UTF-8 -classpath %classpath ${exec.mainClass}</commandlineArgs>
    </configuration>
</plugin>
```

#### 直接运行Java程序
如果直接使用java命令运行程序，确保添加编码参数：

```powershell
java -Dfile.encoding=UTF-8 -cp target\classes com.example.MainClass
```

## 批处理文件示例

创建运行脚本时，建议包含编码参数：

```batch
@echo off
chcp 65001 > nul
set JAVA_HOME=E:\JDK\jdk-17.0.7
java -Dfile.encoding=UTF-8 -cp target\classes;target\dependency\* com.example.MainClass
```

## 验证配置

要验证编码配置是否生效，可以在Java程序中添加以下代码并运行：

```java
public static void main(String[] args) {
    System.out.println("系统默认编码: " + System.getProperty("file.encoding"));
    System.out.println("控制台编码: " + System.getProperty("console.encoding"));
    System.out.println("中文字符测试: 你好，世界！");
}
```

如果输出中显示UTF-8并且中文字符正确显示，则说明配置成功。

## 注意事项

1. 确保IDE和终端都设置为UTF-8编码
2. PowerShell中可以通过`chcp 65001`命令设置终端编码为UTF-8
3. 对于Maven项目，同时修改IDE配置和pom.xml可以确保不同运行方式下都使用正确的编码
4. 重启VSCode可以确保所有配置生效
