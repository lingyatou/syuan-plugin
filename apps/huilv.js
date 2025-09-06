const axios = require('axios'); // npm install axios

// 基本参数配置
const apiUrl = 'http://op.juhe.cn/onebox/exchange/currency';  // 接口请求URL
const apiKey = '您申请的调用APIkey';  // 在个人中心->我的数据,接口名称上方查看

// 接口请求入参配置
const requestParams = {
    key: apiKey,
    from: 'xxx',
    to: 'xxx',
    version: 'xxx',
};

// 发起接口网络请求
axios.get(apiUrl, { params: requestParams })
    .then(response => {
        // 解析响应结果
        if (response.status === 200) {
            const responseResult = response.data;
            // 网络请求成功。可依据业务逻辑和接口文档说明自行处理。
            console.log(responseResult);
        } else {
            // 网络异常等因素，解析结果异常。可依据业务逻辑自行处理。
            console.log('请求异常');
        }
    })
    .catch(error => {
        // 网络请求失败，可以根据实际情况进行处理
        console.log('网络请求失败:', error);
    });