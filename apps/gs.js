import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { rootPath, dataPath, cfgdata } from '../tools/index.js'


const cfgPath = path.join(dataPath, 'opencommand.json')

function loadCfg() {
    if (!fs.existsSync(cfgPath)) return { host: '', token: '' };
    return JSON.parse(fs.readFileSync(cfgPath, 'utf8') || '{}');
}
function saveCfg(cfg) {
    fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
    fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
}
async function ocRequest(host, body) {
    const url = host.replace(/\/$/, '') + '/opencommand/api';
    const { data } = await axios.post(url, body, { timeout: 10000 });
    if (data.retcode !== 200) throw new Error(data.message || 'OpenCommand error');
    return data.data;
}

export class OpenCommand extends plugin {
    constructor() {
        super({
            name: 'OpenCommand',
            dsc: '连接 Grasscutter OpenCommand 并远程执行命令',
            event: 'message',
            priority: 500,
            rule: [
                { reg: '^#oc设置地址\\s+(.+)$', fnc: 'setHost' },
                { reg: '^#oc设置token\\s+(.+)$', fnc: 'setToken' },
                { reg: '^#oc查询$', fnc: 'ping' },
                { reg: '^#oc验证码\\s+(\\d+)$', fnc: 'sendCode' },
                { reg: '^#oc验证\\s+(\\d+)$', fnc: 'verify' },
                { reg: '^#oc执行\\s+([\\s\\S]+)$', fnc: 'invoke' }
            ]
        });
    }

    async setHost(e) {
        const m = e.msg.match(/^#oc设置地址\s+(.+)$/);
        const host = m[1].trim();
        const cfg = loadCfg();
        cfg.host = host;
        saveCfg(cfg);
        await e.reply(`✅已设置 OpenCommand 地址：${host}`);
    }

    async setToken(e) {
        const token = e.msg.replace(/^#oc设置token\s+/, '').trim();
        const cfg = loadCfg();
        cfg.token = token;
        saveCfg(cfg);
        await e.reply('✅已设置 OpenCommand Token');
    }

    async ping(e) {
        const cfg = loadCfg();
        if (!cfg.host) return e.reply('请先 #oc设置地址 http://ip:port');
        try {
            const ver = await ocRequest(cfg.host, { token: cfg.token || '', action: 'ping', data: null });
            await e.reply(`服务器运行正常，OpenCommand 正常，版本：${ver || '未知'}`);
        } catch (err) {
            await e.reply(`❌查询失败：${String(err.message || err)}`);
        }
    }

    async sendCode(e) {
        const cfg = loadCfg();
        if (!cfg.host) return e.reply('请先 #oc设置地址');
        const uid = Number(e.msg.match(/^#oc验证码\s+(\d+)$/)[1]);
        try {
            const token = await ocRequest(cfg.host, { token: '', action: 'sendCode', data: uid });
            cfg.token = token;
            saveCfg(cfg);
            await e.reply('✅验证码已发送，请用 #oc验证 <验证码> 完成绑定');
        } catch (err) {
            await e.reply(`❌发送失败：${String(err.message || err)}`);
        }
    }

    async verify(e) {
        const cfg = loadCfg();
        if (!cfg.host) return e.reply('请先 #oc设置地址');
        const code = Number(e.msg.match(/^#oc验证\s+(\d+)$/)[1]);
        try {
            await ocRequest(cfg.host, { token: cfg.token || '', action: 'verify', data: code });
            await e.reply('✅验证成功，可以执行命令了');
        } catch (err) {
            await e.reply(`❌验证失败：${String(err.message || err)}`);
        }
    }

    async invoke(e) {
        const cfg = loadCfg();
        if (!cfg.host) return e.reply('请先 #oc设置地址');
        if (!cfg.token) return e.reply('未绑定，先 #oc验证码 <UID> 并 #oc验证 <验证码>，或 #oc设置token <token>');
        const cmd = e.msg.replace(/^#oc执行\s+/, '');
        try {
            const result = await ocRequest(cfg.host, { token: cfg.token, action: 'command', data: cmd });
            await e.reply(`✅执行成功：\n${result || '无返回'}`);
        } catch (err) {
            await e.reply(`❌执行失败：${String(err.message || err)}`);
        }
    }
}