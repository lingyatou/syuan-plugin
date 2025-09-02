import fs from 'fs'
import path from 'path'
import { pluginPath, dataPath, cfgdata, isMaster } from '../tools/index.js'
import YAML from 'yaml'

// 加载配置数据
const cfgData = cfgdata.loadCfg()
// 构建欢迎词文件路径
const filePath = path.join(dataPath, 'welcome.json')
let groupId;

export class welcome extends plugin {
    constructor() {
        super({
            name: '[Syuan-Plugin]欢迎',
            dsc: '欢迎词相关',
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
                },
                {
                    reg: '^#syuan帮助',
                    fnc: 'getHelp'
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
        // 检查是否为主人 - 需要根据实际情况调整权限验证
        // if (!cfg.masterQQ.includes(e.user_id)) {
        //     e.reply("只有主人能够操作哦")
        //     return false
        // }
        // 判断是否在允许列表中
        if (e.user_id != 2331329306) {
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
        if (e.user_id != 2331329306) {
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
            await e.reply('❌读取欢迎词配置失败。')
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


    async getHelp(e) {
        // 读取 yaml 文件
        const yamlPath = path.join(pluginPath, 'resources', 'help', 'help.yaml')
        if (!fs.existsSync(yamlPath)) {
            return e.reply("❌[Syuan-plugin] 找不到 帮助配置 文件");
        }

        const yamlStr = fs.readFileSync(yamlPath, "utf8");
        const helpData = YAML.parse(yamlStr);

        if (!helpData || !helpData.helpList) {
            return e.reply("❌[Syuan-plugin] 帮助配置 文件 格式错误或内容为空");
        }

        // 构造转发消息节点
        let forwardMsgs = [];
        for (let group of helpData.helpList) {
            let header = `📖【${group.group}】`;
            if (group.desc) header += `\n${group.desc}`;
            forwardMsgs.push({
                message: header,
                nickname: Bot.nickname,
                user_id: Bot.uin,
            });

            for (let cmd of group.list) {
                let msg = `${cmd.title}\n✅意义：${cmd.desc || ""}`;
                forwardMsgs.push({
                    message: msg,
                    nickname: Bot.nickname,
                    user_id: Bot.uin,
                });
            }
        }

        // 发送转发消息
        if (e.isGroup) {
            await e.reply(await e.group.makeForwardMsg(forwardMsgs));
        } else {
            await e.reply(await e.friend.makeForwardMsg(forwardMsgs));
        }
        return true;
    }

}
function isAllow(e) {
    if (cfgData.denylist && cfgData.denylist.includes(e.group_id)) {
        return false
    }
    if (cfgData.allowlist && cfgData.allowlist.length > 0) {
        return cfgData.allowlist.includes(e.group_id)
    }
    return true // 默认允许
}