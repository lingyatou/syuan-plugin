import fs from 'node:fs'
import path from 'node:path'
import { pluginPath } from './path.js'
import YAML from 'yaml'

const cfgDir = path.join(pluginPath, 'config')
const cfgFilePath = path.join(cfgDir, 'cfg.yaml')
const defaultFilePath = path.join(cfgDir, 'default.yaml')

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
            // 文件不存在，则复制 default.yaml
            if (!fs.existsSync(cfgFilePath)) {
                if (fs.existsSync(defaultFilePath)) {
                    fs.copyFileSync(defaultFilePath, cfgFilePath)
                    console.log('配置文件不存在，已从 default.yaml 创建 cfg.yaml')
                } else {
                    console.warn('default.yaml 文件不存在，无法创建 cfg.yaml')
                    return {}
                }
            }

            // 读取 cfg.yaml
            const fileContent = fs.readFileSync(cfgFilePath, 'utf8')
            return YAML.parse(fileContent) || {}
        } catch (err) {
            console.error('读取配置失败:', err)
            return {}
        }
    }
}

export { cfgdata }
