# 账单管理系统 (Bill Management System)

基于 Vue 3 + TypeScript + Vite 构建的现代化账单管理前端应用。

## 📖 项目简介

本系统提供全面的个人或家庭账单管理功能，包括收入支出统计、银行卡管理、工资管理、家庭成员管理、红包/投资管理等模块，帮助用户清晰地掌握财务状况。

## ✨ 核心功能

### 📊 数据概览
- 收入/支出/结余统计卡片
- 收支趋势图表分析
- 支出分类饼图展示
- 最近账单列表

### 💳 账单管理
- **总账单看板**：多维度账单统计与筛选
- **银行卡管理**：管理多张银行卡信息
- **工资管理**：工资收入记录与查询
- **家庭成员**：家庭成员信息与账单关联
- **红包/投资**：红包收发与投资记录管理
- **转账管理**：账户间转账记录查询

### ⚙️ 系统管理
- **用户管理**：系统用户账号管理
- **角色管理**：角色权限配置
- **菜单管理**：系统菜单配置
- **日志管理**：登录日志查询

### 👤 个人中心
- **个人资料**：用户信息维护
- **消息中心**：系统消息通知

## 🛠️ 技术栈

- **框架**: Vue 3.5 + TypeScript
- **构建工具**: Vite 8.0
- **UI 组件库**: Layui Vue 2.23.3
- **图标库**: Layui Icons + Font Awesome
- **状态管理**: Pinia 3.0
- **路由**: Vue Router 4.5
- **HTTP 客户端**: Axios
- **图表**: ECharts 6.1
- **工具库**: 
  - Dayjs (日期处理)
  - XLSX (Excel 导出)
  - Mammoth (Word 解析)
  - Viewer.js (图片预览)

## 📦 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173/

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
.
├── src/
│   ├── api/              # API 接口定义
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── composables/      # 组合式函数
│   ├── layouts/          # 布局组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── utils/            # 工具函数
│   ├── views/            # 页面视图
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── .github/
│   └── workflows/        # GitHub Actions 配置
├── .monkeycode/          # 项目文档与规范
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🚀 部署

### GitHub Pages 自动部署

项目已配置 GitHub Actions，推送到 `main` 分支后自动构建并部署到 GitHub Pages。

1. 在 GitHub 创建仓库
2. 推送代码到 GitHub
3. 在仓库 Settings → Pages 中启用 GitHub Actions
4. 构建完成后访问：`https://your-username.github.io/your-repo/`

**注意**: GitHub Pages 仅托管静态文件，如需要后端 API，请将后端部署到其他平台并修改 API 地址。

### 自定义部署

```bash
# 构建
npm run build

# 将 dist/ 目录部署到任意静态文件服务器
```

## 📄 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 编码规范
- UI 组件统一使用 Layui Vue
- 代码提交前请确保通过类型检查

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请提交 Issue。

---

**在线预览**: [GitHub Pages](https://nan2026.github.io/bill-preview/)

**后端 API**: 需单独部署，默认地址 `http://localhost:8089`
