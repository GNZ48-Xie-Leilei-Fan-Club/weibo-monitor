let Axios = require('axios');
let WebSocketAsPromised = require('websocket-as-promised');
let W3CWebSocket = require('websocket').w3cwebsocket;
let striptags = require('striptags');
let Sentry = require('@sentry/node');
let { SENTRY_DSN_KEY } = require('./local');
let logger = require('./logger')

// Initialize Sentry client
Sentry.init({ dsn: SENTRY_DSN_KEY });

// Config for websocket-as-promised
const wsp = new WebSocketAsPromised('ws://localhost:6700', {
    createWebSocket: url => new W3CWebSocket(url)
});

// Config and instance init for Axios
const axiosInstance = Axios.create({
    timeout: 3000,
});
const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A356 Safari/604.1';
const headers = {
    'User-Agent' : userAgent,
};

// Enums
const AccountNames = {
    HANA: '蕾蕾',
    GNZ48: 'GNZ48',
    SNH48: 'SNH48',
}
const AccountUids = {
    HANA: '5786332015',
    GNZ48: '5675361083',
    SNH48: '2689280541',
}
const GroupChatIds = {
    FanClubOne: 220334609,
    FanClubTwo: 517837042,
    TaskForce: 473360164,
}

// Timestamps
let lastScanTimestamps = {
    [AccountUids.HANA]: Date.now(), // Hana
    [AccountUids.GNZ48]: Date.now(), // GNZ48
    [AccountUids.SNH48]: Date.now(), // SNH48
}

// Post
class Post {
    constructor(created_at, id, text, pics) {
        this.created_at = Date.parse(created_at);
        this.id = id;
        this.text = text;
        this.pics = pics? pics.map(item => new Picture(item.pid, item.large.url)) : null;
    }
}

// Picture
class Picture {
    constructor(pid, url) {
        this.pid = pid;
        this.url = url;
    }
}

async function scanOfficialAccountPost(user_id, user_name) {
    logger.log({ level: 'info', message: 'Scanning official account ' + user_name });
    try {
        let resp = await axiosInstance.get('https://m.weibo.cn/profile/info?uid='+user_id, { headers });
        const thisScanTimestamp = Date.now();
        for (let item of resp.data.data.statuses) {
            let post = new Post(item.created_at, item.id, item.text, null);
            if (post.created_at > lastScanTimestamps[user_id] && post.text.includes('蕾蕾')) {
                await sendWebsocketMessage(user_name + '官博发了一条提到蕾蕾的微博。点击链接查看: https://m.weibo.cn/status/' + post.id);
            }
        }
        lastScanTimestamps[user_id] = thisScanTimestamp;
    } catch(err) {
        logger.log({ level: 'error', message: err });
        Sentry.captureException(err);
    }
}

async function scanMemberPost(user_id, user_name) {
    logger.log({ level: 'info', message: 'Scanning member post' });
    try {
        let resp = await axiosInstance.get('https://m.weibo.cn/profile/info?uid=5786332015', { headers });
        const thisScanTimestamp = Date.now();
        for (let item of resp.data.data.statuses) {
            let post = new Post(item.created_at, item.id, item.text, item.pics);
            if (post.created_at > lastScanTimestamps[user_id]) {
                await sendWebsocketMessage(makeMessage(user_name, post));
            }
        }
        lastScanTimestamps[user_id] = thisScanTimestamp;
    } catch(err) {
        logger.log({ level: 'error', message: err });
        Sentry.captureException(err);
    }
}

function makeMessage(user_name, post) {
    const messageTitle = user_name + '发微博啦~:';
    let picsSection = ''
    if (post.pics) {
        picsSection = post.pics.map(item => `[CQ:image,file=${item.url}]`).join("");
    }
    // Get rid of all html tags for the text
    let textSection = striptags(post.text);
    const footnote = '点击链接查看: https://m.weibo.cn/status/' + post.id
    return messageTitle + '\n\n' + textSection + '\n' + picsSection + '\n' + footnote;
}

async function sendWebsocketMessage(message) {
    const makePayload = (groupChatId) => {
        return {
            action: 'send_group_msg',
            params: {
                group_id: groupChatId,
                message,
            }
        }
    }
    try {
        await wsp.open();
        logger.log({ level: 'info', message: 'Broadcasting message: ' + message });
        Sentry.captureMessage('Broadcasting message: ' + message);
        wsp.send(JSON.stringify(makePayload(GroupChatIds.FanClubOne)));
        wsp.send(JSON.stringify(makePayload(GroupChatIds.FanClubTwo)));
        wsp.send(JSON.stringify(makePayload(GroupChatIds.TaskForce)));
    } catch(err) {
        logger.log({ level: 'error', message: err });
        Sentry.captureException(err);
    } finally {
        await wsp.close();
    }
}

async function main() {
    logger.log({ level: 'info', message: 'Concurrent scan started' });
    let taskPromises = [];
    taskPromises.push(scanMemberPost(AccountUids.HANA, AccountNames.HANA));
    taskPromises.push(scanOfficialAccountPost(AccountUids.GNZ48, AccountNames.GNZ48));
    taskPromises.push(scanOfficialAccountPost(AccountUids.SNH48, AccountNames.SNH48));
    await Promise.all(taskPromises);
}

setInterval(function() {
    main();
}, 60000);
