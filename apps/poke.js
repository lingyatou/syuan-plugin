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

const urlsFile = path.join(rootPath, "data/Syuan-plugin/emoji_raw_urls.txt")


export class poke_to_2YM extends plugin {
    constructor() {
        super({
            name: '戳一戳表情包回复（Syuan）',
            dsc: '当戳账号3999084287时发送表情包',
            event: 'notice.group.poke',
            priority: 1
        })
        this.task = {
            cron: '0 30 * * * *',
            name: '定时请求2YM的图片仓库',
            fnc: () => saveAllImageRawUrls("the-second-feathers", "emoji-gallery", "master", urlsFile), // 指触发的函数
            log: true // 是否输出日志
        }
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

        const result = getRandomUrlFromFile()
        const data = {
            group_id: e.group_id,  // 替换成目标群号
            message: [
                {
                    type: "image",
                    data: {
                        file: result,
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
 * 获取 Gitee 仓库里所有图片文件的 raw URL，并写入本地文件
 *
 * @async
 * @function saveAllImageRawUrls
 * @param {string} owner - 仓库拥有者（用户名或组织名）
 * @param {string} repo - 仓库名称
 * @param {string} [branch="master"] - 分支名（默认 master）
 * @param {string} urlsFile - 输出文件路径
 * @returns {Promise<void>}
 *
 * @example
 * await saveAllImageRawUrls("the-second-feathers", "emoji-gallery", "master", "emoji_raw_urls.txt");
 */
async function saveAllImageRawUrls(owner, repo, branch = "master", urlsFile) {
    try {
        const res = await axios.get(
            `https://gitee.com/api/v5/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                },
            }
        );

        // 筛选图片文件
        const imageFiles = res.data.tree
            .filter((item) => item.type === "blob" && /\.(jpe?g|png|gif|bmp|webp)$/i.test(item.path))
            .map((item) => item.path);

        if (imageFiles.length === 0) {
            logger.error(`[Syuan-Plugin] ${repo} 仓库未找到图片文件`);
            return null;
        }

        // 拼接 raw URL 列表
        const rawUrls = imageFiles.map(
            (file) => `https://gitee.com/${owner}/${repo}/raw/${branch}/${file}`
        );

        // 写入文件
        fs.writeFileSync(urlsFile, rawUrls.join("\n"), "utf-8");
        logger.info(`[Syuan-Plugin] 已保存 ${rawUrls.length} 个图片文件 URL 到 ${urlsFile}`);
    } catch (err) {
        logger.error("[Syuan-Plugin] 获取文件失败:", err.message);
    }
}

/**
 * 从本地 raw URL 文件随机选一个 URL
 * @function getRandomUrlFromFile
 * @returns {string|null} - 随机选中的 URL，文件为空或不存在返回 null
 *
 * @example
 * const url = getRandomUrlFromFile();
 * console.log(url);
 */
function getRandomUrlFromFile() {
    try {
        if (!fs.existsSync(urlsFile)) {
            logger.error(`[Syuan-Plugin] 文件不存在: ${urlsFile}`);
            return null;
        }

        const lines = fs.readFileSync(urlsFile, "utf-8")
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length === 0) {
            logger.error(`[Syuan-Plugin] 文件为空: ${urlsFile}`);
            return null;
        }

        const randomIndex = Math.floor(Math.random() * lines.length);
        return lines[randomIndex];
    } catch (err) {
        logger.error("[Syuan-Plugin] 读取文件失败:", err.message);
        return null;
    }
}