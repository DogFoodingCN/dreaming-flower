# Dreaming Flower

Dreaming Flower 是一个基于 Next.js 的个人空间项目，域名规划为 `dogfooding.cn`。

项目定位：个人空间、IP 打造、产品体验与博客输出。

## 当前阶段

当前阶段为 MVP，只实现首页。

首页方向：

- 作为整个站点的星系入口
- 视觉围绕“星系构造”展开
- 支持基础交互，为后续模块入口预留体验
- 后续模块可通过首页交互进入，但 MVP 阶段不实现模块详情

## 产品约束

- AI 生成的项目文件应保留在当前项目内
- 项目计划、构思、草稿等本地材料放在 `.ai/` 下，不提交到 Git
- 项目约束文件放在 `docs/constraints/` 下，并提交到 Git
- 页面需自适应，支持手机和电脑访问
- 需要支持日间模式与夜间模式切换
- 当前 MVP 聚焦首页，不扩展博客、产品页或其他模块实现

约束文档：

- [项目约束](docs/constraints/project.md)
- [MVP 约束](docs/constraints/mvp.md)
- [视觉约束](docs/constraints/visual.md)

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- pnpm

## 本地开发

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

打开本地地址：

```text
http://localhost:3000
```

## 验证

```bash
pnpm lint
pnpm build
```
