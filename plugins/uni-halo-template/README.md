# Halo 开发插件模板

这是一个开发模板

## 使用插件

如果要使用插件，在根目录的 `tools.js` 中的插件 `plugins` 中添加对应的 插件目录名称即可。

## 开发注意

### 1. 包裹组件无法找到问题

如果 组件不在html数据的根下，也就是有包裹的情况，需要进行处理。例如：
```javascript

const html1 = `
<div>这里是不包裹，无需处理</div>
<halo-component-name></halo-component-name>
`

const html2 = `
<div>这里是包裹，需要处理</div>
<div>
  <halo-component-name></halo-component-name>
</div>
`

```

包裹的处理方案如下，需要在插件的 `index.js` 文件中的 `onParse` 中解决，具体如下：

```javascript
/**
 * @description 解析到一个标签时触发
 * @param {object} node 标签
 * @param {object} parser 解析器实例
 * @returns {boolean|void} 如果返回 false 将移除该标签
 */
HaloDouBanCard.prototype.onParse = function (node, parser) {
  // 处理文本标签
  if (node.type === 'text') {
    // node.text 文本内容
    // console.log('节点内容转换', node)
  } else {
    // 处理元素标签
    // node.name 标签名
    // node.attrs 属性列表
    // node.children 子节点（非自闭合标签有）
    if (node.name === 'halo-copmonent-name') { 
      
      // 重点调用
      parser.expose() // 如果该标签不能被 rich-text 包含，需要调用此方法暴露出来，解决自定义标签嵌套无法解析问题
      
      // parser.options 组件传入的一些解析属性
      // parser.stack 可以从栈中获取祖先节点
    }
  }
}
```


### 2. 组件使用根组件的参数

组件需要使用根组件的参数，可以通过以下的方式传入

#### 2.1 在 `index.js` 文件的 `onParse` 中修改 `node.attrs`

```javascript

/**
 * @description 解析到一个标签时触发
 * @param {object} node 标签
 * @param {object} parser 解析器实例
 * @returns {boolean|void} 如果返回 false 将移除该标签
 */
HaloDouBanCard.prototype.onParse = function (node, parser) {
  // 处理文本标签
  if (node.type === 'text') {
    // node.text 文本内容
    // console.log('节点内容转换', node)
  } else {
    // 处理元素标签
    // node.name 标签名
    // node.attrs 属性列表
    // node.children 子节点（非自闭合标签有）
    if (node.name === 'halo-copmonent-name') { 
      
      // 参数传递，根组件的参数在 parser.options 中
      // node.attrs 可以添加任何新的属性，最好确保不要覆盖原来的
      // node.attrs['anyKey'] = anyValue
      node.attrs.options = {}
      
      parser.expose() // 如果该标签不能被 rich-text 包含，需要调用此方法暴露出来，解决自定义标签嵌套无法解析问题
      
      // parser.options 组件传入的一些解析属性
      // parser.stack 可以从栈中获取祖先节点
    }
  }
}

```

### 2.2 在组件下的对应平台的 build.js 传入数据

经过尝试，我们统一使用 `n` 参数名传入，然后对应的组件内部也需要定义 传入的 props 属性为 `n`

#### 2.2.1 miniprogram
```html
<halo-component-name wx:elif="{{n.name=='douban'}}" class="{{n.attrs.class}}" style="{{n.attrs.style}}" src="{{n.attrs.src}}" n="{{n}}" data-i="{{i}}"/>
```

#### 2.2.1 uni-app
