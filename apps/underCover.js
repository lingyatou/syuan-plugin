import fs from 'fs'
import { pluginPath } from '../tools/index.js'
import path from 'path'
let game = {}
const wordsData = path.join(pluginPath, 'data/UnderCover.json')
export class Undercover extends plugin {
    constructor() {
        super({
            name: '[Syuan-Plugin]谁是卧底',
            dsc: '群内卧底小游戏',
            event: 'message.group',
            priority: 500,
            rule: [
                { reg: '^#卧底开始$', fnc: 'start' },
                { reg: '^#加入卧底$', fnc: 'join' },
                { reg: '^#发词$', fnc: 'sendWords' },
                { reg: '^#投票.*$', fnc: 'vote' }
            ]
        })
    }

    async start(e) {
        if (game[e.group_id]) return e.reply('已有游戏正在进行')
        game[e.group_id] = {
            players: [],
            words: [],
            round: 1,
            votes: {}
        }
        e.reply('《谁是卧底》游戏创建成功！输入 #加入卧底 报名。')
    }

    async join(e) {
        let g = game[e.group_id]
        if (!g) return e.reply('本群未有《谁是卧底》游戏实例')
        if (g.players.find(p => p.id == e.user_id)) return e.reply('你已经加入了')
        g.players.push({ id: e.user_id, alive: true })
        e.reply(`${e.user_id} 加入了游戏！`)
    }

    async sendWords(e) {
        let g = game[e.group_id]
        if (!g) return
        if (g.players.length < 4) return e.reply('人数不足，至少4人！')

        // 读取词库
        let words = JSON.parse(fs.readFileSync(wordsData))
        let keys = Object.keys(words)
        let key = keys[Math.floor(Math.random() * keys.length)]
        let [civilian, undercover] = words[key]

        // 分配角色
        let players = g.players
        let undercoverIndex = Math.floor(Math.random() * players.length)
        players.forEach((p, i) => {
            if (i == undercoverIndex) {
                p.role = '卧底'
                p.word = undercover
            } else {
                p.role = '平民'
                p.word = civilian
            }
            this.bot.pickUser(p.id).sendMsg(`你的词语是：${p.word}`)
        })
        e.reply(`已发放词语！本轮游戏开始，共 ${players.length} 人。`)
    }

    async vote(e) {
        let g = game[e.group_id]
        if (!g) return
        let target = e.message.filter(m => m.type == 'at')[0]
        if (!target) return e.reply('请 @ 要投票的人')

        g.votes[e.user_id] = target.qq
        e.reply(`${e.sender.card || e.user_id} 投票给了 ${target.qq}`)

        // 如果所有存活玩家都投票了
        if (Object.keys(g.votes).length == g.players.filter(p => p.alive).length) {
            let count = {}
            for (let v of Object.values(g.votes)) {
                count[v] = (count[v] || 0) + 1
            }
            let outId = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0]
            let outPlayer = g.players.find(p => p.id == outId)
            outPlayer.alive = false
            e.reply(`淘汰玩家：${outId}，身份是 ${outPlayer.role}`)

            // 判断胜利条件
            let civilians = g.players.filter(p => p.role == '平民' && p.alive).length
            let undercover = g.players.filter(p => p.role == '卧底' && p.alive).length
            if (undercover == 0) {
                e.reply('平民胜利！游戏结束。')
                delete game[e.group_id]
            } else if (undercover >= civilians) {
                e.reply('卧底胜利！游戏结束。')
                delete game[e.group_id]
            } else {
                g.round++
                g.votes = {}
                e.reply(`第 ${g.round} 轮开始，请继续描述。`)
            }
        }
    }
}
