import fs from 'fs'
import path from 'path'
import yaml from 'yaml'
import puppeteer from 'puppeteer'
import { pluginPath, versionInfo } from '../tools/index.js'

export class HelpApp extends plugin {
  constructor() {
    super({
      name: '帮助系统',
      dsc: '显示插件帮助信息',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: '^#?sy帮助$',
          fnc: 'showHelp'
        }
      ]
    })
  }

  async showHelp(e) {
    let page
    try {
      const yamlPath = path.join(pluginPath, 'resources/help/help.yaml')
      const bgPath = path.join(pluginPath, 'resources/help/bg.jpg')
      const html = this.generateHelpHtml(yamlPath, bgPath, versionInfo.getProjectName())

      page = await puppeteer.launch({ args: ['--no-sandbox'] }).then(b => b.newPage())
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const base64 = await page.screenshot({ encoding: 'base64', fullPage: true })

      e.reply([segment.image(`base64://${base64}`)])
    } catch (error) {
      console.error('生成帮助图片时出错:', error)
      e.reply('抱歉，生成帮助图片时出现错误')
    } finally {
      if (page) page.close().catch(() => { })
    }

    return true
  }

  generateHelpHtml(yamlPath, bgPath, pluginName = '我的插件') {
    if (!fs.existsSync(yamlPath)) return this.getDefaultHtml('YAML 文件不存在')
    const fileContent = fs.readFileSync(yamlPath, 'utf8')
    const data = yaml.parse(fileContent)
    if (!data.helpList || !Array.isArray(data.helpList)) return this.getDefaultHtml('YAML 格式不正确')

    const helpList = data.helpList
    const cgColor = 'rgba(255, 255, 255, 0.4)'
    const shadowc = '0px 0px 15px rgba(0, 0, 0, 0.3)'
    let helpContent = ''

    for (const group of helpList) {
      helpContent += `
        <div class="help-group">
          <h3 class="group-title">${group.group}</h3>
          ${group.desc ? `<p class="group-desc">${group.desc}</p>` : ''}
          <div class="command-list">
      `

      for (const item of group.list) {
        const iconFile = path.join(pluginPath, `resources/help/icon/${item.icon}.png`)
        const iconExists = fs.existsSync(iconFile)
        helpContent += `
          <div class="command-item">
            ${iconExists ? `<div class="command-icon"><img src="file://${iconFile}" alt="icon"></div>` : ''}
            <div class="command-info" ${!iconExists ? 'style="margin-left: 0;"' : ''}>
              <div class="command-title">${item.title}</div>
              <div class="command-desc">${item.desc}</div>
            </div>
          </div>
        `
      }

      helpContent += '</div></div>'
    }

    return `
      <html>
      <head>
      <style>
        body{margin:0;padding:0;display:flex;justify-content:center;align-items:center;font-family:"Microsoft YaHei";}
        .image{position:relative;width:100%;height:100%;display:flex;justify-content:center;align-items:center;}
        img.bg{width:100%;height:100%;object-fit:cover;filter:brightness(100%);}
        .combined-content{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;justify-content:center;align-items:center;}
        .content-inner{width:800px;max-height:600px;background:${cgColor};border-radius:15px;backdrop-filter:blur(3px);box-shadow:${shadowc};padding:20px;overflow:auto;}
        .plugin-name{font-size:28px;color:#FFD700;text-align:center;text-shadow:2px 2px 4px rgba(0,0,0,0.8);font-weight:bold;margin-bottom:15px;}
        .help-group{margin-bottom:20px;padding:15px;background:rgba(255,255,255,0.1);border-radius:10px;border:1px solid rgba(255,255,255,0.2);}
        .group-title{color:#FFD700;text-shadow:2px 2px 4px rgba(0,0,0,0.8);font-size:24px;font-weight:bold;margin:0 0 10px 0;text-align:center;}
        .group-desc{color:#FFA500;text-shadow:1px 1px 2px rgba(0,0,0,0.8);font-size:16px;margin:0 0 15px 0;text-align:center;font-style:italic;}
        .command-list{display:flex;flex-direction:column;gap:10px;}
        .command-item{display:flex;align-items:center;padding:10px;background:rgba(255,255,255,0.1);border-radius:8px;border:1px solid rgba(255,255,255,0.1);}
        .command-icon{width:40px;height:40px;margin-right:15px;flex-shrink:0;}
        .command-icon img{width:100%;height:100%;object-fit:contain;border-radius:5px;}
        .command-info{flex:1;}
        .command-title{color:#FFD700;text-shadow:1px 1px 2px rgba(0,0,0,0.8);font-size:18px;font-weight:bold;margin-bottom:5px;}
        .command-desc{color:#FFFFFF;text-shadow:1px 1px 2px rgba(0,0,0,0.8);font-size:14px;line-height:1.4;}
      </style>
      </head>
      <body>
        <div class="image">
          <img class="bg" src="file://${bgPath}">
          <div class="combined-content">
            <div class="content-inner">
              <div class="plugin-name">${pluginName}</div>
              ${helpContent}
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  getDefaultHtml(msg = '无法加载帮助内容') {
    return `
      <html>
      <head>
      <style>
        body{margin:0;padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;font-family:Arial,sans-serif;text-align:center;}
        .error-container{background:rgba(255,255,255,0.1);padding:40px;border-radius:15px;backdrop-filter:blur(10px);}
        h1{font-size:32px;margin-bottom:20px;}
        p{font-size:18px;line-height:1.6;}
      </style>
      </head>
      <body>
        <div class="error-container">
          <h1>帮助系统</h1>
          <p>${msg}</p>
        </div>
      </body>
      </html>
    `
  }
}
