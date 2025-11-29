

export class TailHook extends plugin {
  constructor() {
    super({
      name: 'Yunzai消息尾巴Hook',
      dsc: '拦截所有 e.reply / bot.sendMsg 自动加尾巴',
      event: 'message',
      priority: -99999,
      rule: []
    })

    this.patch()
  }

  patch() {
    const Bot = global.Bot
    if (!Bot) return

    if (Bot._tailPatched) {
      logger.log("[TailHook] 已加载，无需重复Patch")
      return
    }
    Bot._tailPatched = true

    // 兼容多账号
    const bots = Bot.uin ? [Bot] : Object.values(Bot)

    for (const bot of bots) {
      const _sendMsg = bot.sendMsg.bind(bot)

      bot.sendMsg = async function (data) {
        try {
          // 纯文本消息直接加尾巴
          if (typeof data.msg === "string") {
            data.msg += "\n—— 来自你的 Bot"
          }

          // 元素列表（数组），如 segment.at() 之类
          if (Array.isArray(data.msg)) {
            data.msg.push({
              type: "text",
              text: "\n—— 来自你的 Bot"
            })
          }
        } catch (err) {
          logger.log("[TailHook] 尾巴处理失败：", err)
        }

        return await _sendMsg(data)
      }
    }

    logger.log("【TailHook】成功 Hook 住 bot.sendMsg，所有 e.reply 消息已自动加尾巴")
  }
}
