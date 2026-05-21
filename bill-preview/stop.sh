#!/bin/bash

# 账单管理系统 - 停止脚本
# 使用方法：./stop.sh

echo "=========================================="
echo "  账单管理系统 - 停止脚本"
echo "=========================================="
echo ""

# 查找并停止 Vite 进程
echo "🔍 正在查找 Vite 进程..."
VITE_PIDS=$(pgrep -f "vite")

if [ -z "$VITE_PIDS" ]; then
    echo "ℹ️  没有运行中的 Vite 进程"
    exit 0
fi

echo "📋 找到以下进程："
echo "$VITE_PIDS"
echo ""

# 停止进程
echo "🛑 正在停止服务..."
pkill -f "vite"
sleep 2

# 检查是否已停止
if pgrep -f "vite" > /dev/null; then
    echo "⚠️  仍有进程在运行，强制停止..."
    pkill -9 -f "vite"
fi

echo ""
echo "=========================================="
echo "  ✅ 服务已停止"
echo "=========================================="
echo ""
