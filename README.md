# OPC AI

女性商业能力测评、AI 工具能力测评与个人 OPC 定位卡原型。

## 本地运行

```bash
cd opc-prototype
npm ci
npm run dev
```

## 构建

```bash
cd opc-prototype
npm run build
```

## Cloudflare Pages 部署

仓库已包含 GitHub Actions 工作流：`.github/workflows/cloudflare-pages.yml`。

需要在 GitHub 仓库设置两个 Actions Secrets：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

推送到 `main` 后会自动构建 `opc-prototype` 并部署 `opc-prototype/dist` 到 Cloudflare Pages 项目 `opc-ai`。
