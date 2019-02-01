import Axios from 'axios';

const axiosInstance = Axios.create({
    timeout: 3000,
});

const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A356 Safari/604.1';
const headers = {
    'User-Agent' : userAgent,
};

async function main() {
    let resp = await axiosInstance.get('https://m.weibo.cn/profile/info?uid=5786332015', {headers});
    console.log(resp.data.data.statuses[2]);
}

main();