import { rootPath, cfgdata, dataPath, searchWiki, loadData, pluginPath } from "../tools/index.js"
import OpenAI from "openai"
import path from 'path'
import fs from 'fs/promises';
import YAML from 'yaml'

const ysurl = path.join(pluginPath, 'data', '罐头.txt')
const messageUsers = {};
const messageGroups = {};
let ys

let api = {}

try {
    const a = await fs.readFile(path.join(rootPath, 'resources', 'Syuan_plugin', 'secret.yaml'), 'utf8');
    api = YAML.parse(a);
} catch (err) {
    logger.error('读取文件失败:', err);
}

const API_KEY = api.chat_api_key
const API_URL = api.yuan_api_url
export class ai extends plugin {
    constructor() {
        super({
            name: '[Syuan-Plugin]ai',
            dsc: 'ai服务',
            event: 'message.group',
            priority: 50,
            rule: [{
                reg: '^(罐头|小罐头)(.*)',
                fnc: 'chat'
            }]
        })
    }

    async chat(e) {
        if (String(e.user_id) === `2239841632`) return

        try {
            ys = await fs.readFile(ysurl, 'utf8'); // 不要传回调
        } catch (err) {
            logger.error('读取文件失败:', err);
            ys = "你是罐头，你是一只会喵喵叫的猫娘。你每句话都有一个喵字结尾"; // 防止出错
        }


        let message = {
            role: "user",
            content: `用户名:${e.sender.nickname}，userid:${e.user_id} 说：${e.msg}`
        }
        let messages

        try {
            messages = messageGroups[e.group_id]
            if (!messages) {
                messages = messageGroups[e.group_id] = {
                    system: [{
                        role: "system",
                        content: `${ys}`
                    }],
                    chat: []
                }
            }
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        ...messages.system,
                        ...messages.chat,
                        message
                    ]
                })
            });

            const data = await response.json();
            e.reply(data.choices[0].message.content)
            messages.chat.push(message)
            messages.chat.push(data.choices[0].message)

            if (messages.chat.length > 20) {
                messages.chat = messages.chat.slice(-20)
            }
        } catch (err) {
            logger.error("Error calling API:", err);
        }




    }

    async chatAt(e) {
        if (e.message.filter(msg => msg.type === 'at').every(({ qq }) => qq != e.self_id)) return
        try {
            ys = await fs.readFile(ysurl, 'utf8'); // 不要传回调
        } catch (err) {
            logger.error('读取文件失败:', err);
            ys = "你是罐头，你是一只会喵喵叫的猫娘。你每句话都有一个喵字结尾"; // 防止出错
        }


        let message = {
            role: "user",
            content: `用户名:${e.sender.nickname}，userid:${e.user_id} 说：${e.msg}`
        }
        let messages

        try {
            messages = messageGroups[e.group_id]
            if (!messages) {
                messages = messageGroups[e.group_id] = {
                    system: [{
                        role: "system",
                        content: `${ys}`
                    }],
                    chat: []
                }
            }
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        ...messages.system,
                        ...messages.chat,
                        message
                    ]
                })
            });

            const data = await response.json();
            e.reply(data.choices[0].message.content)
            messages.chat.push(message)
            messages.chat.push(data.choices[0].message)

            if (messages.chat.length > 20) {
                messages.chat = messages.chat.slice(-20)
            }
        } catch (err) {
            logger.error("Error calling API:", err);
        }
    }

}



