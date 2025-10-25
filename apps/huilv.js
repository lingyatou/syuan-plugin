import { cfgdata, dataPath, searchWiki, loadData } from "../tools/index.js"
import OpenAI from "openai"
import path from 'path'
import fs from 'fs'

let client
let messages = null
const config = cfgdata.loadCfg()
let ys = {}
let usrKnowlegde = false
let index = config.Chat.index || 1

const presetDir = path.join(dataPath, '预设')

// 自动读取 “预设” 文件夹下所有 txt 文件
function loadPresetList() {
    if (!fs.existsSync(presetDir)) {
        fs.mkdirSync(presetDir, { recursive: true })
    }

    const files = fs.readdirSync(presetDir)
    const presets = {}
    const presetFiles = {}

    let i = 1
    for (const file of files) {
        if (file.endsWith(".txt")) {
            const name = file.replace(".txt", "")
            presets[i] = name
            presetFiles[i] = `chat_history_${name}.json`
            i++
        }
    }

    return { presets, presetFiles }
}

// 初始化预设表
const { presets: presetNames, presetFiles } = loadPresetList()

export class gpt extends plugin {
    constructor() {
        super({
            name: '[Syuan-Plugin]al',
            dsc: 'ai服务',
            event: 'message',
            priority: 50,
            rule: [
                { reg: '^#al(.*)', fnc: 'chat' },
                { reg: '^#rm记录', fnc: 'rm' },
                { reg: '^#cz', fnc: '重载' },
                { reg: '^#(不)?知识', fnc: 'zsk' },
                { reg: '^#长度', fnc: '长度' },
                { reg: '^#切换(\\d+)?', fnc: '切换' },
                { reg: '^#预设列表$', fnc: 'list' } // ✅ 新增命令查看所有预设
            ]
        })
        this.task = {
            cron: '*/20 * * * * *',
            name: '定时保存聊天记录',
            fnc: () => update(),
            log: false
        }
    }

    async chat(e) {
        if (String(e.user_id) != '2331329306') return false
        if (!initChat(e)) return true

        if (!messages) {
            let file = path.join(dataPath, presetFiles[index])
            if (fs.existsSync(file)) {
                messages = JSON.parse(fs.readFileSync(file, 'utf8'))
            } else {
                messages = {
                    system: [{ role: "system", content: `${ys[index]}` }],
                    chat: []
                }
            }
        }

        const match = e.msg.match(/^#?al(.*)/)
        let message = { role: "user", content: `身份:不仅是你的老公，也是你的主人 说：${match[1]}` }

        let response = await client.chat.completions.create({
            model: config.Chat.model,
            messages: [
                ...messages.system,
                ...messages.chat,
                message
            ]
        })

        let originalRetMsg = response.choices[0].message.content
        e.reply(originalRetMsg)

        messages.chat.push(message)
        messages.chat.push(response.choices[0].message)

        if (messages.chat.length > 100) {
            messages.chat = messages.chat.slice(-100)
        }
    }

    async rm(e) {
        if (String(e.user_id) != '2331329306') return false
        messages = null
        let file = path.join(dataPath, presetFiles[index])
        if (fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
        return e.reply(`已清除 ${presetNames[index]} 的聊天记录`)
    }

    async 重载(e) {
        if (String(e.user_id) != '2331329306') return false
        await loadData(e)
    }

    async zsk(e) {
        if (String(e.user_id) != '2331329306') return false
        usrKnowlegde = !e.msg.includes('不')
        e.reply(`已${usrKnowlegde ? '开启' : '关闭'}知识库支持`)
    }

    async 长度(e) {
        if (String(e.user_id) != '2331329306') return false
        e.reply(messages?.chat?.length?.toString() || '0')
    }

    async 切换(e) {
        if (String(e.user_id) != '2331329306') return false
        const match = e.msg.match(/^#切换(\d+)?/)
        let newIndex = match[1] ? Number(match[1]) : index + 1

        const total = Object.keys(presetNames).length
        if (total === 0) return e.reply('⚠️ 没有找到任何预设文件，请先在 data/预设 目录中添加 .txt 文件')

        if (newIndex > total) newIndex = 1

        index = newIndex
        config.Chat.index = newIndex
        cfgdata.saveCfg(config)

        let file = path.join(dataPath, presetFiles[index])
        if (fs.existsSync(file)) {
            messages = JSON.parse(fs.readFileSync(file, 'utf8'))
        } else {
            messages = {
                system: [{ role: "system", content: `${ys[index]}` }],
                chat: []
            }
        }

        e.reply(`✅ 已切换到 ${presetNames[index]} 预设，并加载对应聊天记录`)
    }

    async list(e) {
        if (String(e.user_id) != '2331329306') return false
        let msg = '📘 当前可用预设列表：\n'
        for (const [id, name] of Object.entries(presetNames)) {
            msg += `${id}. ${name}${id == index ? '（当前）' : ''}\n`
        }
        e.reply(msg)
    }
}

function initChat(e) {
    if (String(e.user_id) != '2331329306') return false
    if (!client) {
        client = new OpenAI({
            baseURL: config.Chat.baseURL,
            apiKey: config.Chat.apiKey
        })
    }
    if (Object.keys(ys).length === 0) {
        try {
            for (const [id, name] of Object.entries(presetNames)) {
                const file = path.join(presetDir, `${name}.txt`)
                if (fs.existsSync(file)) {
                    ys[id] = fs.readFileSync(file, 'utf8')
                }
            }
        } catch (err) {
            logger.error('ys读取失败', err)
        }
    }
    return true
}

function update() {
    if (messages) {
        try {
            let file = path.join(dataPath, presetFiles[index])
            fs.writeFileSync(
                file,
                JSON.stringify(messages, null, 2),
                'utf8'
            )
        } catch (err) {
            logger.error('定时保存聊天记录失败:', err)
        }
    }
}
