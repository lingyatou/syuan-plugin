
import { cfgdata } from '../tools/index.js'
import { Ecs20140526Client as ECSClient, DescribeInstancesRequest, StartInstanceRequest, StopInstanceRequest } from '@alicloud/ecs20140526'
import axios from 'axios'
const config = cfgdata.loadCfg()
// ====== 配置区 ======
const OWNER_QQ = 2331329306 // 主人QQ号
const ALLOWED_USERS = [2331329306] // 可用命令的QQ
const REGION_ID = config.aliyun.regionId // 地域
const INSTANCE_ID = config.aliyun.instanceId // ECS实例ID
const WEBUI_PORT = config.aliyun.webuiPort // WebUI端口（比如Stable Diffusion WebUI）
const REDIS_KEY = 'aliyun:ecs:auto_shutdown' // Redis 定时任务 Key

// ====== 初始化阿里云 ECS 客户端 ======
const client = new ECSClient({
    accessKeyId: '你的AccessKeyId',
    accessKeySecret: '你的AccessKeySecret',
    endpoint: `https://ecs.${REGION_ID}.aliyuncs.com`
})

// ====== 状态映射表 ======
const stateMap = {
    'Running': '🟢 运行中',
    'Stopped': '🔴 已停止',
    'Starting': '🟡 启动中',
    'Stopping': '🟠 停止中'
}

// ====== 工具函数 ======
/** 获取实例信息 */
async function getInstanceInfo() {
    const req = new DescribeInstancesRequest({ regionId: REGION_ID, instanceIds: JSON.stringify([INSTANCE_ID]) })
    const res = await client.describeInstances(req)
    const instance = res.body.Instances.Instance?.[0]
    return instance || null
}

/** 检查 WebUI 是否可访问 */
async function checkWebUI(ip) {
    if (!ip) return '⚪ 无公网IP，无法检测 WebUI'
    try {
        const res = await axios.get(`http://${ip}:${WEBUI_PORT}`, { timeout: 5000 })
        return res.status === 200
            ? `✅ WebUI已就绪`
            : `⚠️ WebUI 响应异常：HTTP ${res.status}`
    } catch {
        return `❌ WebUI未响应`
    }
}

