const amqp = require('amqplib')
const messageq = require('../nodelib/messageq')

async function receive() {
    const q = await messageq.connect();

    const receive = q.queue("vosk", async (m) => {
        console.log(m.content.toString())
        m.ack();
    });
}


async function main() {
    const conn = await amqp.connect('amqp://rabbitmq')
    const ch = await conn.createChannel()
    const q = 'hello'
    await ch.assertQueue(q, {durable: false})

    receive(conn);

    await ch.sendToQueue(q, Buffer.from('Hello World!'))
    console.log('Sent "Hello World!"')
    await ch.close()
    //await conn.close()
}

main();