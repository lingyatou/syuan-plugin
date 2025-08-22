import { versionInfo } from './tools/index.js'
export * from './apps/index.js'

if (!segment?.button)
    segment.button = () => ""

logger.info('---------```````^_^```````---------')
logger.info(versionInfo.getInitMessage())
