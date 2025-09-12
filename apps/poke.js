import NapCatAPI from "../tools/napcat-http.js"
import { NAPCAT_HTTP_223, NAPCAT_HTTP_304, sleep, rootPath } from "../tools/index.js"

import axios from "axios";
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process';
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
            priority: 1,
            rule: [
                {
                    reg: '',
                    fnc: 'accept'
                }
            ]
        })
        this.task = {
            cron: '0 30 * * * *',
            name: '定时更新2YM的图片仓库',
            fnc: () => update(), // 指触发的函数
            log: true // 是否输出日志
        }
    }


    async accept(e) {
        // 仅处理戳账号3999084287的情况
        if (e.target_id != 3999084287) return false
        if (e.operator_id == e.user_id) return false

        // 表情包目录：data/Syuan-plugin/Yunzai_image/2YM
        const emojiDir = path.join(rootPath, 'data/Syuan-plugin/Yunzai_image/2YM')
        const files = fs.readdirSync(emojiDir).filter(file => /\.(jpg|png|gif)$/i.test(file))
        if (files.length === 0) {
            logger.warn('[SyuanPokeReply] 2毛目录为空')
            return false
        }

        // 随机选择一张图片
        const randFile = files[Math.floor(Math.random() * files.length)]
        const imgPath = path.join(emojiDir, randFile)

        const data = {
            group_id: e.group_id,  // 替换成目标群号
            message: [
                {
                    type: "image",
                    data: {
                        file: `file://${imgPath}`,
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


function update() {
    const targetPath = path.join(rootPath, 'data', 'Syuan-plugin', 'Yunzai_image');
    // 执行 git pull
    exec('git pull', { cwd: targetPath }, (error, stdout, stderr) => {
        if (error) {
            logger.error(`更新失败: ${error.message}`);
            return;
        }
        if (stderr) {
            logger.error(`Git 错误: ${stderr}`);
        }
        logger.info(`更新成功:\n${stdout}`);
    });
}
