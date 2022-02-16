const express = require("express");
const path = require("path");
// const { createClient } = require("redis");
const cors = require("cors");

const app = express();

let amqpConnection,
  publisherChannel,
  consumerChannel,
  amqpMaxRetries = 3,
  amqpTimeout = 8000;

const channels = {};

// let redisClient;

const q = "notifications";

async function connectMQ() {
  try {
    amqpConnection = await require("amqplib").connect(
      process.env["AMQP_SERVER"]
    );
    publisherChannel = await amqpConnection.createChannel();
    await publisherChannel.assertQueue(q);

    consumerChannel = await amqpConnection.createChannel();
    await consumerChannel.assertQueue(q);

    console.info("Connection established from rabbitMQ");
    return;
  } catch (e) {
    console.error(e);
    // console.error("Error connecting AMQP Server");
    // console.log("Retrying ");
    if (amqpMaxRetries--) {
      setTimeout(connectMQ, amqpTimeout);
    } else {
      console.error("Failed to establish connection");
      process.exit(1);
    }
  }
}

setTimeout(connectMQ, amqpTimeout);

// async function connectRedis() {
//   redisClient = createClient({
//     url: "redis://redis:6379",
//   });
//   redisClient.on("error", (err) => {
//     throw err;
//   });
//   await redisClient.connect();
//   console.info("Connection established from redis");
// }

// setTimeout(connectRedis, 8000);

// // Check queue and add to redis
setInterval(() => {
  if (consumerChannel) {
    consumerChannel.consume(q, (message) => {
      const [channel, content] = message.content.toString().split(":");

      if (channels[channel]) {
        channels[channel].forEach((res) => {
          res.write(
            `id: ${Date.now()}\n` +
              `event: notification\n` +
              `data: ${content}\n\n`
          );
        });
      }
    });
  }
}, 4000);

app.use(cors());

app.get("/", (req, res) => {
  return res.send("OK");
  // return res
  //   .status(200)
  //   .header("Content-Type", "text/html")
  //   .sendFile(path.join(path.resolve(path.dirname("")), "index.html"));
});

app.get("/subscribe/:channel", (req, res) => {
  if (req.headers.accept && req.headers.accept === "text/event-stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    if (!channels[req.params.channel]) {
      channels[req.params.channel] = [res];
    } else {
      channels[req.params.channel].push(res);
    }

    // console.log(req.params.channel);
    // setInterval(() => {
    //   res.write(
    //     `id: ${Date.now()}\n` +
    //       `event: notification\n` +
    //       `data: ${Date.now()}\n\n`
    //   );
    // }, 2000);
  } else {
    console.log("not supported");
    res.end("Not supported");
  }
});

app.get("/post/:channel", async (req, res) => {
  await publisherChannel.sendToQueue(
    q,
    Buffer.from(req.params.channel + ":" + req.query.msg)
  );
  res.send("Received New message: " + req.query.msg);
});

app.listen(3000, () => {
  console.log("Listening on 3000");
});
