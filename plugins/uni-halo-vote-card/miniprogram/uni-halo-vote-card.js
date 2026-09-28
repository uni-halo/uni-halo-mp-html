/**
 * @fileoverview 组件
 */
const constants = require('./constant')
const config = require('./config')
const utils = require('./utils')
const cache = require('./cache')

Component({
  properties: {
    mode: {
      type: Boolean,
      value: false
    },
    // 插件所有的数据
    n: {
      type: Object,
      value: {}
    },
    voteId: String
  },
  data: {
    options: {},
    loading: 'loading',
    loadingText: '加载中，请稍等...',
    detail: null,
    vote: null,
    submitForm: {
      voteData: []
    },
    submitLoading: false
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
      // 初始化api
      this.apiInstance = new config.HaloVoteCardApis({
        domain: this.data.options.domain,
        token: this.data.options.token ?? undefined
      })
      // this.handleLogProps()
      this.getData()
    },
    handleLogProps () {
      console.log('-------------- 参数开始 ---------------')
      console.log('props voteId', this.data.voteId)
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

      this.apiInstance.getVoteDetail(this.data.voteId)
        .then(res => {
          if (utils.isSerializableToJSON(res.data)) {
            const voteData = res.data

            // 已投选项 id：服务端 userVoteData 优先，本地缓存兜底
            const serverVoted = voteData.userVoteData || []
            const cached = cache.get(this.data.voteId)
            const votedIds = serverVoted.length > 0 ? serverVoted : ((cached && cached.selected) || [])

            voteData.vote.spec.isVoted = votedIds.length > 0
            voteData.vote.spec.disabled = votedIds.length > 0
            voteData.vote.spec._uh_state = utils.calcVoteState(voteData.vote)
            voteData.vote.spec._uh_type = constants.VOTE_TYPES[voteData.vote.spec.type]
            voteData.vote.spec._startDateFormatter = utils.formatTime({
              d: voteData.vote.spec.startDate,
              f: 'yyyy-MM-dd HH:mm:ss'
            })
            voteData.vote.spec._endDateFormatter = utils.formatTime({
              d: voteData.vote.spec.endDate,
              f: 'yyyy-MM-dd HH:mm:ss'
            })

            voteData.vote.spec.options = voteData.vote.spec.options.map((option) => {
              option.value = option.id
              option.label = option.title
              option.isVoted = votedIds.length > 0
              option.checked = votedIds.includes(option.id)
              option._uh_percent = this.calcOptionPercent(voteData, option)
              option.dataStr = JSON.stringify(option)
              return option
            })

            setTimeout(() => {
              this.setData({
                vote: voteData.vote,
                detail: voteData,
                loadingText: '数据加载成功',
                loading: 'success'
              })
            }, 200)
          } else {
            this.setData({
              loading: 'error',
              loadingText: '投票数据加载失败，点击重试'
            })
          }
        })
        .catch((err) => {
          console.error('请求失败', err)
          this.setData({
            loading: 'error',
            loadingText: '投票数据加载失败，点击重试'
          })
        })
    },
    // 选项百分比：PK 按两阵营票数之和归一化且合计恒为 100（对齐官方 vote-block），其余按总票数
    calcOptionPercent (voteData, option) {
      const vote = voteData.vote
      const counts = (voteData.voteDataList && voteData.voteDataList.length
        ? voteData.voteDataList
        : (vote.stats && vote.stats.voteDataList)) || []
      const count = (counts.find(x => x.id === option.id) || {}).voteCount || 0
      if (vote.spec.type === 'pk') {
        const optionIds = (vote.spec.options || []).map(x => x.id)
        const sum = counts.reduce((total, item) => {
          return optionIds.includes(item.id) ? total + (item.voteCount || 0) : total
        }, 0)
        return sum === 0 ? 50 : Math.round((count / sum) * 100)
      }
      const total = (vote.stats && vote.stats.voteCount) || 0
      return total === 0 ? 0 : Math.round((count / total) * 100)
    },
    formatJsonStr (jsonStr) {
      return jsonStr ? JSON.parse(jsonStr) : {}
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
    handleSubmitTip (e) {
      const { tip } = e.target.dataset
      wx.showToast({
        icon: 'none',
        title: tip
      })
    },
    handleSubmit () {
      if (!this.data.vote.spec.canAnonymously) {
        wx.showModal({
          icon: 'none',
          title: '提示',
          content: '该投票不支持匿名，请到博主的 网站端 进行投票！',
          showCancel: false,
          confirmText: '知道了',
          success: (res) => { }
        })
        return
      }

      wx.showLoading({
        title: '正在保存...',
        mask: true
      })
      this.setData({
        submitLoading: true
      })
      this.apiInstance.submitVote(this.data.voteId, this.data.submitForm, this.data.vote.spec.canAnonymously)
        .then(res => {
          wx.showToast({
            icon: 'none',
            title: '提交成功'
          })

          cache.set(this.data.voteId, {
            selected: [...this.data.submitForm.voteData],
            data: this.data.vote
          })

          this.getData()
        })
        .catch((e) => {
          wx.showToast({
            icon: 'none',
            title: '提交失败，请重试'
          })
        })
        .finally(() => {
          this.setData({
            submitLoading: false
          })
          wx.hideLoading()
        })
    },

    handleSelectSingleOption (e) {
      const { option } = e.target.dataset
      if (this.data.vote.spec._uh_state.state === '未开始') {
        this.showToast('投票未开始')
        return
      }
      if (this.data.vote.spec.hasEnded) return
      if (this.data.vote.spec.disabled) return
      this.setData({
        'vote.spec.options': this.data.vote.spec.options.map(item => {
          item.checked = option.id === item.id
          return item
        }),
        'submitForm.voteData': this.data.vote.spec.options.filter(x => x.checked).map(item => item.id)
      })
    },

    handleSelectCheckboxOption (e) {
      const { option } = e.target.dataset
      if (this.data.vote.spec._uh_state.state === '未开始') {
        this.showToast('投票未开始')
        return
      }

      if (this.data.vote.spec.hasEnded) return
      if (this.data.vote.spec.disabled) return

      const checkedList = this.data.vote.spec.options.filter(x => x.checked && x.id !== option.id)

      if (this.data.vote.spec.type === 'multiple' && checkedList.length >= this.vote.spec.maxVotes) {
        this.showToast(`最多选择 ${this.data.vote.spec.maxVotes} 项`)
        return
      }

      this.setData({
        'vote.spec.options': this.data.vote.spec.options.map(item => {
          if (option.id === item.id) {
            item.checked = !item.checked
          }
          return item
        }),
        'submitForm.voteData': this.data.vote.spec.options.filter(x => x.checked).map(item => item.id)
      })
    },
    // 监听点击事件，抛给 node 层转发为 uhe-vote-actions 事件
    onVoteClick () {
      this.triggerEvent('actions', { action: 'detail', data: { id: this.data.voteId } })
    },
    showToast (content) {
      wx.showToast({
        icon: 'none',
        title: content,
        mask: true
      })
    }
  }
})
