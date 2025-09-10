import { rootPath, pluginPath } from "../tools/index.js"
import path from 'path'
import fs from 'fs'
import yaml from 'yaml';
const puppeteer = await import(path.join(rootPath, "lib/puppeteer/puppeteer.js"))
const cfg = await import(path.join(rootPath, "lib/config/config.js"))


const file = path.join(pluginPath, `resources`, `BotHelp`, `index.html`)
const cfgyaml = path.join(pluginPath, 'config', 'BotHelp.yaml')


const configData = fs.readFileSync(cfgyaml, 'utf8');
const helpData = yaml.parse(configData);

export class botHelp extends plugin {
    constructor() {
        super({
            name: '[Syuan-Plugin]Bot帮助',
            dsc: 'Bot总帮助',
            event: 'message',
            priority: -999999,
            rule: [
                {
                    reg: '^(#|/)?(帮助|菜单|help|功能|说明|指令|使用说明|命令)(列表)?$',
                    fnc: 'help'
                }
            ]
        })
    }

    async help(e) {
        let { img } = await image({
            saveId: 'help',
            cwd: pluginPath,
            genshinPath: `${pluginPath}/resources/BotHelp/`,
            helpData: helpData
        });
        e.reply(img);
    }
}


/**
 * 浏览器截图
 * @param {*} e E
 * @param {*} file html模板名称
 * @param {*} name 
 * @param {object} obj 渲染变量，类型为对象
 * @returns 
 */
async function image(obj) {
    let botname = cfg.package.name
    if (cfg.package.name == `yunzai`) {
        botname = `Yunzai-Bot`
    } else if (cfg.package.name == `miao-yunzai`) {
        botname = `Miao-Yunzai`
    } else if (cfg.package.name == `trss-yunzai`) {
        botname = `TRSS-Yunzai`
    } else if (cfg.package.name == `a-yunzai`) {
        botname = `A-Yunzai`
    } else if (cfg.package.name == `biscuit-yunzai`) {
        botname = `Biscuit-Yunzai`
    }
    let data = {
        quality: 100,
        tplFile: `${file}`,
        ...obj
    }
    let img = await puppeteer.screenshot('help', {
        botname,
        MiaoV: cfg.package.version,
        ...data
    })

    return {
        img
    };
}