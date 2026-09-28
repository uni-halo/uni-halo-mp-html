module.exports = {
  template: '<uni-halo-portfolio-card wx:elif="{{n.name==\'portfolio-project-card\'}}" class="{{n.attrs.class}}" style="{{n.attrs.style}}" slug="{{n.attrs.slug}}" n="{{n}}" data-i="{{i}}" data-source="portfolio-project-card" bind:actions="onPortfolioActions" />'
}
