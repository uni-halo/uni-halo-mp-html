module.exports = {
  template: '<uni-halo-douban-card v-if="n.name==\'douban\'" :class="n.attrs.class" :style="n.attrs.style" :n="n" :mode="opts[5]" :url="n.attrs.src" @actions="onDoubanActions" />'
}
