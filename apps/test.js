import NapCatAPI from "../tools/napcat-http.js"
import { NAPCAT_HTTP_223, NAPCAT_HTTP_304, sleep, rootPath, loadData } from "../tools/index.js"

import fs from 'fs'
import path from 'path'
function which(uid) {
    if (String(uid) === "2239841632") {
        return NAPCAT_HTTP_223
    } else {
        return NAPCAT_HTTP_304
    }
}



export class test extends plugin {
    // constructor() {
    //     super({
    //         name: '戳一戳表情包回复（Syuan）',
    //         dsc: '当戳账号3999084287时发送表情包',
    //         event: 'notice.group.poke',
    //         priority: 1
    //     })
    // }
    constructor() {
        super({
            name: '[Syuan-Plugin]点赞',
            dsc: '可以定时点赞',
            event: 'message',
            priority: 500,
            rule: [
                {
                    reg: '#测试',
                    fnc: 'cs'
                }
            ]
        })
    }

    async cs(e) {
        if (e.user_id != 2331329306) {
            return false
        }
        e.reply("开始写入数据到向量数据库")
        await loadData(e);
        return true
    }
}
