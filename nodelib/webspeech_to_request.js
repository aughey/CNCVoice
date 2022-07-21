function Handler(content) {
    {
        // go straight to the NL processor
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