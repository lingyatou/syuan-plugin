/*
* 点赞功能
* NAPCAT_HTTP_223和NAPCAT_HTTP_304是url常量在tools/constant.js
*/
import { pluginPath, NAPCAT_HTTP_223, NAPCAT_HTTP_304, sleep } from '../tools/index.js'
import NapCatAPI from '../tools/napcat-http.js'
import path from 'path'
import fs from 'fs';
import schedule from 'node-schedule';

// 读取点赞对象
const thumbsUpMeData = path.join(pluginPath, 'data/thumbsUpMe.json')
let thumbsUpMelist = {};
try {
    const raw = fs.readFileSync(thumbsUpMeData, 'utf-8');
    thumbsUpMelist = JSON.parse(raw);
} catch (err) {
    logger.error('读取或解析 thumbsUpMe.json 失败:', err);
}

/** 点赞次数，非会员10次，会员20次 */
const thumbsUpMe_sum = 10

const say = time() + "已给你点赞" + thumbsUpMe_sum + "次哦"

function time() {
    const now = new Date();
    const hour = now.getHours(); // 0~23 的数字
    if (0 <= hour <= 5) {
        return "碗尚豪小猫娘"
    }
    else if (5 < hour <= 8) {
        return "枣尚豪小猫娘"
    } else if (8 < hour <= 11) {
        return "尚唔豪小猫娘"
    } else if (11 < hour <= 14) {
        return "中唔豪小猫娘"
    } else if (14 < hour <= 17) {
        return "虾呜豪小猫娘"
    } else if (17 < hour <= 23) {
        return "碗尚豪小猫娘"
    }

}

export class Good extends plugin {
    constructor() {
        super({
            name: '猪鼻',
            dsc: '铸币',
            event: 'message',
            priority: 500,
            rule: [
                {
                    reg: '#赞我',
                    fnc: 'thumbsUpMe'
                },
                {
                    reg: '#测试',
                    fnc: 'test'
                }
            ]
        })
    }

    async thumbsUpMe(e) {
        Bot.pickFriend(this.e.user_id).thumbUp(thumbsUpMe_sum)
        e.reply([
            segment.at(e.user_id),
            say
        ])
        return true
    }

    async test() {
        for (let qq of Object.keys(thumbsUpMelist)) {
            await NapCatAPI.thumbsUp(NAPCAT_HTTP_223, qq, thumbsUpMe_sum)
            await sleep(2000)
            await NapCatAPI.thumbsUp(NAPCAT_HTTP_304, qq, thumbsUpMe_sum)
            logger.mark(`[Syuan-Plugin][自动点赞] 已给QQ${qq}点赞${thumbsUpMe_sum}次`)
            if (thumbsUpMelist[qq].push) {
                NapCatAPI.sendPrivateMsg(NAPCAT_HTTP_223, qq, thumbsUpMelist[qq].group, say)
                await sleep(2000)
                NapCatAPI.sendPrivateMsg(NAPCAT_HTTP_304, qq, thumbsUpMelist[qq].group, say)
                await sleep(2000)
            }
            await sleep(8000) // 等8秒在下一个
        }
    }


}

/** 主动触发-点赞
 * 点赞开始时间
 * cron表达式定义推送时间 (秒 分 时 日 月 星期) 
 * 可使用此网站辅助生成：https://www.matools.com/cron/
 * 注意，每天都需要触发，因此日及以上选通配符或不指定
 * 只选小时就可以了
*/
schedule.scheduleJob('00 00 10 * * *', async () => {
    for (let qq of Object.keys(thumbsUpMelist)) {
        await thumbsUp(NAPCAT_HTTP_223, qq, thumbsUpMe_sum)
        await sleep(2000)
        await thumbsUp(NAPCAT_HTTP_304, qq, thumbsUpMe_sum)
        logger.mark(`[Syuan-Plugin][自动点赞] 已给QQ${qq}点赞${thumbsUpMe_sum}次`)
        if (thumbsUpMelist[qq].push) {
            NapCatAPI.sendPrivateMsg(NAPCAT_HTTP_223, qq, thumbsUpMelist[qq].group, say)
            await sleep(2000)
            NapCatAPI.sendPrivateMsg(NAPCAT_HTTP_304, qq, thumbsUpMelist[qq].group, say)
            await sleep(2000)
        }
        await sleep(8000) // 等8秒在下一个
    }
})
