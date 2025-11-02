import { versionInfo, pluginPath } from './tools/index.js'

import path from 'path'

import fs from 'node:fs'

const appsPath = path.join(pluginPath, 'apps')

if (!global.segment) {
    global.segment = (await import("oicq")).segment
}

if (!global.core) {
    try {
        global.core = (await import("oicq")).core
    } catch (err) { }
}

const files = fs.readdirSync(appsPath).filter(file => file.endsWith('.js'))
let ret = []
files.forEach((file) => {
    ret.push(import(`./apps/${file}`))
})
ret = await Promise.allSettled(ret)




logger.info('✨🌸━━━━━━━━ SYUAN-PLUGIN ━━━━━━━━🌸✨')
logger.info(`💖 插件名称：${logger.cyan(versionInfo.getProjectName())}`)
logger.info(`📦 插件版本：${logger.green(versionInfo.getVersion())}`)
logger.info(`👩‍💻 作者：${logger.magenta(versionInfo.getAuthor())}`)
logger.info(`📜 描述：${versionInfo.getDescription()}`)
logger.info('✨🌸━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🌸✨')

let apps = {}

for (let i in files) {
    let name = files[i].replace('.js', '')
    if (ret[i].status != 'fulfilled') {
        logger.error(`载入插件错误：${logger.red(name)}`)
        logger.error(ret[i].reason)
        continue
    }
    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}

export { apps }
