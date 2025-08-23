import { rootPath } from './path.js'
import fs from 'fs'
import YAML from 'yaml'
import path from 'path'

// 读取other.yaml
const configPath = path.join(rootPath, 'config/config/other.yaml')
const file = fs.readFileSync(configPath, 'utf8')
const config = YAML.parse(file)

/**
 * 判断某个用户是否是指定bot的主人
 * @param {string} botId - 机器人ID
 * @param {string} userId - 用户ID
 * @returns {boolean} 是否是主人
 */
export function isMaster(botId, userId) {
    const masters = config.master || []
    for (const item of masters) {
        // item 是 "2239841632:2331329306" 这种字符串
        const [b, u] = item.split(':')
        if (b === botId && u === userId) {
            return true
        }
    }
    return false
}
