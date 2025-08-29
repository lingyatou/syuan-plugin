
import { rootPath } from '../tools/path.js'
import path from 'path'
const common = await import(path.join(rootPath, "lib/common/common.js"));

export class TestPlugin extends plugin {
    //别人的，放这里蹭一下路径定位
    constructor() {
        super({
            name: '猪鼻',
            dsc: '铸币',
            event: 'message',
            priority: 500,
            rule: [
                {
                    reg: '^6{1,6}$',
                    fnc: 'six'
                },
                {
                    reg: '哈气',
                    fnc: 'haqi'
                },
                {
                    reg: '小土豆|土豆雷|土豆地雷|i柯TV|i柯tv|iktv',
                    fnc: 'xtd'
                }
            ]
        });
    }

    async six(e) {
        let id = e.group_id || e.user_id
        if (redis.exists("gjc" + id)) {
            logger.mark(`关键词已触发`)
            return false;
        }
        (await common).sleep(1000);
        e.reply([
            segment.at(e.user_id),
            `宝宝你发这个6是什么意思啊?感觉你不太开心的样子，是我哪里做错了吗?我也不懂如果你有什么不开心的事可以和我讲的，宝宝我一直都在，不知道你为什么发这个6，我就感觉你很需要我的样子，宝宝说真的我好庆幸和你在一起，我的脾气性格你都很了解，和你在一起根本不用忌讳什么就是真真实实的做自己，你每次和我分享开心的日常的时候我又开心又难过，因为你开心，又因为我没在你身边陪你一起开心而难过，知道你很嘴硬但是有些不开心的事你不和我说和谁说，不和我说谁来安慰宝宝谁来给宝宝买好吃的让宝宝开心呢?在一起这么久了你不用担心什么的，有什么不开心的事就和我说我一直陪着宝宝呢`,
        ], true);
        await redis.setEX("gjc" + e.group_id, 86400, "1",)
        return true;
    }

    async haqi(e) {
        (await common).sleep(1000);
        try {
            e.reply([
                segment.at(e.user_id),
                segment.image(`${rootPath}/resources/img/fbhq.jpg`),
            ])
        } catch {
            e.reply('哈气失败，嘻嘻')
        }
        (await common).sleep(2000);
        return true
    }

    async xtd(e) {
        (await common).sleep(1000);
        try {
            e.reply([
                segment.at(e.user_id),
                `好好好`,
                segment.image(`${rootPath}/resources/img/xtd.jpg`),
            ])
        } catch {
            e.reply('╭(╯^╰)╮哼，这次放过你')
        }
        (await common).sleep(2000);
        return true
    }
}
