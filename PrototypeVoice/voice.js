const messageq = require('../nodelib/messageq')
const cnccontrol = require("../nodelib/cnccontrol")
const wordsToNumbers = require("words-to-numbers").wordsToNumbers;

function parseMove(move) {
    console.log(move);
    const direction = move.shift();

    const directions = ["left", "right", "forward", "back", "up", "down"];
    const axes = ["x", "x", "y", "y", "z", "z"];

    if (directions.indexOf(direction) === -1) {
        throw new Error("Invalid direction: " + direction);
    }
    const axis = axes[directions.indexOf(direction)];

    let sign = 1;
    if (direction === "left" || direction === "back" || direction === "down") {
        sign = -1;
    }

    // look for unit index
    const units = ["millimeters", "centimeters", "inches","millimeter","centimeter","inch"];
    const multipliers = [1, 10, 25.4, 1, 10, 25.4];
    let unitIndex = -1;
    for (let i = 0; i < move.length; i++) {
        if (units.includes(move[i])) {
            unitIndex = i;
            break;
        }
    }
    if (unitIndex === -1) {
        throw new Error("No unit found");
    }

    const unit = move[unitIndex];
    console.log(`Unit: ${unit}`);
    const multiplier = multipliers[units.indexOf(unit)];
    console.log(`Multiplier: ${multiplier}`);

    // Distance is from 0 to unitIndex
    const numbermap = {
        "to": "two"
    }
    const distancewords = move
        .slice(0, unitIndex)
        .map(n => numbermap[n] ? numbermap[n] : n);
        
    console.log(`Distancewords: ${distancewords}`);
    const distance = wordsToNumbers(distancewords
        .join(' '));
    console.log(`Distance: ${distance}`);

    const data = {};
    data[axis] = sign * distance * multiplier;
    for (const a of ["x", "y", "z"]) {
        if (!data[a]) {
            data[a] = 0;
        }
    }

    return {
        command: "Move",
        data: data
    }
}


function parse(words) {
    words = words.slice();
    // Look for our keyword
    const startword = "alexander";
    while (words.length > 0 && words[0] !== startword) {
        words.shift();
    }
    if (words[0] !== startword) {
        return null;
    }
    // Remove the keyword
    words.shift();
    const command = words[0];
    words.shift();
    switch (command) {
        case "move":
            return parseMove(words);
            break;
        case "moved":
            return parseMove(words);
            break;
        default:
            throw("Unknown command: " + command);
    }
}

async function main() {
    const q = await messageq.connect();
    const cnc = await cnccontrol.Connect();

    const receive = await q.queue("vosk", async (m) => {
        //console.log(m.content.toString())

        const content = JSON.parse(m.content);
        if (content.result) {
            try {
                let command = parse(content.result.map(r => r.word));
                console.log(command);
                await cnc[command.command](command.data);
            } catch (e) {
                console.log(e);
            }
        }

        m.ack();
    }, true);
console.log("Ready")
}

main();