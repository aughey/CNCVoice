

function Handle(msg) {
    const words = msg.request.split(' ');

    const startword = "alexander";
    while (words.length > 0 && words[0] !== startword) {
        words.shift();
    }
    if (words[0] !== startword) {
        return null;
    }
    // Remove the keyword
    words.shift();
    return {
        queue: "nl_request",
        content: {
            request: words.join(' ')
        }
    }
}

module.exports = {
    Handler: Handle,
    Queue: "voice_request"
}