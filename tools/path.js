/**
 * 项目定位工具
 * copy自miao-plugin(其实一点也没改)
 * 根据文件路径计算miao-plugin路径及yunzai路径
 * 规避在外部import，在非yunzai根目录执行时，使用process.cwd()查找文件有可能错误的问题
 */
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// miao-plugin根路径
const pluginPath = path.join(__dirname, '..')
// yunzai根路径
const rootPath = path.join(pluginPath, '..', '..')

const dataPath = path.join(rootPath, 'data', 'Syuan-plugin')

export { pluginPath, rootPath, dataPath }
