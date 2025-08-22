import { rootPath, dataPath, cfgdata } from '../tools/index.js'


export class WwCheck extends plugin {
    constructor() {
        super({
            name: 'Syuan工具包',
            dsc: 'tools',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: '^#sy更新$',
                    fnc: 'SyuanUpdate'
                },
                {
                    reg: '^#sy强制更新$',
                    fnc: 'SyuanForceUpdate'
                }
            ]
        })
    }

    async SyuanUpdate(e) {
        //使用rootPath,在这个目录下进行git更新
        e.reply('[Syuan-plugin]开始更新插件，请稍等...')
        exec(`git -C "${rootPath}" pull`, (err, stdout, stderr) => {
            if (err) {
                e.reply('更新失败：' + err.message)
                return
            }
            e.reply('更新完成！\n' + stdout || stderr)
        })
    }

    async SyuanForceUpdate(e) {
        //使用rootPath,在这个目录下进行git忽略本地改动更新
        e.reply('[Syuan-plugin]开始强制更新插件，请稍等...')
        // 强制更新会丢失本地改动
        const cmd = `git -C "${rootPath}" reset --hard && git -C "${rootPath}" pull`
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                e.reply('强制更新失败：' + err.message)
                return
            }
            e.reply('强制更新完成！\n' + stdout || stderr)
        })
    }
}