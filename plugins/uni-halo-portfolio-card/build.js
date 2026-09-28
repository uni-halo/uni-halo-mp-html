/**
 * @fileoverview 项目集卡片构建配置（uni-app / 小程序通用）
 */

module.exports = {
  /**
   * @description 入口文件
   */
  main: 'index.js',

  /**
   * @description 支持的平台
   */
  platform: ['mp-weixin', 'mp-qq', 'mp-baidu', 'mp-alipay', 'mp-toutiao', 'uni-app'],

  /**
   * @description 模板标签（由各平台 build.js 提供）
   */
  template: '',

  /**
   * @description 添加到 node 组件的方法：卡片交互（复制/详情）统一向 mp-html 根组件抛出事件
   * 宿主通过 <mp-html @uhe-portfolio-actions="..." />（uni-app）或 bind:uhe-portfolio-actions（小程序）监听
   * 事件 detail 结构：{ action: 'detail'|'copy', data: <原始对象数据> }
   */
  methods: {
    onPortfolioActions (e) {
      const detail = e && e.detail ? e.detail : e
      if (typeof this.root.triggerEvent === 'function') {
        this.root.triggerEvent('uhe-portfolio-actions', detail)
      } else {
        this.root.$emit('uhe-portfolio-actions', detail)
      }
    }
  },

  /**
   * @description 组件声明（uni-app 由 node.vue import，小程序由 node.json 引用）
   * 注意路径须与构建产物一致：插件目录名/组件名
   */
  usingComponents: {
    'uni-halo-portfolio-card': '../uni-halo-portfolio-card/uni-halo-portfolio-card'
  },

  /**
   * @description 自定义文件处理器：注入标签解析与事件注册
   * @param {Vinyl} file 文件对象
   * @param {String} platform 平台
   */
  handler (file, platform) {
    if (file.isBuffer()) {
      let content = file.contents.toString()
      if (file.path.includes('parser.js')) {
        // 标签加入信任标签与自闭合标签表
        content = content.replace(/trustTags\s*:\s*makeMap\('/, 'trustTags: makeMap(\'portfolio-project-card,')
          .replace(/voidTags\s*:\s*makeMap\('/, 'voidTags: makeMap(\'portfolio-project-card,')
      } else if (file.path.includes('mp-html.vue')) {
        // 注册自定义事件，供宿主通过 @uhe-portfolio-actions 监听
        content = content.replace(/emits\s*:\s*\[/, 'emits: [\'uhe-portfolio-actions\',')
      }
      file.contents = Buffer.from(content)
    }
  }
}
