/**
 * 用于生成目录列表
 */
'use strict'

const fs = require('fs')
const path = require('path')

const base = 'src/'
const pagePreFix = 'http://coalyer.github.io/starter-kit/' // 项目的路径
const sourcePrefix = 'https://github.com/coalyer/starter-kit/tree/master/' // 源码的路径

let files = fs.readdirSync(base)// readdirSync()：获取指定目录下所有文件名称

let html = fs.readFileSync('./menu.html').toString() // !readFileSync()：读取文档

let ul_html = `
    <div class="view">`// html的添加节点

const mlList = [
  'CSS',
  'Leaflet'
]

// 对文件夹更改进行排序，按照活跃时间进行排序
files.sort(function (a, b) {
  let astat = fs.lstatSync(base + a) //!lstatSync()：获取stat数组
  let bstat = fs.lstatSync(base + b)
  return bstat.mtime - astat.mtime
})

// 排除Mac自动生成文件
files = files.filter((x) => x !== ".DS_Store")

console.log(files)
// 添加列表内容
files.forEach(function (f) { // 循环一级文件夹
  let md_value = '| 标题 |  |\n|:-------- |:--------:|\n'//README的添加文档

  let npath = path.join(base, f)
  let array = findHtml(npath)

  array.sort(function (a, b) { // 循环一级文件夹下的所有html
    return b[2].mtime - a[2].mtime
  })// 对所有html进行排序

  if (array.length > 0) {
    ul_html += `
      <p>${f}</p>
      <ul class='main'>`
    array.forEach(function (p) {
      //!正则表达式.test方法：匹配字符串的部分
      //!RegExp.$1：是RegExp的一个属性,指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串
      const title = /<title>(.*)<\/title>/.test(fs.readFileSync(p[0]).toString()) ? RegExp.$1 : 'Document'

      const address = pagePreFix + p[0]
      const filedir = path.dirname(sourcePrefix + p[0])

      ul_html += `
        <li><a href='${p[0]}' target='_blank' class='demo-name' title='效果预览'>${title}</a><a href='${filedir}' class='demo-source' target='_blank' title='点击查看源码'>源码</a></li>`

      md_value += `| [${title}](${address}) | [查看代码](${filedir}) |\r`
    })

    ul_html += `
      </ul>
    `
  }

  //!writeFile()：创建并写入文件
  fs.writeFile(`./src/${f}/readme.md`, `# ${f} Demos

## 在线效果预览

> 建议用 \`chrome\` 查看

[placeholder]: p
[/placeholder]: p`, function (err) {
    if (err) throw err
    console.log(md_value, 'File is created successfully.')
    let readme = fs.readFileSync(`./src/${f}/readme.md`).toString()
    readme = readme.replace(/(\[placeholder]: p)[\s\S]*?(\[\/placeholder]: p)/, '$1\n\n' + md_value + '\n\n$2')
    // fs.writeFileSync('./README.md', readme)
    fs.writeFileSync(`./src/${f}/readme.md`, readme)
  })
})
ul_html += `</div>
  `

html = html.replace(/(<body>)[\s\S]*?(<\/body>)/, '$1' + ul_html + '$2')// !

fs.writeFileSync('./menu.html', html)
// fs.writeFileSync('./README.md', readmeAll)

function findHtml (folder_path, collector) {
  collector = collector || []

  let files = fs.readdirSync((folder_path += '/'))
  files = files.filter((x) => x !== ".DS_Store")
  let npath, stat

  files.forEach(function (f) {
    npath = folder_path + f
    stat = fs.lstatSync(npath)

    if (stat.isDirectory()) {
      findHtml(npath, collector)
      return
    }

    if (/^[^_].+\.html/.test(f)) {
      collector.push([npath, f, stat])
    }
  })

  return collector
}