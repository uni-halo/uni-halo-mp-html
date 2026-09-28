/**
 * @fileoverview 组件
 */
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
    // 其他参数，一般都是组件的原始对应的参数名称
    // 比如，title
    title: String
  },
  data: {
    options: {},
    loading: 'loading',
    loadingText: '加载中，请稍等...'
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
      this.handleLogProps()
      this.getData()
    },
    handleLogProps () {
      console.log('-------------- 参数开始 ---------------')
      console.log('props title', this.data.title)
      console.log('props mode', this.data.mode)
      console.log('props n', this.data.n)
      console.log('data options', this.data.options)
      console.log('-------------- 参数结束 ---------------')
    },
    getData () {
      this.setData({
        loadingText: '加载中，请稍等...',
        loading: 'loading'
      })
      // todo：其他操作
      setTimeout(() => {
        this.setData({
          loadingText: '组件数据加载成功',
          loading: 'success'
        })
      }, 500)
    }
  }
})
