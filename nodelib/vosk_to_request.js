function Handler(content) {
    // Only pass on something if there is a result
    if (content.result) {
        return {
            queue: "voice_request",
            content: {
                request: content.result.map(r => r.word).join(' ')
            }
        }
    }
}

module.exports = {
    Handler: Handler,
    Queue: "vosk"
}