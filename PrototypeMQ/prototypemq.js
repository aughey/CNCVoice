const amqp = require('amqplib')

async function receive(conn) {
    const ch = await conn.createChannel()
    const q = 'hello'
    await ch.assertQueue(q)
    await ch.consume(q, async (m) => {
        console.log(m.content.toString())
        await ch.ack(m)
        await ch.close();
        await conn.close();
    });
    
}


async function main() {
    const conn = await amqp.connect('amqp://rabbitmq')
    receive(conn);
    const ch = await conn.createChannel()
    const q = 'hello'
    await ch.assertQueue(q)
    await ch.sendToQueue(q, Buffer.from('Hello World!'))
    console.log('Sent "Hello World!"')
    await ch.close()
    //await conn.close()
}

main();