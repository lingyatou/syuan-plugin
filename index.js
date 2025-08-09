import { versionInfo } from './tools/index.js'
export * from './apps/index.js'

if (!segment?.button)
    segment.button = () => ""

if (Bot?.logger?.info) {
    Bot.logger.info('---------^_^---------')
    Bot.logger.info(versionInfo.getInitMessage())
} else {
    console.log(versionInfo.getInitMessage())
}

// 移除未定义的Index.init调用
setTimeout(Index.init, 1000)