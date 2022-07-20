function Init(cnc) {
    const Handler = async (msg) => {
        console.log("cnc processor: ");
        console.log(msg);
        await cnc[msg.command](msg.data);
    }
    return {
        Handler,
        Queue: "cnc_request"
    }
}

module.exports = {
    Init
}