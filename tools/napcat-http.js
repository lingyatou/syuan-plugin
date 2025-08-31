import axios from 'axios'

const napcatUrl = 'http://127.0.0.1:3000'

/**
 * 调用 Napcat API
 * @param {string} api - API 接口路径 (例如 "group_poke")
 * @param {Object} data - 提交的表单数据
 * @returns {Promise<Object>} - 返回 axios 的响应结果
 */
export async function callNapcat(api, data) {
    try {
        const res = await axios.post(`${napcatUrl}/${api}`, data)
        return
    } catch (err) {
        logger.error(`[Napcat API 调用失败] ${api}`, err.message)
        return
    }
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
