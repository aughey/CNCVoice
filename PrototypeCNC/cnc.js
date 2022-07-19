const cnccontrol = require("../nodelib/cnccontrol")

async function main() {
    const machine = await cnccontrol.Connect();
    const ping = await machine.GetPrinterConfig();
    console.log(ping);
}

main();