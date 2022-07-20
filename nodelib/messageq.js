const amqp = require('amqplib')

async function connect() {
    const conn = await amqp.connect('amqp://rabbitmq')
    const ch = await conn.createChannel()

    const known_queues = {}

    const queue = async (q, receive, clear = false) => {
        if (clear) {
            await ch.deleteQueue(q)
        }
        if(!known_queues[q]) {
            await ch.assertQueue(q, { durable: false })
            known_queues[q] = true
        }

        let consumetag = await ch.consume(q, m => {
            if(!m) {
                return;
            }
            m.ack = () => {
                ch.ack(m);
            }
            receive(m)
        });

        const stop = async () => {
            await ch.cancel(consumetag.consumerTag)
        }
        const close = async () => {
            await ch.close()
        }

        return {
            stop,
            close
        }
    }
    
    const SendQueue = async (q, content_string) => {
        if(!known_queues[q]) {
            await ch.assertQueue(q, { durable: false })
            known_queues[q] = true
        }
        await ch.sendToQueue(q, Buffer.from(content_string))
    }

    return {
        queue,
        SendQueue
    }
}

module.exports = {
    connect
}