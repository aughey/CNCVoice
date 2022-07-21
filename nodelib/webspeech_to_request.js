function Handler(content) {
    {
        // go straight to the NL processor
        // put a space between number followed by letter
        content.transcript = content.transcript.replace(/([0-9])([a-zA-Z])/,"$1 $2");
        console.log("Got webspeech request: " + content.transcript);
        return {
            queue: "nl_request",
            content: {
                request: content.transcript
            }
        }
    }
}

module.exports = {
    Handler: Handler,
    Queue: "webspeech"
}