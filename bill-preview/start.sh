#!/bin/bash

# 账单管理系统 - 启动脚本
# 使用方法：./start.sh

echo "=========================================="
echo "  账单管理系统 - 启动脚本"
echo "=========================================="
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"
echo "✅ npm 版本：$(npm -v)"
echo ""

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
    echo ""
fi

# 清理之前的进程
echo "🔍 检查并清理占用的进程..."
pkill -f "vite" 2>/dev/null
sleep 1

# 启动开发服务器
echo "🚀 正在启动开发服务器..."
echo ""

# 后台运行 Vite
npm run dev &
VITE_PID=$!

# 等待服务器启动
sleep 5

# 检查进程是否还在运行
if ps -p $VITE_PID > /dev/null; then
    echo ""
    echo "=========================================="
    echo "  ✅ 服务器启动成功！"
    echo "=========================================="
    echo ""
    echo "  预览地址：https://5173-027cc34995f131dc.monkeycode-ai.online"
    echo "  本地地址：http://localhost:5173/"
    echo ""
    echo "  进程 ID: $VITE_PID"
    echo ""
    echo "  按 Ctrl+C 停止服务器"
    echo "=========================================="
    echo ""
    
    # 保持脚本运行
    wait $VITE_PID
else
    echo "❌ 服务器启动失败，请检查日志"
    exit 1
fi
