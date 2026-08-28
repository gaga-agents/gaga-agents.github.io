# 嘎嘎鸭智能体快速开发部署平台文档站

此目录是 `gagaduck-agents-platform` 的产品文档源码，基于开源 [Docusaurus](https://docusaurus.io/) 构建，并使用开源的本地中文搜索插件。静态产物由 GitHub Actions 构建并发布到 GitHub Pages。

产品使用、部署和架构内容位于 `docs/docs/`；本文件只服务于文档站维护者，不会进入产品文档侧边栏。

## 本地预览

默认启动完整的中英文静态预览（会先构建两个 locale）：

```powershell
cd docs
npm install
npm start
```

默认访问 `http://127.0.0.1:3000/`，此时语言切换可以在同一端口正常工作。

需要编辑文档并使用热更新时，启动单 locale 开发服务器（默认是中文）：

```powershell
npm run start:dev
```

英文开发服务器可以单独启动在 3001 端口：

```powershell
.\node_modules\.bin\docusaurus.cmd start --locale en --port 3001
```

需要一次检查中英文切换时，先执行生产构建，再用 `serve` 预览完整静态产物。

## 生产构建

```powershell
npm run build
npm run serve
```

构建输出位于 `docs/build/`。

## GitHub Pages

根目录 `.github/workflows/docs-pages.yml` 在文档相关文件变更后自动构建并发布。首次使用时，在仓库 **Settings → Pages** 将 Source 设置为 **GitHub Actions**。

站点 URL 和 `baseUrl` 会根据 `GITHUB_REPOSITORY` 自动计算，兼容普通项目页 `owner.github.io/repository/` 和用户主页仓库 `owner.github.io/`。

产品代码仓库分为两个入口：

- 前端：[gagaduck-agents-platform-frontend](https://github.com/gagaducko/gagaduck-agents-platform-frontend)
- 后端：[gagaduck-agents-platform-backend](https://github.com/gagaducko/gagaduck-agents-platform-backend)

文档站导航中的 **Frontend** 和 **Backend** 会分别打开这两个仓库。

## 维护入口

- 产品内容：`docs/docs/`
- 首页：`docs/src/pages/index.js`
- 导航：`docs/sidebars.js`、`docs/docusaurus.config.js`
- 全局样式：`docs/src/css/custom.css`
- 中英文正文：`docs/docs/`、`docs/i18n/en/docusaurus-plugin-content-docs/current/`
- SVG 架构图：`docs/static/img/diagrams/`
- 产品界面截图：`docs/static/img/screenshots/`
- 贡献者：`docs/src/data/contributors.js`

新增操作文档时，优先使用“前提 → 预期结果 → 步骤 → 验证 → 排障 → 下一步”的结构。公开页面不要写入真实凭据、内网地址或仅适用于个人机器的命令。
