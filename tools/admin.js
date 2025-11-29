import { paths } from './path.js'
import fs from 'fs'
import YAML from 'yaml'
import path from 'path'

// 读取other.yaml
const configPath = path.join(paths.rootPath, 'config/config/other.yaml')
const file = fs.readFileSync(configPath, 'utf8')
const config = YAML.parse(file)

/**
 * 判断某个用户是否是指定bot的主人，仅适用TRSS-Yunzai
 * @param {string} botId - 机器人ID
 * @param {string} userId - 用户ID
 * @returns {boolean} 是否是主人
 */
export function isMaster(botId, userId) {
    const masters = config.master || []
    for (const item of masters) {
        // item 是 "2239841632:2331329306" 这种字符串
        const [b, u] = item.split(':')
        if (String(b) === String(botId) && String(u) === String(userId)) {
            return true
        }
    }
    return false
}

/**
 * 延时函数，返回一个在指定毫秒后完成的 Promise
 * @param {number} ms - 延时时间（毫秒）
 * @returns {Promise<void>} 延时完成的 Promise
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * 读取并解析 privacy.json 文件，返回对象
 *
 * @function getPrivacyData
 * @returns {Object} 解析后的隐私数据对象
 * - 如果文件不存在，返回空对象 {}
 * - 如果 JSON 格式错误，返回空对象 {}
 *
 * @example
 * const data = getPrivacyData();
 * console.log(data.userId);
 */
export function getPrivacyData() {
    const privacyDataPath = path.join(paths.rootDataPath, "privacy.json");

    if (!fs.existsSync(privacyDataPath)) {
        logger.warn("privacy.json 不存在");
        return {}; // 建议返回空对象，而不是 undefined
    }

    try {
        const jsonStr = fs.readFileSync(privacyDataPath, "utf8");
        return JSON.parse(jsonStr); // 转成对象
    } catch (err) {
        logger.error("privacy.json 格式错误:", err);
        return {}; // 返回空对象，避免调用方报错
    }
}
