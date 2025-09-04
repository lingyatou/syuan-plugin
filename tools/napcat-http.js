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
    },

    /**
 * 给指定 QQ 用户发送“戳一戳”
 * 
 * @async
 * @function sendPoke
 * @param {string} url - NapCat API 地址，例如 "http://127.0.0.1:3000"
 * @param {string|number} groupid - 来源群号
 * @param {string|number} userid - 被戳的 QQ
 * @returns {Promise<Object>} NapCat API 返回的数据对象
 * @throws {Error} 如果请求失败会抛出异常
 * 
 * @example
 * await sendPoke("http://127.0.0.1:3000", 790514019, 1284508970);
 */
    async sendPoke(url, groupid, userid) {
        try {
            const data = {
                user_id: userid,
                group_id: groupid
            };

            const response = await axios.post(`${url}/send_poke`, data, {
                headers: { 'Content-Type': 'application/json' }
            });

            return response.data;
        } catch (error) {
            logger.error(`[Syuan-Plugin] 为 ${userid} 戳失败: ${error}`);
            throw error;
        }
    },


    /**
 * 发送群图片消息
 *
 * 使用 Napcat API 的 `/send_group_msg` 接口向指定群发送一条图片消息。
 *
 * @async
 * @function send_group_msg
 * @param {string} url - Napcat API 地址，例如 "http://127.0.0.1:3000"
 * @param {string|number} g - 目标群号
 * @returns {Promise<Object>} Napcat API 返回的响应对象
 * @throws {Error} 当请求失败时抛出异常
 *
 * @example
 * const res = await send_group_msg("http://127.0.0.1:3000", 123456789);
 * console.log(res); // { status: "ok", retcode: 0, data: { message_id: 123456 } }
 */
    async send_group_msg(url, g) {
        try {
            const data = {
                group_id: g,  // 替换成目标群号
                message: [
                    {
                        type: "image",
                        data: {
                            file: "https://gxh.vip.qq.com/club/item/parcel/item/8e/8e362b858c6a40870486339806c07c82/raw300.gif",
                            summary: "[被踢]",
                            key: "97187ef7d4e9899c",
                            emoji_id: "8e362b858c6a40870486339806c07c82",
                            emoji_package_id: "243040"
                        }
                    }
                ]
            };


            const response = await axios.post(url + `/send_group_msg`, data, {
                headers: { 'Content-Type': 'application/json' }
            });

            return response.data;
        } catch (error) {
            logger.error(`[Syuan-Plugin] 踢出失败: ${error}`);
            throw error;
        }
    }



};

// 统一导出
export default NapCatAPI;
