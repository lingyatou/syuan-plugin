import { callNapcat } from '../tools/index'

export class test extends plugin {
    constructor() {
        super({
            name: 'Syuan工具包[测试]',
            dsc: 'Syuan工具包',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: '^#测试$',
                    fnc: 'test'
                }
            ]
        })
    }

    async test(e) {
        var data = JSON.stringify({
            "user_id": "3046595434",
            "group_id": "543541975",
            "message": [
                {
                    "type": "text",
                    "data": {
                        "text": "napcat"
                    }
                }
            ]
        })
        e.reply(callNapcat('send_private_msg', {
            data: data
        }))
    }

}