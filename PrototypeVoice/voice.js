const messageq = require('../nodelib/messageq')
const cnccontrol = require("../nodelib/cnccontrol");

function InitLibrary(library) {
    if (library.Init) {
        return library.Init();
    } else {
        return library;
    }
}

async function LoadHandler(handler) {
    var library;
    if (typeof (handler) === "string") {
        library = require(`../nodelib/${handler}`);
    } else if (typeof (handler) === "function") {
        library = await handler();
    }
    return InitLibrary(library);
}

async function main() {
    const q = await messageq.connect();
    //const cnc = await cnccontrol.Connect();

    const handlers = "webspeech_to_request voice_request_processor nl_processor".split(' ');

    handlers.push(async () => {
        const cnc = await cnccontrol.Connect();
        console.log("Connected to CNC: " + cnc.Name())
        return require("../nodelib/cnc_processor").Init(cnc);
    })

    for (const handler of handlers) {
        console.log("Loading handler library: " + handler);
        const handle = await LoadHandler(handler);

        await q.queue(handle.Queue, async (m) => {
            const content = JSON.parse(m.content);
            var ret;
            try {
                ret = await handle.Handler(content);
            } catch (e) {
                console.log(e.message)
                return
            }
            if (ret ?.queue) {
                var tosend = ret.content;
                if (typeof (tosend) !== "string") {
                    tosend = JSON.stringify(tosend);
                }
                await q.SendQueue(ret.queue, tosend);
            }
            m.ack();
        }, true);
    }

    // const receive = await q.queue("vosk", async (m) => {
    //     //console.log(m.content.toString())

    //     const content = JSON.parse(m.content);
    //     if (content.result) {
    //         try {
    //             let command = parse(content.result.map(r => r.word));
    //             console.log(command);
    //             await cnc[command.command](command.data);
    //         } catch (e) {
    //             console.log(e);
    //         }
    //     }

    //     m.ack();
    // }, true);
    console.log("Ready")
}

main();