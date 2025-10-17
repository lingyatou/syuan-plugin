import lodash from 'lodash'
import { cfgdata, pluginPath } from "./tools/index.js"
import path from 'path'

/**
 * 支持锅巴
 * 锅巴插件：https://gitee.com/guoba-yunzai/guoba-plugin.git
 */

export function supportGuoba() {
  let allGroup = []
  Bot.gl.forEach((v, k) => {
    k != 'stdin' && allGroup.push({ label: `${v.group_name}(${k})`, value: k })
  })

  return {
    pluginInfo: {
      name: 'syuan-plugin',
      title: 'syuan插件',
      author: '@源syuan',
      authorLink: 'https://github.com/lingyatou',
      link: 'https://github.com/lingyatou/syuan-plugin',
      isV3: true,
      description: '自用工具插件',
      iconPath: path.join(pluginPath, 'resources', '1212.webp'),
    },

    // 配置项信息
    configInfo: {
      schemas: [
        {
          component: "Divider",
          label: "群组白名单与黑名单"
        },
        {
          field: 'config.allowlist',
          label: '白名单群聊',
          bottomHelpMessage: '仅允许这些群使用插件功能',
          component: 'Select',
          componentProps: {
            allowAdd: true,
            allowDel: true,
            mode: 'multiple',
            options: allGroup
          },
        },
        {
          field: 'config.denylist',
          label: '黑名单群聊',
          bottomHelpMessage: '禁止这些群使用插件功能',
          component: 'Select',
          componentProps: {
            allowAdd: true,
            allowDel: true,
            mode: 'multiple',
            options: allGroup
          },
        },

        {
          component: "Divider",
          label: "AI配置"
        },
        {
          field: 'config.aiInclude',
          label: 'AI开启群聊',
          bottomHelpMessage: '默认全部关闭',
          component: 'Select',
          componentProps: {
            allowAdd: true,
            allowDel: true,
            mode: 'multiple',
            options: allGroup
          },
        },
        {
          field: 'config.chatLong',
          label: '对话长度',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 0,
            max: 100,
          }
        },
        {
          field: 'config.temperature',
          label: '随机温度 (temperature)',
          bottomHelpMessage: '控制AI输出随机性，越高越有创造力，越低越稳定',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 0,
            max: 2,
            step: 0.1
          }
        },

        {
          component: "Divider",
          label: "Embedding配置"
        },
        {
          field: 'config.Embedding.apiKey',
          label: 'Embedding API-Key',
          bottomHelpMessage: '前往 https://api.bltcy.ai/ 购买 api-key',
          component: 'Input',
        },
        {
          field: 'config.Embedding.baseURL',
          label: 'Embedding baseURL',
          component: 'Input',
        },
        {
          field: 'config.Embedding.model',
          label: 'Embedding 模型名',
          component: 'Input',
        },

        {
          component: "Divider",
          label: "Chat配置"
        },
        {
          field: 'config.Chat.apiKey',
          label: 'Chat API-Key',
          bottomHelpMessage: '前往 https://platform.deepseek.com/ 购买 api-key',
          component: 'Input',
        },
        {
          field: 'config.Chat.baseURL',
          label: 'Chat baseURL',
          component: 'Input',
        },
        {
          field: 'config.Chat.model',
          label: 'Chat 模型名',
          component: 'Input',
        },
        {
          field: 'config.Chat.index',
          label: 'Chat 模型索引',
          component: 'InputNumber',
          componentProps: { min: 0, max: 10 }
        },

        {
          component: "Divider",
          label: "阿里云配置"
        },
        {
          field: 'config.aliyun.instanceId',
          label: '实例ID',
          component: 'Input'
        },
        {
          field: 'config.aliyun.regionId',
          label: '地域ID',
          component: 'Input'
        },
        {
          field: 'config.aliyun.accessKeyId',
          label: 'AccessKeyId',
          component: 'Input'
        },
        {
          field: 'config.aliyun.accessKeySecret',
          label: 'AccessKeySecret',
          component: 'InputPassword'
        },
        {
          field: 'config.aliyun.plublicIp',
          label: '公网IP',
          component: 'Input'
        },
        {
          field: 'config.aliyun.webuiPort',
          label: 'WebUI端口',
          component: 'InputNumber',
          componentProps: { min: 1, max: 65535 }
        },
      ],

      // 获取配置数据方法
      getConfigData() {
        return {
          config: cfgdata.loadCfg()
        }
      },

      // 设置配置的方法
      setConfigData(data, { Result }) {
        let config = {}
        for (let [keyPath, value] of Object.entries(data)) {
          lodash.set(config, keyPath, value)
        }
        cfgdata.saveCfg(config.config)
        return Result.ok({}, '保存成功~')
      }
    },
  }
}

