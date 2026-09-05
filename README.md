# MR.PANG — 庞老师的自留地(轻量版)

个人博客站点源仓库,**Hugo + PaperMod**。

## 技术栈

- Hugo v0.165.0 extended
- 主题: PaperMod(已 inline,锁定 commit `d3768854`)
- 托管: Cloudflare Pages
- 域名: `https://pangxs.com/`

## 目录结构

```
pangxs/
├── content/            # 博客内容
│   ├── about/         # 关于页
│   └── posts/         # 文章
├── themes/PaperMod/   # PaperMod 主题(inline,不通过 submodule)
├── hugo.toml          # 站点主配置
└── .gitignore
```

> ⚠️ **关于主题**:本仓库从原始 `gohugoio/hugo` fork 项目 [mrpjmx/fnhugo](https://github.com/mrpjmx/fnhugo) 迁出。
> 原始仓库将 Hugo 源码与站点内容混在一起(几十 GB),不便日常维护。
> 本仓库只保留站点内容 + 主题,体积 ≈ 几 MB。

## 本地预览

```bash
hugo server -D
```

## 部署

由 Cloudflare Pages 自动构建,推送 `main` 分支即触发。

## License

Content © 庞老师 · Theme PaperMod © Authors
