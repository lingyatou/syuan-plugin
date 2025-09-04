import NapCatAPI from "../tools/napcat-http.js"
import { NAPCAT_HTTP_223, NAPCAT_HTTP_304, sleep, rootPath } from "../tools/index.js"

import axios from "axios";
import fs from 'fs'
import path from 'path'
function which(uid) {
    if (String(uid) === "2239841632") {
        return NAPCAT_HTTP_223
    } else {
        return NAPCAT_HTTP_304
    }
}



export class poke_to_2YM extends plugin {
    constructor() {
        super({
            name: '戳一戳表情包回复（Syuan）',
            dsc: '当戳账号3999084287时发送表情包',
            event: 'notice.group.poke',
            priority: 1
        })
    }


    async accept(e) {
        // 仅处理戳账号3999084287的情况
        if (e.target_id != 3999084287) return false

        // 表情包目录：resources/Syuan_plugin/
        // const emojiDir = path.join(rootPath, 'resources/Syuan_plugin')
        // const files = fs.readdirSync(emojiDir).filter(file => /\.(jpg|png|gif)$/i.test(file))
        // if (files.length === 0) {
        //     logger.warn('[SyuanPokeReply] 2毛目录为空')
        //     return false
        // }

        // // 随机选择一张图片
        // const randFile = files[Math.floor(Math.random() * files.length)]
        // const imgPath = path.join(emojiDir, randFile)

        const result = await getRandomFileUrl("the-second-feathers", "emoji-gallery")
        const data = {
            group_id: e.group_id,  // 替换成目标群号
            message: [
                {
                    type: "image",
                    data: {
                        file: result.rawUrl,
                        summary: "好戳！戳牢羽",
                        sub_type: "1"
                    }
                }
            ]
        }
        await NapCatAPI.sendImage(which(e.self_id), data)
        sleep(1000)
        return true
    }
}



/**
 * 从指定 Gitee 仓库里随机获取一个文件的路径和访问 URL
 *
 * @async
 * @function getRandomFileUrl
 * @param {string} owner - 仓库拥有者（用户名或组织名）
 * @param {string} repo - 仓库名称
 * @param {string} [branch="master"] - 分支名（默认 master，可改成 main 或其他分支）
 * @returns {Promise<{
 *   pageUrl: string,     // 文件在 Gitee 上的网页 URL
 *   rawUrl: string       // 文件的原始内容 URL
 * } | null>} - 成功时返回对象，失败时返回 null
 *
 * @example
 * const result = await getRandomFileUrl("oschina", "git-osc");
 * if (result) {
 *   console.log("随机文件:", result.randomFile);
 *   console.log("网页 URL:", result.pageUrl);
 *   console.log("Raw  URL:", result.rawUrl);
 * }
 */
async function getRandomFileUrl(owner, repo, branch = "master") {
    try {
        // 调用 Gitee API 获取文件树
        const res = await axios.get(
            `https://gitee.com/api/v5/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                },
            }
        );

        const files = res.data.tree
            .filter((item) => item.type === "blob") // 只取文件
            .map((item) => item.path);

        if (files.length === 0) {
            logger.error("[Syuan-Plugin]2YM仓库未找到文件");
            e.reply("[Syuan-Plugin]2YM仓库未找到文件")
        }

        // 随机选一个文件
        const randomFile = files[Math.floor(Math.random() * files.length)];

        // 拼接 URL
        const pageUrl = `https://gitee.com/${owner}/${repo}/blob/${branch}/${randomFile}`;
        const rawUrl = `https://gitee.com/${owner}/${repo}/raw/${branch}/${randomFile}`;

        return { pageUrl, rawUrl };
    } catch (err) {
        logger.error("获取文件失败:", err.message);
        return null;
    }
}
