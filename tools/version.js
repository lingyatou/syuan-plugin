import pkg from '../package.json' assert { type: 'json' }

/**
 * 项目版本信息管理
 */
export const versionInfo = {
    /**
     * 获取项目名称
     * @returns {string} 项目名称
     */
    getProjectName() {
        return pkg.name || '未知项目'
    },

    /**
     * 获取项目版本
     * @returns {string} 项目版本
     */
    getVersion() {
        return pkg.version || '0.0.0'
    },

    /**
     * 获取作者信息
     * @returns {string} 作者信息
     */
    getAuthor() {
        return pkg.author || '未知作者'
    },

    /**
     * 获取项目描述
     * @returns {string} 项目描述
     */
    getDescription() {
        return pkg.description || '暂无描述'
    },

    /**
     * 获取许可证信息
     * @returns {string} 许可证
     */
    getLicense() {
        return pkg.license || '未指定'
    },

    /**
     * 获取主入口文件
     * @returns {string} 主文件路径
     */
    getMainFile() {
        return pkg.main || 'index.js'
    },

    /**
     * 获取包管理器信息
     * @returns {string} 包管理器
     */
    getPackageManager() {
        return pkg.packageManager || 'npm'
    },

    /**
     * 获取项目关键词
     * @returns {Array} 关键词数组
     */
    getKeywords() {
        return pkg.keywords || []
    },

    /**
     * 获取依赖信息
     * @returns {Object} 依赖对象
     */
    getDependencies() {
        return pkg.dependencies || {}
    },

    /**
     * 获取开发依赖信息
     * @returns {Object} 开发依赖对象
     */
    getDevDependencies() {
        return pkg.devDependencies || {}
    },

    /**
     * 获取脚本信息
     * @returns {Object} 脚本对象
     */
    getScripts() {
        return pkg.scripts || {}
    },

    /**
     * 获取完整的package.json信息
     * @returns {Object} 完整的package.json对象
     */
    getPackageInfo() {
        return pkg
    },

    /**
     * 获取格式化的项目信息字符串
     * @returns {string} 格式化的项目信息
     */
    getFormattedInfo() {
        return `${this.getProjectName()} v${this.getVersion()}\n作者：${this.getAuthor()}\n描述：${this.getDescription()}`
    },

    /**
     * 获取项目初始化信息
     * @returns {string} 初始化信息
     */
    getInitMessage() {
        return `${this.getProjectName()} ${this.getVersion()} 初始化完成\n作者：${this.getAuthor()}`
    }
}

// 默认导出
export default versionInfo

// 直接导出常用信息
export const { name, version, author, description } = pkg