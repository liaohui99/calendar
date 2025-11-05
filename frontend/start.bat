@echo off

echo 开始启动设备预约系统前端服务...

REM 检查Node.js环境
node -v
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js环境，请确保Node.js已正确安装并且已添加到环境变量中
    pause
    exit /b 1
)

REM 检查npm环境
npm -v
if %errorlevel% neq 0 (
    echo 错误: 未找到npm环境，请确保npm已正确安装
    pause
    exit /b 1
)

echo 正在安装依赖...
npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo 正在启动飞书开发服务器...
lpm start

pause