import TurndownService from 'turndown'
import axios from 'axios'

// 初始化 Turndown 实例
const turndownService = new TurndownService({
    headingStyle: 'atx', // 使用 # 格式的标题
    codeBlockStyle: 'fenced' // 使用 ``` 格式的代码块
})

export class MarkdownifyPlugin extends plugin {
    constructor() {
        super({
            name: 'Markdownify',
            dsc: '将网页内容转换为Markdown',
            event: 'message',
            priority: 5000,
            rule: [
                {
                    reg: '^#转md\\s*(http[s]?://.*)$', // 匹配 #转markdown [URL]
                    fnc: 'webToMarkdown'
                }
            ]
        })
    }

    async webToMarkdown(e) {
        // 1. 获取 URL (e.msg 是用户消息，reg 是正则匹配结果)
        const match = e.msg.match(/^#转md\s*(http[s]?:\/\/.*)$/i)
        if (!match || !match[1]) {
            e.reply('请提供一个有效的网址。格式：#转markdown [URL]')
            return false
        }
        const url = match[1]

        e.reply(`正在转换网页内容：${url}，请稍候...`)

        try {
            // 2. 抓取网页内容
            const response = await axios.get(url, {
                // 模拟浏览器头，避免被反爬
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            })

            const html = response.data

            // 3. 转换 HTML 为 Markdown
            const markdown = turndownService.turndown(html)

            // 4. 限制输出长度（防止刷屏）
            const MAX_LENGTH = 1500
            let output = markdown.trim()

            if (output.length > MAX_LENGTH) {
                output = output.substring(0, MAX_LENGTH) + '\n\n...[内容过长，已截断，请自行访问原网页]...'
            }

            // 5. 发送 Markdown 结果
            // 注意：QQ/微信消息不支持原生 Markdown，需要以文本形式发送
            await e.reply([`转换结果 (${url}):\n`, output])

        } catch (error) {
            logger.error(`Markdownify 转换失败: ${error.message}`)
            e.reply(`转换网页 ${url} 失败，可能是网址无效或服务器拒绝访问。`)
        }
    }
}