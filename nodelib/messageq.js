const amqp = require('amqplib')

async function connect() {
    const conn = await amqp.connect('amqp://rabbitmq')
    const ch = await conn.createChannel()

    const queue = async (q, receive, clear = false) => {
        if (clear) {
            await ch.deleteQueue(q)
        }
        await ch.assertQueue(q, { durable: false })

        let consumetag = await ch.consume(q, m => {
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

    return {
        queue
    }
}

module.exports = {
    connect
}