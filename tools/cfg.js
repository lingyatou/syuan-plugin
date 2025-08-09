import fs from 'node:fs'
import path from 'node:path'
import { pluginPath } from './path.js'
import YAML from 'yaml'

const cfgFilePath = path.join(pluginPath, 'config', 'cfg.yaml')

let cfgdata = {
    // 保存配置到 YAML 文件
    saveCfg(cfg) {
        try {
            const yamlStr = YAML.stringify(cfg, { indent: 2 })
            fs.writeFileSync(cfgFilePath, yamlStr, 'utf8')
        } catch (err) {
            console.error('保存配置失败:', err)
        }
    },

    // 从 YAML 文件读取配置
    loadCfg() {
        try {
            if (fs.existsSync(cfgFilePath)) {
                const fileContent = fs.readFileSync(cfgFilePath, 'utf8')
                return YAML.parse(fileContent) || {}
            }
        } catch (err) {
            console.error('读取配置失败:', err)
        }
        return {}
    }


}
export { cfgdata }