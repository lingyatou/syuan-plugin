import { paths } from './path.js'
import fs from 'fs'
import path from 'path'
//ssh实例信息文件

const sshInfoPath = path.join(paths.rootDataPath, 'sshInfo.json')

/**
 * SSH配置数据管理
 */
export const sshData = {
    /**
     * 加载SSH配置
     * @returns {Object|null} SSH配置对象，失败返回null
     */
    loadSshConfig() {
        try {
            if (fs.existsSync(sshInfoPath)) {
                const fileContent = fs.readFileSync(sshInfoPath, 'utf8')
                const config = JSON.parse(fileContent)
                return config
            } else {
                // 如果文件不存在，创建默认配置
                const defaultConfig = {
                    host: "",
                    port: 22,
                    username: "",
                    password: "",
                    description: "SSH服务器配置"
                }
                this.saveSshConfig(defaultConfig)
                return defaultConfig
            }
        } catch (err) {
            console.error('读取SSH配置失败:', err)
            return null
        }
    },

    /**
     * 保存SSH配置
     * @param {Object} config SSH配置对象
     * @returns {boolean} 保存是否成功
     */
    saveSshConfig(config) {
        try {
            // 确保目录存在
            if (!fs.existsSync(dataPath)) {
                fs.mkdirSync(dataPath, { recursive: true })
            }

            const configWithTimestamp = {
                ...config,
                lastUpdated: new Date().toISOString()
            }

            fs.writeFileSync(sshInfoPath, JSON.stringify(configWithTimestamp, null, 2), 'utf8')
            return true
        } catch (err) {
            console.error('保存SSH配置失败:', err)
            return false
        }
    },

    /**
     * 验证SSH配置完整性
     * @param {Object} config SSH配置对象
     * @returns {Object} 验证结果 {isValid: boolean, message: string}
     */
    validateSshConfig(config) {
        if (!config) {
            return { isValid: false, message: 'SSH配置为空' }
        }

        const required = ['host', 'username', 'password']
        const missing = required.filter(field => !config[field] || config[field].toString().trim() === '')

        if (missing.length > 0) {
            return {
                isValid: false,
                message: `SSH配置不完整，缺少字段: ${missing.join(', ')}`
            }
        }

        // 验证端口号
        if (config.port && (isNaN(config.port) || config.port < 1 || config.port > 65535)) {
            return {
                isValid: false,
                message: '端口号必须是1-65535之间的数字'
            }
        }

        return { isValid: true, message: '配置验证通过' }
    },

    /**
     * 获取SSH配置文件路径
     * @returns {string} 配置文件路径
     */
    getSshConfigPath() {
        return sshInfoPath
    },

    /**
     * 检查SSH配置文件是否存在
     * @returns {boolean} 文件是否存在
     */
    sshConfigExists() {
        return fs.existsSync(sshInfoPath)
    }
}

// 默认导出
export default sshData


