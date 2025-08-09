import { Client } from 'ssh2'

export class UpdateMemeRepos extends plugin {
    constructor() {
        super({
            name: 'Syuan工具包',
            dsc: '通过SSH密码连接远程服务器并更新所有meme仓库',
            event: 'message',
            priority: 50,
            rule: [{
                reg: '^#?memenew$',
                fnc: 'updateRepos'
            }]
        })
    }

    async updateRepos(e) {
        e.reply('正在连接远程服务器，请稍等...')

        const conn = new Client()

        return new Promise((resolve, reject) => {
            conn.on('ready', () => {
                e.reply('✅ SSH连接成功，正在更新仓库...')

                // 进入目标目录并强制更新所有 git 仓库
                const cmd = `
cd /root/meme-data/memes && 
for d in */; do
  cd "$d" &&
  if [ -d ".git" ]; then
    echo "更新仓库: $d" &&
    git fetch --all &&
    git reset --hard origin/$(git rev-parse --abbrev-ref HEAD)
  else
    echo "跳过非Git目录: $d"
  fi
  cd ..
done

        `

                conn.exec(cmd, (err, stream) => {
                    if (err) {
                        e.reply(`❌ 命令执行失败：${err.message}`)
                        conn.end()
                        return reject(err)
                    }

                    let output = ''
                    stream.on('close', (code, signal) => {
                        conn.end()
                        e.reply(`✅ 所有仓库更新完成，退出代码：${code}`)
                        resolve(true)
                    }).on('data', (data) => {
                        output += data.toString()
                    }).stderr.on('data', (data) => {
                        output += data.toString()
                    })
                })
            }).connect({
                host: '43.143.104.104',
                port: 22,
                username: 'root',
                password: 'Love520105' // 🔒 请替换为你的真实密码
            })

            conn.on('error', err => {
                e.reply(`❌ SSH连接失败：${err.message}`)
                reject(err)
            })
        })
    }
}
