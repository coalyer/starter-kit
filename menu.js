/**
 * 用于生成目录列表
 */
'use strict'

const fs = require('fs')
const path = require('path')

const base = 'src/'
const pagePreFix = 'http://coalyer.github.io/starter-kit/' // 项目的路径
const sourcePrefix = 'https://github.com/coalyer/starter-kit/tree/master/' // 源码的路径

let filesAll = fs.readdirSync(base)// readdirSync()：获取指定目录下所有文件名称

let htmlAll = fs.readFileSync('./menu.html').toString() // !readFileSync()：读取文档
let ul_htmlAll = `\n<div class="view">`// html的添加节点
ul_htmlAll += `\n<ul class='main'>`

let readmeAll = fs.readFileSync('./README.md').toString()
let md_valueAll = '| 标题 |  |\n|:-------- |:--------:|\n'

// 对文件夹更改进行排序，按照活跃时间进行排序
filesAll.sort(function (a, b) {
  let astat = fs.lstatSync(base + a) //!lstatSync()：获取stat数组
  let bstat = fs.lstatSync(base + b)
  return bstat.mtime - astat.mtime
})

// 排除Mac自动生成文件
filesAll = filesAll.filter((x) => x !== ".DS_Store")

// 添加列表内容
filesAll.forEach(function (fAll) { // 循环一级文件夹
  let md_value = '| 标题 |  |\n|:-------- |:--------:|\n'//README的添加文档
  let ul_html = `\n<div class="view">`// html的添加节点
  let npathAll = path.join(base, fAll) //!join()：用平台特定的分隔符[Unix系统是/，Windows系统是\ ]把全部给定的 path 片段连接到一起，并规范化生成的路径
  let files = fs.readdirSync(`${npathAll}/`)
  files = files.filter((x) => x !== ".DS_Store")
  files.sort(function (a, b) {
    let astat = fs.lstatSync(`${npathAll}/` + a) //!lstatSync()：获取stat数组
    let bstat = fs.lstatSync(`${npathAll}/` + b)
    return bstat.mtime - astat.mtime
  })
  files.forEach(f => {
    let npath = path.join(npathAll, f)
    let array = findHtml(npath)
    array.sort(function (a, b) { // 循环一级文件夹下的所有html
      return b[2].mtime - a[2].mtime
    })// 对所有html进行排序
    if (array.length > 0) {
      ul_html += `\n<p>${f}</p>\n<ul class='main'>`
      array.forEach(function (p) {
        //!正则表达式.test方法：匹配字符串的部分
        //!RegExp.$1：是RegExp的一个属性,指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串
        const title = /<title>(.*)<\/title>/.test(fs.readFileSync(p[0]).toString()) ? RegExp.$1 : 'Document'
        const address = pagePreFix + p[0]
        const filedir = path.dirname(sourcePrefix + p[0]) //!返回path的目录。类似于UNIX目录命令
        const url = `../${p[0]}` // 因为菜单在menus文件夹中，所以要像上退一级
        ul_html += `\n<li>\n<a href='${url}' target='_blank' class='demo-name' title='效果预览'>${title}</a><a href='${filedir}' class='demo-source' target='_blank' title='点击查看源码'>源码</a>\n</li>`
        md_value += `| [${title}](${address}) | [查看代码](${filedir}) |\r`
      })
      ul_html += `\n</ul>\n`
    }
  })
  //!writeFile()：创建并写入文件
  fs.writeFile(`./docs/${fAll}.md`, `# ${fAll} Demos\n\n## 在线效果预览\n\n> 建议用 \`chrome\` 查看\n\n[placeholder]: p\n\n[/placeholder]: p`, function (err) {
    if (err) throw err
    let readme = fs.readFileSync(`./docs/${fAll}.md`).toString()
    readme = readme.replace(/(\[placeholder]: p)[\s\S]*?(\[\/placeholder]: p)/, '$1\n\n' + md_value + '\n\n$2')
    fs.writeFileSync(`./docs/${fAll}.md`, readme)
  })
  fs.writeFile(`./menus/${fAll}.html`, '', function (err) {
    if (err) throw err
    ul_html += `</div>\n`
    let html = fs.readFileSync('./menu.html').toString()
    html = html.replace(/(<body>)[\s\S]*?(<\/body>)/, '$1' + ul_html + '$2')// !
    fs.writeFileSync(`./menus/${fAll}.html`, html)
  })
  ul_htmlAll += `\n<li>\n<a href='./menus/${fAll}.html' target='_blank' class='demo-name' title='效果预览'>${fAll}</a>\n</li>`
  //<a href='${sourcePrefix}menus/${fAll}' class='demo-source' target='_blank' title='点击查看源码'>源码</a>
  md_valueAll += `| ${fAll} | [查看](${sourcePrefix}docs/${fAll}) |\r`
  console.log(sourcePrefix)
})
ul_htmlAll += `</div>\n`
//   `

htmlAll = htmlAll.replace(/(<body>)[\s\S]*?(<\/body>)/, '$1' + ul_htmlAll + '$2')// !
readmeAll = readmeAll.replace(/(\[placeholder]: p)[\s\S]*?(\[\/placeholder]: p)/, '$1\n\n' + md_valueAll + '\n\n$2')

fs.writeFileSync('./menu.html', htmlAll)
fs.writeFileSync('./README.md', readmeAll)

function findHtml (folder_path, collector) {
  collector = collector || []

  let files = fs.readdirSync((folder_path += '/'))
  files = files.filter((x) => x !== ".DS_Store")
  let npath, stat

  files.forEach(function (f) {
    npath = folder_path + f
    stat = fs.lstatSync(npath)

    if (stat.isDirectory()) { //!isDirectory()，判断是否是目录
      findHtml(npath, collector)
      return
    }
    // if (/^[^_].+\.html/.test(f)) { // 不做单一字符判断
    collector.push([npath, f, stat])
    // }
  })
  return collector
}