const axios = require('axios').default;

const base_url = 'http://192.168.86.143:3344'
const infourl = `${base_url}/printer/info`

const Connect = async () => {
    const info = (await axios.get(infourl)).data;
    const printerslug = info.printers[0].slug;
    const apikey = info.apikey;


    const RestCommand = async (command, data) => {
        // http://localhost:3344/printer/api/<slug>?a=<websocket command>&data=<json object properly url-escaped>&apikey=<API key>>
        const url = `${base_url}/printer/api/${printerslug}?a=${command}&data=${encodeURIComponent(JSON.stringify(data))}&apikey=${apikey}`
        console.log(url)
        const response = await axios.get(url);
        return response.data;
    }

    const Ping = async () => {
        return await RestCommand('ping', {});
    }

    const StateList = async () => {
        return await RestCommand('stateList', {});
    }

    const GetPrinterConfig = async () => {
        return await RestCommand('getPrinterConfig', {});
    }

    const Move = async (data) => {
        return await RestCommand('move', {
            x: data.x,
            y: data.y,
            z: data.z,
            speed: 1000
        })
    }

    return {
        Ping,
        StateList,
        GetPrinterConfig,
        Move
    }
}

module.exports = {
    Connect
}