import { paths } from '../tools/index.js'
import { exec } from 'child_process'


export class Update extends plugin {
    constructor() {
        super({
            name: '[Syuan-Plugin]更新',
            dsc: 'tools',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: '^syuan更新$',
                    fnc: 'SyuanUpdate'
                },
                {
                    reg: '^syuan强制更新$',
                    fnc: 'SyuanForceUpdate'
                }
            ]
        })
    }

    async SyuanUpdate(e) {
        e.reply('[Syuan-plugin] 开始更新插件，请稍等...')

        exec(`git -C "${paths.pluginPath}" pull && cd "${paths.rootPath}" && pnpm i`, (err, stdout, stderr) => {
            if (err) {
                e.reply('❌ 更新失败：' + err.message)
                return
            }

            // 判断输出里有没有关键字
            if (/Already up to date/.test(stdout)) {
                e.reply('✅ 已经是最新版本，无需更新。')
            } else {
                e.reply('✅ 更新完成！')
            }
        })
    }


    async SyuanForceUpdate(e) {
        //使用pluginPath,在这个目录下进行git忽略本地改动更新
        e.reply('[Syuan-plugin]开始强制更新插件，请稍等...')
        // 强制更新会丢失本地改动
        const cmd = `git -C "${paths.pluginPath}" reset --hard && git -C "${paths.pluginPath}" pull && cd "${paths.rootPath}" && pnpm i
`
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                logger.err('❌强制更新失败：' + err.message)
                e.reply('❌强制更新失败')
                return
            }
            e.reply('✅强制更新完成')
        })
    }
}