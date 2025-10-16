
import Core from '@alicloud/pop-core'
import axios from 'axios'
import { cfgdata } from '../tools/index.js'
const config = cfgdata.loadCfg()
// ====== 基础配置 ======
const OWNER_QQ = 123456789 // 主人QQ号
const ALLOWED_USERS = [123456789, 987654321] // 可用命令的QQ
const REGION_ID = config.aliyun.regionId // 地域
const INSTANCE_ID = config.aliyun.instanceId // ECS实例ID
const WEBUI_PORT = config.aliyun.webuiPort // WebUI端口（比如Stable Diffusion WebUI）

// ====== 阿里云 SDK 客户端 ======
const client = new Core({
    accessKeyId: config.aliyun.accessKeyId, // '你的AccessKeyId',
    accessKeySecret: config.aliyun.accessKeySecret, // '你的AccessKeySecret',
    endpoint: 'https://ecs.aliyuncs.com',
    apiVersion: '2014-05-26'
})

// ====== 工具函数 ======
/** 查询实例状态 */
async function getInstanceInfo() {
    const res = await client.request('DescribeInstances', {
        RegionId: REGION_ID,
        InstanceIds: JSON.stringify([INSTANCE_ID])
    }, { method: 'POST' })

    const instance = res?.Instances?.Instance?.[0]
    return instance || null
}

const stateMap = {
    'Running': '🟢 运行中',
    'Stopped': '🔴 已停止',
    'Starting': '🟡 启动中',
    'Stopping': '🟠 停止中'
}

/** 检查 WebUI 是否正常响应 */
async function checkWebUI(publicIp) {
    if (!publicIp) return '⚪ 未检测到公网IP，无法检测 WebUI。'
    try {
        const url = `http://${publicIp}:${WEBUI_PORT}`
        const res = await axios.get(url, { timeout: 5000 })
        if (res.status === 200) {
            return `✅ WebUI已就绪`
        } else {
            return `⚠️ WebUI响应异常，状态码：${res.status}`
        }
    } catch (err) {
        return `❌ WebUI未响应`
    }
}

// ====== 主插件 ======
export class aliyun extends plugin {
    constructor() {
        super({
            name: '阿里云实例控制',
            dsc: '通过命令控制阿里云ECS实例的启动、停止与状态检测',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: /^#?实例(\d+)?$/,
                    fnc: 'startInstance'
                },
                {
                    reg: /^#?(实例状态|状态查询)$/,
                    fnc: 'checkStatus'
                },
                {
                    reg: /^#?关闭实例$/,
                    fnc: 'stopInstance'
                }
            ]
        })
    }

    /** 启动实例 */
    async startInstance(e) {
        if (!ALLOWED_USERS.includes(e.user_id)) {
            await e.reply('🚫 你没有权限使用此命令。')
            return
        }

        const match = e.msg.match(/^#?实例(\d+)?$/)
        const hours = match && match[1] ? parseInt(match[1]) : 1
        const ms = hours * 60 * 60 * 1000

        try {
            const instance = await getInstanceInfo()
            const currentStatus = instance?.Status

            if (currentStatus === 'Running' || currentStatus === 'Starting') {
                await e.reply(`⚠️ 实例当前状态为「${stateMap[currentStatus]}」，无需再次启动。`)
                return
            }

            await e.reply(`🌀 正在启动实例（预计运行 ${hours} 小时）...`)
            await client.request('StartInstance', {
                RegionId: REGION_ID,
                InstanceId: INSTANCE_ID
            }, { method: 'POST' })

            await e.reply(`✅ 实例启动成功！将在 ${hours} 小时后自动关闭。`)

            // 自动关闭
            setTimeout(async () => {
                try {
                    await client.request('StopInstance', {
                        RegionId: REGION_ID,
                        InstanceId: INSTANCE_ID,
                        ForceStop: true
                    }, { method: 'POST' })
                    await e.bot.sendPrivateMsg(OWNER_QQ, `💡 实例已自动关闭（运行了 ${hours} 小时）。`)
                } catch (err) {
                    await e.bot.sendPrivateMsg(OWNER_QQ, `⚠️ 自动关闭实例失败：${err.message}`)
                }
            }, ms)

            // 通知主人
            if (e.user_id !== OWNER_QQ) {
                await e.bot.sendPrivateMsg(
                    OWNER_QQ,
                    `⚙️ 用户 ${e.nickname || e.user_id} 启动了阿里云实例（运行 ${hours} 小时）。`
                )
            }

        } catch (err) {
            console.error('实例启动失败：', err)
            await e.reply(`❌ 启动失败：${err.data?.Message || err.message}`)
        }
    }

    /** 查询实例状态（含 WebUI 检测） */
    async checkStatus(e) {
        if (!ALLOWED_USERS.includes(e.user_id)) {
            await e.reply('🚫 你没有权限使用此命令。')
            return
        }

        try {
            const instance = await getInstanceInfo()
            if (!instance) {
                await e.reply('⚠️ 未找到该实例信息。')
                return
            }

            const status = stateMap[instance.Status] || instance.Status
            const publicIp = instance.PublicIpAddress?.IpAddress?.[0]

            let msg = `📊 实例状态：${status}\n🕓 创建时间：${instance.CreationTime}\n🧩 实例类型：${instance.InstanceType}`

            // 仅在实例运行时检测 WebUI
            if (instance.Status === 'Running' && publicIp) {
                const uiStatus = await checkWebUI(publicIp)
                msg += `\n${uiStatus}`
            } else if (instance.Status === 'Running' && !publicIp) {
                msg += `\n⚪ 无公网IP，无法检测 WebUI`
            }

            await e.reply(msg)
        } catch (err) {
            console.error('状态查询失败：', err)
            await e.reply(`❌ 状态查询失败：${err.data?.Message || err.message}`)
        }
    }

    /** 手动关闭实例 */
    async stopInstance(e) {
        if (!ALLOWED_USERS.includes(e.user_id)) {
            await e.reply('🚫 你没有权限使用此命令。')
            return
        }

        try {
            const instance = await getInstanceInfo()
            const currentStatus = instance?.Status

            if (currentStatus === 'Stopped' || currentStatus === 'Stopping') {
                await e.reply(`⚠️ 实例当前状态为「${stateMap[currentStatus]}」，无需再次关闭。`)
                return
            }

            await e.reply('🛑 正在关闭实例...')
            await client.request('StopInstance', {
                RegionId: REGION_ID,
                InstanceId: INSTANCE_ID,
                ForceStop: true
            }, { method: 'POST' })

            await e.reply('✅ 实例已关闭。')
            if (e.user_id !== OWNER_QQ) {
                await e.bot.sendPrivateMsg(OWNER_QQ, `⚙️ 用户 ${e.nickname || e.user_id} 手动关闭了阿里云实例。`)
            }
        } catch (err) {
            console.error('关闭失败：', err)
            await e.reply(`❌ 关闭失败：${err.data?.Message || err.message}`)
        }
    }
}
