# Halo 项目集卡片插件

将文章正文中的 `<portfolio-project-card data-slug="xxx" />` 标记在原位置渲染为项目卡片（数据来自 halo-plugin-portfolio 公开接口）。

## 使用插件

在根目录 `tools/config.js` 的 `plugins` 中添加 `'uni-halo-portfolio-card'`（已添加），然后执行构建：

```bash
npm run build:uni-app   # uni-app 平台
npm run build:weixin    # 微信小程序平台
```

## 内容标记

```html
<portfolio-project-card data-slug="uni-halo" />
```

- 属性保留 `data-slug`：插件在 `onUpdate` 中将其改写为 `slug`（mp-html 解析器会丢弃非 a/img 标签的 `data-*` 属性）。
- 无 `slug` 的标签会在解析阶段被移除。

## 宿主监听交互事件

卡片不做内部页面跳转（插件无法感知宿主路由），所有交互统一向 mp-html 根组件抛出 `uhe-portfolio-actions` 事件，由宿主监听处理。事件载荷为 `{ action, data }`：`action` 为动作名（`detail` 详情、`copy` 复制仓库/演示/文档链接），`data` 为原始对象数据（如 `{ slug }`，复制时附 `label`/`url`）：

```html
<!-- uni-app -->
<mp-html :content="html" @uhe-portfolio-actions="onPortfolioActions" />
```

```js
// e = { action: 'detail'|'copy', data: { slug, label?, url? } }
function onPortfolioActions (e) {
  if (e.action === 'detail') {
    uni.navigateTo({ url: `/pages-blog/portfolio/detail?slug=${e.data.slug}` })
  }
}
```

原生小程序端：

```html
<mp-html content="{{html}}" bind:uhe-portfolio-actions="onPortfolioActions" />
```

## 接口

- `GET {domain}/apis/public.portfolio.muyin.site/v1alpha1/projects/{slug}`（公开接口，domain 取 mp-html 的 `domain` 属性）。
- 封面等相对路径资源同样以 `domain` 补全。

## 文件说明

| 文件 | 职责 |
|---|---|
| `index.js` | 插件入口：onUpdate 改写 data-slug、onParse 识别标签/expose/透传 options |
| `build.js` | 构建配置：parser.js 注入标签、mp-html.vue 注册事件、node 层转发方法 |
| `api.js` | 项目详情接口封装（跨端 request） |
| `constant.js` | 类型/平台中文映射（与 App 端 config/portfolio.ts 对齐） |
| `utils.js` | pickObjectKeys / fixUrl / portfolioLabelOf |
| `uni-app/` | uni-app 平台组件与模板 |
| `miniprogram/` | 原生小程序组件与模板 |
