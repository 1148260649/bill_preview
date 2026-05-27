# 用户指令记忆

本文件记录了用户的指令、偏好和教导，用于在未来的交互中提供参考。

## 格式

### 用户指令条目
用户指令条目应遵循以下格式：

[用户指令摘要]
- Date: [YYYY-MM-DD]
- Context: [提及的场景或时间]
- Instructions:
  - [用户教导或指示的内容，逐行描述]

### 项目知识条目
Agent 在任务执行过程中发现的条目应遵循以下格式：

[项目知识摘要]
- Date: [YYYY-MM-DD]
- Context: Agent 在执行 [具体任务描述] 时发现
- Category: [运维部署 | 构建方法 | 测试方法 | 排错调试 | 工作流协作 | 环境配置]
- Instructions:
  - [具体的知识点，逐行描述]

## 去重策略
- 添加新条目前，检查是否存在相似或相同的指令
- 若发现重复，跳过新条目或与已有条目合并
- 合并时，更新上下文或日期信息
- 这有助于避免冗余条目，保持记忆文件整洁

## 条目

[框架使用要求]
- Date: 2026-05-21
- Context: 账单管理系统前端开发
- Instructions:
  - 项目使用 layui-vue 前端框架（官网：https://www.layui-vue.com/zh-CN/components/qrcode）
  - 整个项目的 UI 组件应使用 layui-vue 框架提供的组件
  - 不应使用其他 UI 框架的组件或自定义实现

[分页测试数据要求]
- Date: 2026-05-21
- Context: 账单管理系统前端开发
- Instructions:
  - 分页查询功能需要构造充足的测试数据
  - 每页显示 10 条数据，支持翻页功能
  - 每个分页列表至少需要 50 条左右的测试数据（5 页）
  - 使用 layui 的分页组件样式进行样式美化

[Layout 布局优化]
- Date: 2026-05-27
- Context: 账单管理系统 UI 优化
- Instructions:
  - 面包屑导航统一放在 Layout 顶部区域（侧边栏上方）
  - 删除各页面内的面包屑代码和副标题描述
  - 卡片采用圆形图标（64x64px，border-radius: 50%）
  - 卡片布局为两行：上方 label+value，下方 trend 带分割线
  - 所有卡片添加浅色边框（1px solid #e8e8e8）和 20px 间距
  - 使用 Layui Vue Grid 响应式属性（lg/md/sm/xs）替代 :span

[GitHub Pages 部署]
- Date: 2026-05-27
- Context: 配置 GitHub 自动部署
- Instructions:
  - 使用 GitHub Actions 自动部署到 GitHub Pages
  - vite.config.ts 配置 base: process.env.BASE_PATH || '/'
  - router/index.ts 使用 createWebHistory(import.meta.env.BASE_URL)
  - deploy.yml 中设置 BASE_PATH: /${{ github.event.repository.name }}/
  - 推送到 main 分支自动触发构建部署

[Gitea 凭证配置]
- Date: 2026-05-27
- Context: Git 推送认证配置
- Instructions:
  - Gitea 仓库地址：https://gitea.com/jzp/bill_preview.git
  - 用户名：jz_ssfy
  - 使用 Personal Access Token 进行认证
  - 凭证存储在 ~/.git-credentials 文件中
