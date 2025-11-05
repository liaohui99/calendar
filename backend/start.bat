@echo off

chcp 65001

echo 开始构建和运行设备预约系统后端服务...

REM 检查Java环境
echo 检查Java环境...
java -version
if %errorlevel% neq 0 (
    echo 错误: 未找到Java环境，请确保JDK已正确安装并且已添加到环境变量中
    pause
    exit /b 1
)

REM 检查Maven环境
echo 检查Maven环境...
mvn -v
if %errorlevel% neq 0 (
    echo 错误: 未找到Maven环境，请确保Maven已正确安装并且已添加到环境变量中
    pause
    exit /b 1
)

echo 正在清理项目...
mvn clean
if %errorlevel% neq 0 (
    echo 错误: 项目清理失败
    pause
    exit /b 1
)

echo 正在编译项目...
mvn compile
if %errorlevel% neq 0 (
    echo 错误: 项目编译失败
    pause
    exit /b 1
)

echo 正在打包项目...
mvn package
if %errorlevel% neq 0 (
    echo 错误: 项目打包失败
    pause
    exit /b 1
)

echo 正在运行Spring Boot应用（默认使用local环境配置）...
java -jar target/calendar-chart-backend-1.0.0.jar

pause