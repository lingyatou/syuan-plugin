import axios from 'axios'
const apiEndpoint = 'http://127.0.0.1:3000'
export class cs extends plugin {
  constructor() {
    super({
      name: '测试',
      dsc: '测试',
      event: 'notice.group.poke',
      priority: 50,
      rule: [{
        reg: '',
        fnc: 'tes'
      }]
    })
  }

  async tes(e) {
    const targetId = e.user_id;
    const groupId = e.group_id;
    await axios.post(apiEndpoint + `/group_poke`, {
      group_id: groupId,
      user_id: targetId
    }).catch(() => { });
    e.reply(`poke测试`)
  }
}