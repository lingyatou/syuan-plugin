<div align="center">
  <img src="https://gitee.com/Elvin-Apocalys/pic-bed/raw/master/1212.webp" alt="Plugin Icon" width="200">
</div>

# Syuan Plugin

一个自用的 Yunzai-Bot 插件，提供 SSH 更新meme后端、LunaGC 服务端控制、群欢迎词管理等功能。

## 安装教程

### 1. 克隆插件

```bash
git clone https://github.com/lingyatou/syuan-plugin ./plugins/syuan-plugin
```

### 2. 安装依赖

```bash
pnpm i
```

## 已实现功能

### 更新meme后端
- **#memenew** - 对表情包额外仓库进行git更新（需要主人权限）
  - 可在bot根目录下的data文件夹下的Syuan-plugin文件夹的sshInfo.json配置账号密码

### LunaGC服务端控制
- **#oc设置地址 <addr>** - 设置服务器地址（需要主人权限）
- **#oc查询** - 查询插件是否可以连接（需要主人权限）
- **#oc验证码 <uid>** - 向在线用户发送验证码（需要主人权限）
- **#oc验证<token>** - 验证验证码（需要主人权限）
- **#oc执行 <command>** - 发送指令（需要主人权限）

### 其他功能
- **#设置群欢迎词** - 设置新人入群的欢迎词
- **#群欢迎词** - 查看各群的欢迎词
- **#插件库** - 查看已经被收纳的插件

### 更新指令
- **#sy更新** - 更新本插件
- **#sy强制更新** - 忽略本地改动直接同步远程仓库

## 鸣谢

感谢以下开源项目的支持：

- [miao-plugin](https://github.com/yoimiya-kokomi/miao-plugin) - 为 Yunzai-Bot 提供优秀的插件架构参考

## 许可证

本项目采用 MIT 许可证开源。
