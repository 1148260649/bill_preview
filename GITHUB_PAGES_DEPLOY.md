# GitHub Pages 部署指南

## 📋 快速部署步骤

### 1️⃣ 创建 GitHub 仓库

访问 https://github.com/new 创建新仓库

- **Repository name**: `bill-preview`（或其他你喜欢的名字）
- **Visibility**: Public（公开的仓库才能免费使用 GitHub Pages）
- **不要** 初始化 README、.gitignore 或 License

### 2️⃣ 推送代码到 GitHub

```bash
cd /workspace

# 添加 GitHub remote（替换为你的 GitHub 用户名）
git remote add github https://github.com/YOUR_USERNAME/bill-preview.git

# 验证 remote 配置
git remote -v

# 推送到 GitHub
git push github main
```

### 3️⃣ 启用 GitHub Pages

1. 打开 GitHub 仓库页面
2. 进入 **Settings** → **Pages**
3. 在 **Build and deployment** 部分：
   - **Source**: 选择 `GitHub Actions`
4. 首次使用需勾选同意条款并保存

### 4️⃣ 查看构建进度

1. 切换到 **Actions** 标签页
2. 会自动触发一次构建（约 1-2 分钟）
3. 黄色圆点 ⏳ = 正在构建
4. 绿色对勾 ✅ = 构建成功

### 5️⃣ 访问网站

构建成功后，在 **Settings → Pages** 页面会显示：

> ✅ Your site is live at `https://YOUR_USERNAME.github.io/bill-preview/`

---

## 🔧 自动化部署

项目已配置 GitHub Actions，每次推送到 `main` 分支时会自动：

1. 安装依赖
2. 类型检查
3. 构建项目
4. 部署到 GitHub Pages

### 触发方式

```bash
# 任何推送到 main 分支的提交都会触发
git add .
git commit -m "feat: 新功能"
git push github main
```

### 查看构建日志

在 GitHub 仓库 → **Actions** → 点击对应的 workflow → 查看详细日志

---

## ⚠️ 注意事项

### API 代理问题

**GitHub Pages 只托管静态文件**，无法运行后端服务。

当前项目配置了 API 代理到 `http://localhost:8089`，在 GitHub Pages 上无法使用。

**解决方案：**

1. **将后端部署到其他平台**
   - Railway / Render（免费后端托管）
   - Vercel（支持 Serverless 函数）
   - 任何可公网访问的服务器

2. **修改 API 地址**
   
   编辑 `src/utils/requestUrlConfig.ts` 或相关配置文件：
   
   ```typescript
   // 生产环境 API 地址
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-backend-api.com' 
     : 'http://localhost:8089'
   ```

3. **使用环境变量**
   
   在 `.github/workflows/deploy.yml` 中添加：
   
   ```yaml
   - name: Build
     run: npm run build
     env:
       VITE_API_BASE_URL: https://your-backend-api.com
   ```

### 自定义域名

如需使用自定义域名：

1. 在 **Settings → Pages → Custom domain** 中设置
2. 配置 DNS 解析到 GitHub Pages
3. 详见 [GitHub Pages 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

## 🐛 常见问题

### Q: 页面显示 404

**原因**: `base` 路径配置错误

**解决**: 确保 `vite.config.ts` 中配置了：
```typescript
base: process.env.BASE_PATH || '/',
```

且 `.github/workflows/deploy.yml` 中传入了：
```yaml
env:
  BASE_PATH: /${{ github.event.repository.name }}/
```

### Q: 构建失败

**检查**:
1. 依赖是否完整安装
2. TypeScript 类型错误
3. 查看 Actions 日志定位具体错误

### Q: 页面空白或样式错乱

**原因**: 资源路径错误

**解决**: 清除浏览器缓存后刷新，或检查浏览器控制台错误

### Q: GitHub Actions 运行时长限制

免费账号每月有 **2000 分钟** 的 Actions 运行时长，对于本项目：
- 每次构建约 2-3 分钟
- 足够每天部署多次

---

## 📚 相关文档

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [Vite 构建配置文档](https://vitejs.dev/)
- [Vue Router Base URL](https://router.vuejs.org/zh/api/#createwebhistory)

---

## 🎯 下一步

部署成功后：

1. ✅ 保存网站地址到浏览器书签
2. ✅ 测试所有功能模块
3. ✅ 如需后端 API，部署后端服务并修改配置
4. ✅ 享受你的在线账单管理系统！
