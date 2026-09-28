<template>
  <view class="halo-plugin-wrapper halo-plugin-status" :class="[loading]">
    <view v-if="loading !== 'success'" class="halo-plugin-wrapper-error" @click="getData()">
      {{ loadingText }}
    </view>
    <template v-else>
      显示插件结果，{{ loadingText }}
    </template>
  </view>
</template>

<script>

export default {
  props: {
    mode: {
      type: Boolean,
      default: false
    },
    // 组件所有的参数
    n: {
      type: Object,
      default: {}
    },
    // 其他参数，一般都是组件的原始对应的参数名称
    // 比如，title
    title: String
  },
  data () {
    return {
      options: {},
      loading: 'loading',
      loadingText: '加载中，请稍等...'
    }
  },
  created () {
    this.getData()
  },
  methods: {
    // 统一初始化组件
    initData () {
      this.options = this.n
      this.handleLogProps()
      this.getData()
    },
    // 打印参数
    handleLogProps () {
      console.log('-------------- 参数开始 ---------------')
      console.log('props title', this.title)
      console.log('props mode', this.mode)
      console.log('props n', this.n)
      console.log('data options', this.options)
      console.log('-------------- 参数结束 ---------------')
    },
    getData () {
      this.loadingText = '加载中，请稍等...'
      this.loading = 'loading'

      // todo:其他逻辑
      setTimeout(() => {
        this.loadingText = '组件数据加载成功'
        this.loading = 'success'
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
.halo-plugin-wrapper {
  width: 100%;
}

.halo-plugin-status.error {
  padding: 0;
  border-style: dashed;
  border-color: #e88080;
  color: #e88080;
  background-color: rgba(232, 128, 128, 0.075);
}

.halo-plugin-status.loading {
  padding: 0;
  border-style: dashed;
  border-color: rgba(3, 174, 252, 1);
  color: rgba(3, 174, 252, 1);
  background-color: rgba(3, 174, 252, 0.075);
}

.halo-plugin-wrapper-error {
  width: 100%;
}
</style>
