const cnccontrol = require("../nodelib/cnccontrol")


async function main(pos) {
    const machine = await cnccontrol.Connect();
    const ping = await machine.GetPrinterConfig();
    console.log(ping);
    console.log(pos)
}

main(process.args[2])