// ====== 插件主类 ======
export class aliyunInstance extends plugin {
    constructor() {
        super({
            name: '阿里云实例控制',
            dsc: '通过命令控制阿里云 ECS 实例启动、关闭与状态查询',
            event: 'message',
            priority: 10,
            rule: [
                { reg: /^#?实例(\d+)?小时?$/, fnc: 'startInstance' },
                { reg: /^#?(状态查询|实例状态)$/, fnc: 'checkStatus' },
                { reg: /^#?关闭实例$/, fnc: 'stopInstance' },
                { reg: /^#?延长实例(\d+)小时?$/, fnc: 'extendInstance' }
            ]
        })

        // 启动时自动恢复关机任务
        this.restoreAutoShutdown()
    }

    /** 启动实例 */
    async startInstance(e) {
        if (!ALLOWED_USERS.includes(e.user_id)) return e.reply('🚫 你没有权限使用此命令。')

        const match = e.msg.match(/实例(\d+)?/)
        const hours = match && match[1] ? parseInt(match[1]) : 1
        const ms = hours * 3600 * 1000

        try {
            const instance = await getInstanceInfo()
            const status = instance?.Status
            if (status === 'Running' || status === 'Starting') return e.reply(`⚠️ 实例当前状态为「${stateMap[status]}」`)

            await e.reply(`🌀 正在启动实例（预计运行 ${hours} 小时）...`)
            const req = new StartInstanceRequest({ regionId: REGION_ID, instanceId: INSTANCE_ID })
            await client.startInstance(req)

            const shutdownAt = Date.now() + ms
            await redis.set(REDIS_KEY, shutdownAt)
            this.scheduleShutdown(ms)

            await e.reply(`✅ 实例启动成功，将在 ${hours} 小时后自动关闭。`)
            if (e.user_id !== OWNER_QQ)
                e.bot.sendPrivateMsg(OWNER_QQ, `⚙️ 用户 ${e.nickname || e.user_id} 启动了实例（运行 ${hours} 小时）`)
        } catch (err) {
            console.error(err)
            e.reply(`❌ 启动失败：${err.message}`)
        }
    }

    /** 查询状态 */
    async checkStatus(e) {
        if (!ALLOWED_USERS.includes(e.user_id)) return e.reply('🚫 你没有权限使用此命令。')

        try {
            const instance = await getInstanceInfo()
            if (!instance) return e.reply('⚠️ 未找到实例信息。')

            const status = stateMap[instance.Status] || instance.Status
            const ip = instance.PublicIpAddress?.IpAddress?.[0]
            let msg = `📊 状态：${status}\n🧩 类型：${instance.InstanceType}`

            if (instance.Status === 'Running' && ip) msg += `\n${await checkWebUI(ip)}`
            const shutdownAt = await redis.get(REDIS_KEY)
            if (shutdownAt) {
                const remain = parseInt(shutdownAt) - Date.now()
                if (remain > 0) msg += `\n⏰ 距离自动关机：${(remain / 3600000).toFixed(2)} 小时`
            }

            await e.reply(msg)
        } catch (err) {
            console.error(err)
            e.reply(`❌ 状态查询失败：${err.message}`)
        }
    }

    /** 手动关闭实例 */
    async stopInstance(e) {
        if (!ALLOWED_USERS.includes(e.user_id)) return e.reply('🚫 你没有权限使用此命令。')

        try {
            const instance = await getInstanceInfo()
            const status = instance?.Status
            if (status === 'Stopped' || status === 'Stopping') return e.reply(`⚠️ 实例当前为「${stateMap[status]}」`)

            await e.reply('🛑 正在关闭实例...')
            const req = new StopInstanceRequest({ regionId: REGION_ID, instanceId: INSTANCE_ID, forceStop: true })
            await client.stopInstance(req)
            await redis.del(REDIS_KEY)
            await e.reply('✅ 实例已关闭。')
            if (e.user_id !== OWNER_QQ)
                e.bot.sendPrivateMsg(OWNER_QQ, `⚙️ 用户 ${e.nickname || e.user_id} 手动关闭了实例。`)
        } catch (err) {
            console.error(err)
            e.reply(`❌ 关闭失败：${err.message}`)
        }
    }

    /** 延长实例运行时间 */
    async extendInstance(e) {
        if (!ALLOWED_USERS.includes(e.user_id)) return e.reply('🚫 你没有权限使用此命令。')

        const match = e.msg.match(/延长实例(\d+)/)
        const hours = match && match[1] ? parseInt(match[1]) : 1
        const extendMs = hours * 3600 * 1000

        const shutdownAt = parseInt(await redis.get(REDIS_KEY))
        if (!shutdownAt) return e.reply('⚠️ 当前没有正在运行的定时任务。')

        const remain = shutdownAt - Date.now()
        const newShutdown = Date.now() + remain + extendMs

        await redis.set(REDIS_KEY, newShutdown)
        this.scheduleShutdown(newShutdown - Date.now())
        await e.reply(`⏱ 已延长 ${hours} 小时，总剩余 ${((newShutdown - Date.now()) / 3600000).toFixed(2)} 小时。`)
    }

    /** 定时关机逻辑 */
    scheduleShutdown(ms) {
        if (this.shutdownTimer) clearTimeout(this.shutdownTimer)
        this.shutdownTimer = setTimeout(async () => {
            try {
                const req = new StopInstanceRequest({ regionId: REGION_ID, instanceId: INSTANCE_ID, forceStop: true })
                await client.stopInstance(req)
                await redis.del(REDIS_KEY)
                console.log('💡 实例自动关机完成')
                Bot.sendPrivateMsg(OWNER_QQ, '💡 实例已自动关闭（定时任务触发）')
            } catch (err) {
                console.error('自动关闭失败：', err)
            }
        }, ms)
    }

    /** 启动时恢复任务 */
    async restoreAutoShutdown() {
        const shutdownAt = parseInt(await redis.get(REDIS_KEY))
        if (!shutdownAt) return
        const delay = shutdownAt - Date.now()

        if (delay <= 0) {
            console.log('⏰ 任务过期，立即执行关机')
            try {
                const req = new StopInstanceRequest({ regionId: REGION_ID, instanceId: INSTANCE_ID, forceStop: true })
                await client.stopInstance(req)
                await redis.del(REDIS_KEY)
            } catch (err) {
                console.error('恢复关机任务失败：', err)
            }
        } else {
            console.log(`⏱ 恢复关机任务：将在 ${(delay / 3600000).toFixed(2)} 小时后执行`)
            this.scheduleShutdown(delay)
        }
    }
}
