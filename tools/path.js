/**
 * 项目定位工具
 * copy自miao-plugin(其实一点也没改)
 * 根据文件路径计算miao-plugin路径及yunzai路径
 * 规避在外部import，在非yunzai根目录执行时，使用process.cwd()查找文件有可能错误的问题
 */
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// plugin根路径
const pluginPath = path.join(__dirname, '..')
// yunzai根路径
const rootPath = path.join(pluginPath, '..', '..')
// yunzai的data路径
const rootDataPath = path.join(rootPath, 'data', 'syuan')

// yunzai的资源路径
const rootResourcesPath = path.join(rootPath, 'resources', 'syuan')

// syuan-plugin的data路径
const pluginDataPath = path.join(pluginPath, 'data')
// syuan-plugin的resource路径
const pluginResourcesPath = path.join(pluginPath, 'resources')

const paths = {
  pluginPath,
  rootPath,
  rootDataPath,
  rootResourcesPath,
  pluginDataPath,
  pluginResourcesPath
}
// 导出命名和默认（兼容旧引用）
export {
  pluginPath,
  rootPath,
  rootDataPath,
  rootResourcesPath,
  pluginDataPath,
  pluginResourcesPath,
  paths
}


// 默认导出
export default paths