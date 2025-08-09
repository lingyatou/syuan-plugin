import fs from 'fs'
import path from 'path'
import { rootPath, dataPath, cfgdata } from '../tools/index.js'
const cfgPath = path.join(rootPath, 'lib/config/config.js')

const cfg = await import(cfgPath)
const cfgdata1 = cfgdata.loadCfg()
// 构建欢迎词文件路径
const filePath = path.join(dataPath, 'welcome.json')
let groupId;

export class WwCheck extends plugin {
    constructor() {
        super({
            name: 'Syuan工具包',
            dsc: 'tools',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: '^#插件库$',
                    fnc: 'sendPluginsUrl'
                },
                {
                    reg: '^#设置群欢迎词$',
                    fnc: 'setGroupWelcome'
                },
                {
                    reg: '^#群欢迎词',
                    fnc: 'getGroupWelcome'
                }
            ]
        })
    }

    async sendPluginsUrl(e) {
        const YunzaiUrl = 'https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index/tree/main'
        await e.reply('Yunzai插件库(本体)\n' + YunzaiUrl)
        return true
    }

    async setGroupWelcome(e) {
        if (!cfg.masterQQ.includes(e.user_id)) {
            e.reply("只有主人能够操作哦")
            return false
        }
        // 判断是否在允许列表中
        if (!isAllow(e)) {
            return false
        }
        const match = this.e.msg.match(/^#设置群欢迎词(\d+)$/)
        if (!match) {
            groupId = e.group_id
        } else {
            groupId = match[1]
        }
        // 判断 groupId 是否为纯数字
        if (!/^[0-9]+$/.test(groupId)) {
            await this.e.reply('群号格式不正确，请输入纯数字群号。')
            return false
        }
        this.setContext('receiveWelcomeText')
        await this.e.reply(`请发送群 ${groupId} 的欢迎词内容（60秒内且只能是文字）：`)
        return true
    }

    async receiveWelcomeText() {
        this.finish('receiveWelcomeText')
        const welcomeText = this.e.raw_message.trim()

        if (!welcomeText) {
            await this.e.reply('欢迎词不能为空，请重新发送命令。')
            return true
        }


        let data = {}

        // 如果文件不存在，先创建空文件
        if (!fs.existsSync(filePath)) {
            try {
                fs.mkdirSync(path.dirname(filePath), { recursive: true })
                fs.writeFileSync(filePath, '{}', 'utf-8')
            } catch (err) {
                logger.error('创建欢迎词文件失败：', err)
                await this.e.reply('创建欢迎词文件失败，请检查权限。')
                return true
            }
        }

        if (fs.existsSync(filePath)) {
            try {
                data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            } catch (err) {
                logger.error('读取欢迎词配置失败：', err)
            }
        }

        // 设置欢迎词
        data[groupId] = welcomeText

        try {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
            await this.e.reply(`欢迎词设置成功！\n群号：${groupId}\n内容：${welcomeText}`)
        } catch (err) {
            logger.error('写入欢迎词失败：', err)
            await this.e.reply('写入文件失败，请检查权限。')
        }

        return true
    }

    async getGroupWelcome(e) {
        if (!isAllow(e)) {
            return false
        }
        if (!fs.existsSync(filePath)) {
            await e.reply('还没有设置任何群欢迎词。')
            return true
        }
        let data = {}
        try {
            data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        } catch (err) {
            logger.error('读取欢迎词配置失败：', err)
            await e.reply('读取欢迎词配置失败。')
            return true
        }
        const keys = Object.keys(data)
        if (keys.length === 0) {
            await e.reply('还没有设置任何群欢迎词。')
            return true
        }
        let msg = keys.map(id => `群号：${id}\n欢迎词：${data[id]}`).join('\n-------------------\n')
        await e.reply(msg)
        return true
    }
}
function isAllow(e) {
    if (cfgdata1.denylist.includes(e.group_id)) {
        return false
    }
    if (!cfgdata1.denylist.includes(e.group_id)) {
        return true
    }
    return false
}