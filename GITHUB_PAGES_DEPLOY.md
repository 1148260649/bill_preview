# GitHub Pages 部署指南

## 1. 创建 GitHub 仓库

在 GitHub 上创建一个新仓库（仓库名建议为 `bill_preview` 或你喜欢的名字）

## 2. 关联远程仓库

```bash
cd /workspace/bill_preview

# 查看当前远程仓库
git remote -v

# 如果需要更改为 GitHub 仓库
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 或者添加新的 remote
git remote add github https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

## 3. 提交并推送

```bash
git add .
git commit -m "feat: 添加 GitHub Actions 自动部署"
git push origin main
```

## 4. 启用 GitHub Pages

推送后，在 GitHub 仓库页面：

1. 进入 **Settings** → **Pages**
2. **Build and deployment** 部分：
   - **Source**: 选择 `GitHub Actions`
3. 回到 **Actions** 标签页，查看构建进度

## 5. 成功后

构建成功后，你会在 **Settings** → **Pages** 看到访问地址：
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

## 注意事项

### API 代理问题

GitHub Pages 只托管静态文件，**无法运行后端服务**。如果你的项目需要后端 API：

**方案一：修改 API 地址为完整 URL**
```typescript
// vite.config.ts - 生产环境配置
if (process.env.NODE_ENV === 'production') {
  base: '/YOUR_REPO/'
}
```

**方案二：将后端部署到其他平台**
- Vercel / Netlify（前端 + Serverless）
- Railway / Render（后端服务）
- 然后修改前端 API 地址

### 后续自动部署

每次推送到 `main` 分支时，GitHub Actions 会自动：
1. 安装依赖
2. 构建项目
3. 部署到 GitHub Pages

### 查看构建日志

在 GitHub 仓库 → **Actions** 标签页查看每次部署的详细日志。
