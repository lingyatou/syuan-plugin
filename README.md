# 🛠️ Syuan-Plugin

> 一个功能丰富的自用工具综合插件，为Yunzai-Bot提供SSH远程管理和群欢迎词等实用功能。

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Package Manager](https://img.shields.io/badge/Package%20Manager-pnpm-orange.svg)](https://pnpm.io/)

## ✨ 功能特性

### 🔗 SSH远程管理
- **命令**: `#memenew`
- **功能**: 通过SSH连接远程服务器，批量更新所有meme仓库
- **特点**: 
  - 安全的配置文件管理
  - 实时反馈连接状态
  - 自动处理Git仓库更新

### 💬 群欢迎词管理
- **命令**: `#设置群欢迎词[群号]`、`#群欢迎词`
- **功能**: 为不同群组设置和管理自定义欢迎词
- **特点**:
  - 支持多群组配置
  - 权限控制
  - 数据持久化存储

### 📚 插件工具
- **命令**: `#插件库`
- **功能**: 快速获取Yunzai插件库链接

## 🚀 快速开始

### 环境要求
- Node.js 16+
- Yunzai-Bot
- pnpm (推荐) 或 npm

### 安装步骤

1. **克隆项目到插件目录**
```bash
cd Yunzai-Bot/plugins
git clone https://github.com/lingyatou/syuan-plugin.git
cd syuan-plugin
```

2. **安装依赖**
```bash
pnpm install
# 或者使用 npm
npm install
```

3. **配置SSH连接**
   
   在 `data/Syuan-plugin/` 目录下创建 `sshInfo.json`:
```json
{
  "host": "your-server-ip",
  "port": 22,
  "username": "your-username",
  "password": "your-password",
  "description": "SSH服务器配置"
}
```

4. **配置插件设置**
   
   编辑 `config/cfg.yaml`:
```yaml
allowlist: [12345, 67890]  # 允许使用的群组
denylist: []               # 禁止使用的群组
```

5. **重启Yunzai-Bot**

## 📁 项目结构

```
syuan-plugin/
├── apps/                   # 插件核心功能模块
│   ├── index.js           # 应用导出入口
│   ├── ssh.js             # SSH远程管理
│   └── welcome.js         # 群欢迎词管理
├── config/                 # 配置文件
│   └── cfg.yaml           # 主配置文件
├── tools/                  # 工具模块
│   ├── index.js           # 工具导出入口
│   ├── cfg.js             # 配置文件读写
│   ├── data.js            # SSH配置管理
│   ├── path.js            # 路径工具
│   └── version.js         # 版本信息管理
├── index.js               # 插件主入口
├── package.json           # 项目配置
└── README.md              # 说明文档
```

## 🎯 使用说明

### SSH远程更新
```
#memenew
```
该命令将：
1. 读取SSH配置文件
2. 连接到远程服务器
3. 遍历 `/root/meme-data/memes/` 目录下的所有Git仓库
4. 执行 `git fetch --all` 和 `git reset --hard origin/HEAD`
5. 返回更新结果

### 群欢迎词管理
```
#设置群欢迎词123456     # 为指定群设置欢迎词
#设置群欢迎词           # 为当前群设置欢迎词
#群欢迎词               # 查看所有群欢迎词
```

### 获取插件库
```
#插件库
```

## ⚙️ 配置说明

### SSH配置 (`data/Syuan-plugin/sshInfo.json`)
```json
{
  "host": "服务器IP地址",
  "port": 22,
  "username": "用户名",
  "password": "密码",
  "description": "配置描述",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### 插件配置 (`config/cfg.yaml`)
```yaml
# 允许使用插件的群组列表
allowlist: [群号1, 群号2]

# 禁止使用插件的群组列表  
denylist: [群号3, 群号4]

```

## 🔧 开发

### 添加新功能
1. 在 `apps/` 目录下创建新的功能模块
2. 在 `apps/index.js` 中导出新模块
3. 更新相关配置和文档


## 📝 更新日志

### v1.0.0
- ✨ 初始版本发布
- 🔗 SSH远程仓库更新功能
- 💬 群欢迎词管理功能
- 📚 插件库快速访问

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

**源Syuan** - *项目创建者和维护者*

## 🙏 致谢

- [Yunzai-Bot](https://github.com/TimeRainStarSky/Yunzai) - 优秀的QQ机器人框架
- [miao-plugin](https://github.com/yoimiya-kokomi/miao-plugin) - 喵喵插件

## ⚠️ 免责声明

本插件仅供学习和研究使用，请遵守相关法律法规。使用本插件所产生的任何问题，作者不承担任何责任。

---

<div align="center">

**如果这个项目对您有帮助，请给它一个 ⭐**

Made with ❤️ by [源Syuan](https://github.com/lingyatou)

</div>
