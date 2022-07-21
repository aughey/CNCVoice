const wordsToNumbers = require("words-to-numbers").wordsToNumbers;

function parseMove(move) {
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
    const units = ["millimeters", "centimeters", "inches", "millimeter", "centimeter", "inch", "in","cm","mm","ml"];
    const multipliers = [1, 10, 25.4, 1, 10, 25.4, 25.4, 10, 1, 1];
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
//    console.log(`Unit: ${unit}`);
    const multiplier = multipliers[units.indexOf(unit)];
  //  console.log(`Multiplier: ${multiplier}`);

    // Distance is from 0 to unitIndex
    const numbermap = {
        "to": "two",
        "for": "four"
    }
    const distancewords = move
        .slice(0, unitIndex)
        .map(n => numbermap[n] ? numbermap[n] : n);

    //console.log(`Distancewords: ${distancewords}`);
    const distance = wordsToNumbers(distancewords
        .join(' '));
   // console.log(`Distance: ${distance}`);

    const data = {};
    data[axis] = sign * distance * multiplier;
    for (const a of ["x", "y", "z"]) {
        if (!data[a]) {
            data[a] = 0;
        }
    }

    return {
        queue: "cnc_request",
        content: {
            command: "Move",
            data: data
        }
    }
}

function Handle(msg) {
    const words = msg.request.toLowerCase().split(' ');

    const movewords = "move moved vote blue blew".split(' ');

    const command = words[0];

    if (movewords.includes(command)) {
        words.shift();
        return parseMove(words);
    }

    throw Error("Unknown command: " + command);
}

module.exports = {
    Handler: Handle,
    Queue: "nl_request"
}