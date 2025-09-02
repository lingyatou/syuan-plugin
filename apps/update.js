import { pluginPath, rootPath, dataPath } from '../tools/index.js'
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
                    reg: '^#syuan更新$',
                    fnc: 'SyuanUpdate'
                },
                {
                    reg: '^#syuan强制更新$',
                    fnc: 'SyuanForceUpdate'
                }
            ]
        })
    }

    async SyuanUpdate(e) {
        //使用pluginPath,在这个目录下进行git更新
        e.reply('[Syuan-plugin]开始更新插件，请稍等...')
        exec(`git -C "${pluginPath}" pull && cd "${rootPath}" && pnpm i`, (err, stdout, stderr) => {
            if (err) {
                e.reply('❌更新失败：' + err.message)
                return
            }
            e.reply('✅更新完成！\n' + stdout || stderr)
        })
    }

    async SyuanForceUpdate(e) {
        //使用pluginPath,在这个目录下进行git忽略本地改动更新
        e.reply('[Syuan-plugin]开始强制更新插件，请稍等...')
        // 强制更新会丢失本地改动
        const cmd = `git -C "${pluginPath}" reset --hard && git -C "${pluginPath}" pull && cd "${rootPath}" && pnpm i
`
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                e.reply('❌强制更新失败：' + err.message)
                return
            }
            e.reply('✅强制更新完成！\n' + stdout || stderr)
        })
    }
}