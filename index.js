import pkg from './package.json' assert { type: 'json' }
export * from './apps/index.js'

if (!segment.button)
    segment.button = () => ""

if (Bot?.logger?.info) {
    Bot.logger.info('---------^_^---------')
    Bot.logger.info(`自用插件${pkg.version}初始化~\n作者：${pkg.author}`)
} else {
    console.log(`自用插件${pkg.version}初始化~\n作者：${pkg.author}`)
}

setTimeout(Index.init, 1000)