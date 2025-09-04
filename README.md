<div align="center">
  <img src="https://gitee.com/Elvin-Apocalys/pic-bed/raw/master/1212.webp" alt="Plugin Icon" width="200">
</div>

## Syuan Plugin

自用工具综合插件，适用于 Yunzai/NapCat 生态，用于提供常用运维、小功能与游戏等一体化能力。

- **名称**: syuan-plugin
- **版本**: v1.1.3
- **作者**: 源Syuan
- **许可**: ISC

### 功能总览

- **更新管理**
  - `#syuan更新`：拉取插件更新并安装依赖
  - `#syuan强制更新`：丢弃本地改动后强制更新
- **服务器运维（SSH）**
  - `#memenew`：SSH 连接远程服务器，批量更新表情包仓库并重启 `meme_generator.service`
- **Grasscutter OpenCommand**
  - `#oc设置地址 <addr>`：设置 OpenCommand 服务地址
  - `#oc设置token <token>`：手动设置 Token
  - `#oc查询`：检查服务连通性
  - `#oc验证码 <uid>`：向在线 UID 发送验证码并保存 Token
  - `#oc验证 <code>`：验证验证码
  - `#oc执行 <command>`：远程执行指令
- **欢迎与帮助**
  - `#设置群欢迎词`：为当前群（或指定群号）设置欢迎词
  - `#群欢迎词`：查看所有已设置的欢迎词
  - `#插件库`：返回插件库地址
  - `#syuan帮助`：发送内置帮助菜单
- **事件响应**
  - 新人入群欢迎：自动发送欢迎词与图片
  - 退群通知：自动提示成员退群
  - 戳一戳图片回复：戳指定账号时随机发送图片
- **关键词回复**（示例）
  - 发送 `6`、包含“哈气”、或匹配“`小土豆|土豆雷|土豆地雷|i柯TV|i柯tv|iktv`”触发相应回复/图片
- **谁是卧底**（基础指令）
  - `#卧底开始`、`#加入卧底`、`#发词`、`#投票`、`#结束卧底`

部分指令仅限“主人”使用，权限由 `tools/admin.js` 中的逻辑判定（如 `isMaster`）。

### 运行环境

- Node.js 18+（ESM 模块）
- pnpm（packageManager: `pnpm@10.7.1`）
- 适配 Yunzai/NapCat 运行环境（具备 `plugin` 基类与消息事件 `e`）

### 安装与升级

1) 将本项目放置在 Yunzai 根目录的 `plugins/` 下（例如：`plugins/Syuan-plugin/`）。
```bash
git clone https://github.com/lingyatou/syuan-plugin ./plugins/syuan-plugin
```
2) 在 Yunzai 根目录执行依赖安装：

```bash
pnpm i
```

3) 启动/重启 Yunzai；插件加载时会输出项目名称、版本与作者信息。

升级建议通过指令在群内执行：

- 常规更新：`#syuan更新`
- 强制更新：`#syuan强制更新`

### 配置

#### 1. 全局配置（YAML）

- 文件：`config/cfg.yaml`
- 字段：
  - `allowlist`: 允许生效的群号列表（为空则默认允许）
  - `denylist`: 禁止生效的群号列表

示例：

```yaml
#allowlist: [12345,12346]
denylist: [12345,12346]
```

#### 2. 数据目录与文件

插件会在 Yunzai 根目录下创建数据目录：`data/Syuan-plugin/`

- `sshInfo.json`：SSH 连接配置
  - 字段：`host`、`port`、`username`、`password`、`description`
  - 可通过 `#memenew` 前置校验，缺失字段会提示不完整
- `opencommand.json`：OpenCommand 服务配置
  - 字段：`host`、`token`（通过 `#oc验证码`/`#oc验证` 自动写入或手动设置）
- `welcome.json`：群欢迎词配置
  - 调用 `#设置群欢迎词` 自动写入；`#群欢迎词` 查看
- `thumbsUpMe.json`：自动点赞目标配置
  - 位置：`data/thumbsUpMe.json`（位于插件目录）
  - 结构：键为 QQ 号，值为对象
  - 字段：
    - `push`：是否在私聊推送提示
    - `hitokoto`：是否附加一言（如支持）
    - `group`：关联群号（用于部分推送 API）
  - 示例：
    ```json
    {
      "123456789": { "push": true, "hitokoto": false, "group": 987654321 },
      "2233445566": { "push": false, "hitokoto": false, "group": 123456789 }
    }
    ```

