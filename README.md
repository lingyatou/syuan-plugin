# Syuan Plugin - 自用工具综合插件

一个功能丰富的Yunzai-Bot插件，提供多种实用工具。

## 功能特性

- **SSH连接管理** - 管理SSH连接和命令执行
- **欢迎消息设置** - 自定义群组欢迎消息
- **Grasscutter服务器管理** - 管理游戏服务器
- **插件自动更新** - 支持插件自动更新
- **帮助系统** - 美观的帮助图片展示

## 安装

1. 将插件放置在Yunzai-Bot的plugins目录下
2. 重启Yunzai-Bot
3. 安装依赖：`pnpm install`

## 使用方法

### 帮助命令
发送 `#sy帮助` 查看完整的帮助信息，包括：
- 插件基本信息
- 功能特性列表
- 可用命令说明
- 命令使用方法

### 其他命令
- `#ssh` - SSH连接管理
- `#欢迎` - 欢迎消息设置
- `#gs` - Grasscutter服务器管理
- `#更新` - 插件更新

## 帮助系统

帮助系统会自动读取以下文件：
- `resources/help/help.yaml` - 帮助信息配置
- `resources/help/bg.jpg` - 背景图片
- `resources/help/icon.png` - 插件图标

帮助图片会自动渲染，包含：
- 插件图标和标题
- 版本和作者信息
- 功能特性列表
- 详细命令说明
- 美观的布局设计

## 配置

可以通过修改 `resources/help/help.yaml` 文件来自定义帮助信息：

```yaml
title: "插件标题"
version: "版本号"
author: "作者名"
description: "插件描述"
commands:
  - name: "命令名"
    description: "命令描述"
    usage: "使用方法"
features:
  - "功能1"
  - "功能2"
contact: "联系信息"
```

## 依赖

- axios
- lodash
- ssh2
- yaml
- canvas (用于图片渲染)

## 作者

源Syuan

## 许可证

ISC
