const process = require("process")
const cnccontrol = require("../nodelib/cnccontrol")


async function main(pos) {
    const machine = await cnccontrol.Connect();
    const config = await machine.GetPrinterConfig();

    console.log(config);

    console.log(pos)
    await machine.Move(parseFloat(pos),0,0);
}

main(process.argv[2])