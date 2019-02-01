let Axios = require('axios');
let WebSocketAsPromised = require('websocket-as-promised');
let W3CWebSocket = require('websocket').w3cwebsocket;

const wsp = new WebSocketAsPromised('ws://localhost:6700', {
    createWebSocket: url => new W3CWebSocket(url)
});

const axiosInstance = Axios.create({
    timeout: 3000,
});

const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A356 Safari/604.1';
const headers = {
    'User-Agent' : userAgent,
};

let lastScanTimestamp = Date.now(); 

class Post {
    constructor(created_at, id, text) {
        this.created_at = Date.parse(created_at);
        this.id = id;
        this.text = text;
    }
}

async function main() {
    console.log('Scanning');
    try {
        let resp = await axiosInstance.get('https://m.weibo.cn/profile/info?uid=5786332015', { headers });
        const thisScanTimestamp = Date.now();
        for (let item of resp.data.data.statuses) {
            let post = new Post(item.created_at, item.id, item.text);
            if (post.created_at > lastScanTimestamp) {
                await sendWebsocketMessage(post.id);
            }
        }
        lastScanTimestamp = thisScanTimestamp;
    } catch(err) {
        console.log(err);
    }
    console.log('Scan complete');
}

async function sendWebsocketMessage(messageId) {
    const payload = {
        action: 'send_group_msg',
        params: {
            group_id: 220334609,
            message: '谢蕾蕾发微博啦~点击链接查看: https://m.weibo.cn/status/'+messageId,
        }
    }
    try {
        await wsp.open();
        wsp.send(JSON.stringify(payload));
    } catch(err) {
        console.error(err);
    } finally {
        await wsp.close();
    }
}

setInterval(function() {
    main();
}, 60000);