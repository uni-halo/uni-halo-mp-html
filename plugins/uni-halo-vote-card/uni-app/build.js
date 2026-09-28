module.exports = {
  template: '<uni-halo-vote-card v-if="n.name==\'vote-block\'" :class="n.attrs.class" :style="n.attrs.style"  :n="n" :mode="opts[5]" :vote-id="n.attrs.id" :data-i="i" data-source="vote-block" @actions="onVoteActions" />'
}
