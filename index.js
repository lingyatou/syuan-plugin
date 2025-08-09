import { versionInfo } from './tools/index.js'
export * from './apps/index.js'

if (!segment?.button)
    segment.button = () => ""

logger.info('---------```````^_^```````---------')
logger.info(versionInfo.getInitMessage())

// 移除未定义的Index.init调用
setTimeout(Index.init, 1000)