/**
 * 插件名称: ContactPlugin (联系和回复主人功能)
 * 依赖: Yunzai-Bot 框架环境，全局 Bot 实例
 * 作者: Gemini (根据用户需求整合)
 * 描述: 实现用户向主人发送私信，以及主人回复用户的私信功能。
 */

// 确保在 Yunzai-Bot 环境中能访问到全局变量
// 实际使用时，如果插件放在 plugin 目录下，通常只需 extends plugin
// 如果需要 logger 和 Bot，请确保它们已被全局定义
// import plugin from '../../lib/plugins/plugin.js';

export class oi_master extends plugin {
    constructor() {
        super({
            name: "oi_master",
            dsc: "联系主人与回复用户",
            event: "message", // 监听所有消息类型 (群聊和私聊)
            priority: 100,
            rule: [
                {
                    reg: "^#?联系主人.+$",
                    fnc: "contactMaster",
                    permission: "all" // 允许所有用户使用
                },
                {
                    reg: "^#?回复\\s*\\d+.+$",
                    fnc: "replyUser",
                    permission: "master" // 只有主人能使用
                }
            ],
        });

        // 确保 Bot 实例可用
        if (!this.Bot) {
            this.Bot = global.Bot;
        }
    }

    /**
     * 【用户功能】
     * 命令: #联系主人 [内容]
     * 作用: 将用户消息转发给 Bot 主人。
     */
    async contactMaster(e) {
        // 提取要转发的内容
        let replyMsg = e.msg.replace(/^#?联系主人/g, '').trim();

        // 检查内容是否为空（如果 reg 是 ^#?联系主人.+$，通常不会为空）
        if (!replyMsg) {
            await e.reply(`请在“#联系主人”后面加上您要说的话。`);
            return true;
        }

        // 1. 获取主人的 QQ 号
        const masterId = this.Bot?.config?.master?.[0];

        if (!masterId) {
            await e.reply("Bot 未设置主人ID，无法联系。");
            logger.error("[syuan-plugin] 无法获取 Bot 主人ID，请检查配置。");
            return true;
        }

        // 2. 构造要转发的消息（包含发送者信息）
        let senderInfo = '';
        if (e.isGroup) {
            // 在群里发送
            senderInfo = `【群聊消息】群号：${e.group_id}，用户：${e.sender.nickname} (${e.user_id}) 发来消息：\n`;
        } else {
            // 在私聊发送
            senderInfo = `【私聊消息】用户：${e.sender.nickname} (${e.user_id}) 发来消息：\n`;
        }

        // 3. 尝试私聊联系主人
        try {
            const master = this.Bot.pickUser(masterId);

            // 完整消息
            const finalMessage = [
                senderInfo,
                `内容: ${replyMsg}`,
                // 提示主人如何回复
                `\n------\n如需回复，请使用 #回复${e.user_id} [内容]`
            ];

            // 发送给主人
            await master.sendMsg(finalMessage.join(''));

            // 4. 回复用户
            await e.reply(`您的消息已成功转发给主人：${masterId}，请耐心等待回复。`);

        } catch (error) {
            logger.error(`[ContactPlugin] 转发消息给主人 ${masterId} 失败: ${error}`);
            await e.reply("消息转发失败，请稍后再试。");
        }

        return true;
    }

    /**
     * 【主人功能】
     * 命令: #回复[QQ号] [内容]
     * 作用: 将主人消息私聊回复给目标用户。
     */
    async replyUser(e) {
        if (!e.isMaster) {
            // 规则已限制权限，但保险起见再判断一次
            return false;
        }

        // 1. 解析目标 QQ 和回复内容
        // 正则: ^#?回复\s*(\d+)(.+)$
        const match = e.msg.match(/^#?回复\s*(\d+)(.+)$/);
        if (!match) {
            await e.reply("命令格式错误，请使用：#回复[目标QQ号] [内容]");
            return true;
        }

        const targetQQ = parseInt(match[1].trim(), 10);
        const replyContent = match[2].trim();

        if (isNaN(targetQQ) || targetQQ < 10000 || !replyContent) {
            await e.reply("目标QQ号或回复内容无效，请检查格式。");
            return true;
        }

        // 2. 尝试私聊发送给目标用户
        try {
            const targetUser = this.Bot.pickUser(targetQQ);

            // 构造回复消息
            const finalMessage = `【主人回复您】:\n${replyContent}`;

            // 发送给目标用户
            await targetUser.sendMsg(finalMessage);

            // 3. 回复主人
            await e.reply(`成功将消息回复给用户：${targetQQ}。`);

        } catch (error) {
            logger.error(`[ContactPlugin] 回复用户 ${targetQQ} 失败: ${error}`);
            await e.reply(`回复用户 ${targetQQ} 失败，可能用户不在 Bot 的好友列表或 Bot 无法私聊该用户。`);
        }

        return true;
    }
}
