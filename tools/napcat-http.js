/*
* 用于封装 NapCat 相关函数
*/
import axios from 'axios';

const NapCatAPI = {
    /**
     * 指定用户发送私聊消息（支持临时会话）
     * @param {string} url - NapCat API 地址，例如 "http://127.0.0.1:3000"
     * @param {string|number} userId - 收消息的 QQ
     * @param {string|number} groupId - 来源群号（可选，用于临时会话）
     * @param {string} text - 消息内容
     * @returns {Promise<object>} NapCat 返回的数据
     */
    async sendPrivateMsg(url, userId, groupId, text) {
        try {
            const data = {
                user_id: String(userId),
                group_id: String(groupId),
                message: [
                    {
                        type: "text",
                        data: { text }
                    }
                ]
            };

            const response = await axios.post(`${url}/send_private_msg`, data, {
                headers: { "Content-Type": "application/json" }
            });

            return response.data;
        } catch (error) {
            logger.error(`[Syuan-Plugin] 发送给 ${userId} 失败: ${error}`);
            throw error;
        }
    },

    /**
     * 给指定 QQ 用户点赞
     * 
     * @async
     * @param {string} url - NapCat API 地址，例如 "http://127.0.0.1:3000"
     * @param {string|number} uid - 要点赞的 QQ 号
     * @param {number} times - 点赞次数
     * @returns {Promise<Object>} 返回 NapCat 接口响应数据
     * @throws {Error} 如果请求失败会抛出异常
     * 
     * @example
     * await NapCatAPI.thumbsUp("http://127.0.0.1:3000", 2331329306, 5);
     */
    async thumbsUp(url, uid, times) {
        try {
            const data = {
                user_id: uid,
                times: times
            };

            const response = await axios.post(`${url}/send_like`, data, {
                headers: { 'Content-Type': 'application/json' }
            });

            return response.data;
        } catch (error) {
            logger.error(`[Syuan-Plugin] 为 ${uid} 点赞失败: ${error}`);
            throw error;
        }
    }






};

// 统一导出
export default NapCatAPI;
