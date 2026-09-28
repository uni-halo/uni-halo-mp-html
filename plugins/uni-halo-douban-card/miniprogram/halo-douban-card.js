/**
 * @fileoverview 豆瓣卡片 组件
 */
const utils = require('./utils')

Component({
  properties: {
    mode: {
      type: Boolean,
      value: false
    },
    // 组件所有的参数
    n: {
      type: Object,
      value: {}
    },
    src: String
  },
  data: {
    options: {},
    loading: 'loading',
    loadingText: '加载中，请稍等...',
    detail: null,
    types: {
      movie: '电影',
      book: '图书',
      music: '音乐',
      game: '游戏',
      drama: '舞台剧'
    },
    poster: '',
    posterEmpty: false,
    stars: '☆☆☆☆☆☆☆☆☆☆'
  },
  lifetimes: {
    attached () {
      this.initData()
    },
    ready () {
    }
  },
  methods: {
    initData () {
      this.setData({
        options: this.data.n.attrs.options
      })
      // this.handleLogProps()
      this.getData()
    },
    handleLogProps () {
      console.log('-------------- 参数开始 ---------------')
      console.log('props mode', this.data.mode)
      console.log('props src', this.data.src)
      console.log('props options', this.data.n)
      console.log('props options', this.data.options)
      console.log('-------------- 参数结束 ---------------')
    },
    getData () {
      this.setData({
        loadingText: '加载中，请稍等...',
        loading: 'loading',
        poster: '',
        posterEmpty: false
      })

      const domain = this.data.options.domain
      if (!domain) {
        this.setData({
          loadingText: '未配置基础域名',
          loading: 'error'
        })
        return
      }
      if (!this.data.src) {
        this.setData({
          loadingText: '组件不存在 [src] 参数',
          loading: 'error'
        })
        return
      }

      wx.request({
        url: domain + '/apis/api.douban.moony.la/v1alpha1/doubanmovies/-/getDoubanDetail',
        method: 'GET',
        header: {
          ContentType: 'application/json',
          dataType: 'json'
        },
        data: {
          url: this.data.src
        },
        success: (res) => {
          if (utils.isSerializableToJSON(res.data)) {
            const maxStarsCount = 5
            let starsCount = Math.round(res.data.spec.score / 2)

            if (starsCount > maxStarsCount) {
              starsCount = maxStarsCount
            }
            const scoreStars = new Array(starsCount).fill(0).map((_) => '★')
            const defaultStars = new Array(maxStarsCount - starsCount).fill(0).map((_) => '☆')

            this.setData({
              detail: res.data,
              poster: res.data.spec.poster,
              stars: [...scoreStars, ...defaultStars].join('')
            })
            setTimeout(() => {
              this.setData({
                loading: 'success'
              })
            }, 200)
          } else {
            this.setData({
              loading: 'error',
              loadingText: '豆瓣数据加载失败，点击重试'
            })
          }
        },
        fail: () => {
          this.setData({
            loading: 'error',
            loadingText: '豆瓣数据加载失败，点击重试'
          })
        }
      })
    },
    onPosterError () {
      console.log('onPosterError')
      this.setData({
        poster: '',
        posterEmpty: true
      })
    },
    handlePreviewImage () {
      wx.previewImage({
        urls: [this.data.poster],
        showmenu: true
      })
    },
    handleCopyText (data, tipText) {
      wx.setClipboardData({
        data: data,
        success: () => {
          if (tipText) {
            wx.showToast({
              icon: 'none',
              title: tipText
            })
          }
        }
      })
    },
    handleCopyInfo (e) {
      const { type = '' } = e.target.dataset
      const data = this.data.detail

      if (type === 'link') {
        this.handleCopyText(data?.spec.link, '豆瓣资源地址复制成功')
        return
      }
      if (type === 'info') {
        const content = `名称:${data?.spec.name}丨其他:${data?.spec.cardSubtitle}丨标签:${data?.spec.genres.join('/')}丨时间:${
          data?.spec.pubdate
        }丨评分:${data?.spec.score}分丨链接:${data?.spec.link}`
        this.handleCopyText(content, '资源信息复制成功')
      }
    }
  }
})
