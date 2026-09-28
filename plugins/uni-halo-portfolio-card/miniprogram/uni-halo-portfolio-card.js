/**
 * @fileoverview 项目集卡片组件（原生小程序）
 */
const constants = require('./constant')
const utils = require('./utils')
const HaloPortfolioApis = require('./api')

Component({
  properties: {
    // 插件所有的标签数据
    n: {
      type: Object,
      value: {}
    },
    // 项目路由标识
    slug: String
  },
  data: {
    loading: 'loading',
    loadingText: '加载中，请稍等...',
    project: null,
    poster: '',
    posterEmpty: false,
    typeLabel: '',
    techStacks: [],
    linkButtons: []
  },
  lifetimes: {
    attached () {
      this.initData()
    }
  },
  methods: {
    initData () {
      this.options = (this.data.n && this.data.n.attrs && this.data.n.attrs.options) || {}
      this.apiInstance = new HaloPortfolioApis(this.options)
      this.getData()
    },
    getData () {
      this.setData({
        loadingText: '加载中，请稍等...',
        loading: 'loading'
      })

      this.apiInstance.getProjectDetail(this.data.slug)
        .then(res => {
          const notOk = !res || (res.statusCode && res.statusCode !== 200)
          const data = notOk ? null : (res.data && res.data.data)
          if (!data || !data.title) {
            this.setData({
              loading: 'empty',
              loadingText: '项目不存在哦~'
            })
            return
          }
          this.setData({
            project: data,
            poster: utils.fixUrl(data.cover, this.options.domain),
            posterEmpty: !data.cover,
            typeLabel: utils.portfolioLabelOf(constants.TYPE_LABELS, data.type),
            techStacks: (data.techStacks || []).slice(0, 4),
            linkButtons: [
              { label: '仓库', url: data.repoUrl },
              { label: '演示', url: data.demoUrl },
              { label: '文档', url: data.docsUrl }
            ].filter(item => item.url),
            loading: 'success'
          })
        })
        .catch(err => {
          console.error('halo-portfolio-card 获取项目失败', err)
          this.setData({
            loading: 'error',
            loadingText: '项目加载失败，点击重试'
          })
        })
    },
    onPosterError () {
      this.setData({ posterEmpty: true })
    },
    handleCopy (e) {
      const { url, label } = e.currentTarget.dataset
      if (!url) return
      // 抛给宿主：动作 + 原始数据
      this.triggerEvent('actions', { action: 'copy', data: { slug: this.data.slug, label, url } })
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showToast({ icon: 'none', title: `${label}链接复制成功` })
        }
      })
    },
    // 详情不做内部跳转，抛给 node 层转发为 uhe-portfolio-actions 事件
    onDetail () {
      this.triggerEvent('actions', { action: 'detail', data: { slug: this.data.slug } })
    }
  }
})