资源目录：`resources/help/` 存放帮助菜单 YAML 与图片资源。
此外：
- `resources/img/`：关键词回复图片（如 `fbhq.jpg`、`xtd.jpg`）。
- `resources/Syuan_plugin/`：戳一戳随机图片目录（放置 `.jpg/.png/.gif`）。

### 使用说明（节选）

#### SSH 更新表情服务

1) 在私有环境准备 SSH 账号；在首次运行或 `sshInfo.json` 不存在时，会生成默认模板。
2) 填写 `data/Syuan-plugin/sshInfo.json` 必填字段：`host`、`username`、`password`（`port` 默认 22）。
3) 在群内发送 `#memenew` 开始执行：
   - 批量 `git fetch/reset` 所有表情包仓库
   - 完成后重启 `meme_generator.service`

仅主人可用（根据 `isMaster` 判定）。

#### Grasscutter OpenCommand

1) `#oc设置地址 http://ip:port`
2) 绑定方式二选一：
   - 验证流程：`#oc验证码 <UID>` → `#oc验证 <验证码>`
   - 直接设置：`#oc设置token <token>`
3) `#oc查询` 检查连通性；`#oc执行 <command>` 远程执行。

#### 欢迎词与帮助

- `#设置群欢迎词`：为当前群（或在命令后附加纯数字群号）设置欢迎词。
- `#群欢迎词`：查看所有已设置的欢迎词。
- `#syuan帮助`：根据 `resources/help/help.yaml` 生成转发帮助消息。

#### 关键词回复与图片素材

- 关键词见 `apps/keyword.js`；需要在 `resources/img/` 放置对应图片，例如：
  - `resources/img/fbhq.jpg`
  - `resources/img/xtd.jpg`

#### 戳一戳图片回复

- 目标：当群内戳账号 `3999084287` 时，随机发送 `resources/Syuan_plugin/` 下的一张图片。
- 准备：在上述目录放置若干图片文件（jpg/png/gif）。

#### 退群通知

- 事件：成员退群时自动发送提示消息（含昵称/QQ）。
- 依赖：NapCat HTTP 接口可用。

#### 点赞功能

- 指令：`#赞我`（立即为触发者点赞若干次）。
- 定时：每日 10:00 对 `thumbsUpMe.json` 列表中的 QQ 自动点赞（非会员默认 10 次）。
- 推送：如目标对象配置了 `push: true` 和 `group`，会尝试在私聊推送提示。

### 目录结构（关键）

- `apps/`：功能模块（指令）集合
- `tools/`：路径、版本、配置、SSH、NapCat HTTP 等工具
- `config/`：插件 YAML 配置
- `resources/`：帮助与图片资源
- `data/`：运行期生成/持久化数据（位于 Yunzai 根目录）
  - 插件同名目录下也包含示例数据（如 `thumbsUpMe.json`、`Undercover.json`）

### 开发指引

1) 在 `apps/` 新增模块（继承 `plugin`，编写 `rule` 与处理函数）。
2) 在 `apps/index.js` 中导出并加入默认导出数组，以便插件框架加载。
3) 可使用 `tools/` 中的工具方法：
   - `pluginPath`、`rootPath`、`dataPath`
   - `cfgdata`（读写 `config/cfg.yaml`）
   - `sshData`（读写/校验 `sshInfo.json`）
   - `versionInfo`（读取 `package.json` 元信息）

### 常见问题

- 指令提示“仅主人可用”/无响应：检查主人判定与群号是否在 `denylist`。
- `#memenew` 执行失败：核对 `sshInfo.json`，以及服务器是否具备 git 与 systemd 权限。
- OpenCommand 失败：确认服务端插件与接口可用，`host/token` 正确配置。

### 鸣谢

- [miao-plugin](https://github.com/yoimiya-kokomi/miao-plugin) — 优秀的 Yunzai-Bot 插件架构参考。

### 许可证

本项目使用 ISC 许可证发布。


