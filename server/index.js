const express = require("express");
const path = require("path");
const { createClient } = require("redis");

const app = express();

let amqpConnection,
  publisherChannel,
  consumerChannel,
  amqpMaxRetries = 3,
  amqpTimeout = 8000;

let redisClient;

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

async function connectRedis() {
  redisClient = createClient({
    url: "redis://redis:6379",
  });
  redisClient.on("error", (err) => {
    throw err;
  });
  await redisClient.connect();
  console.info("Connection established from redis");
}

setTimeout(connectRedis, 8000);

// Check queue and add to redis
setInterval(() => {
  if (consumerChannel) {
    consumerChannel.consume(q, (message) => {
      redisClient.hSet(
        "notifications",
        Date.now().toString(),
        message.content.toString()
      );
      console.info("Consumed", message.content.toString());
    });
  }
}, 4000);

app.get("/", (req, res) => {
  // return res.send("OK");
  return res
    .status(200)
    .header("Content-Type", "text/html")
    .sendFile(path.join(path.resolve(path.dirname("")), "index.html"));
});

app.get("/subscribe", async (req, res) => {
  if (req.headers.accept && req.headers.accept === "text/event-stream")
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });
  setInterval(async () => {
    if (redisClient) {
      const notifs = await redisClient.hGetAll("notifications");
      for (let id in notifs) {
        console.info(`Sending ${id}: ${notifs[id]}`);
        res.write(
          `id: ${id}\n` +
            `event: notification\n` +
            `data: ${notifs[id]}\n\n`
        );
        console.info(`Deleting ${id}: ${notifs[id]}`);
        redisClient.hDel("notifications", id);
      }
    } else {
      console.warn("Redis client not found");
    }
  }, 2000);
});

app.get("/post", async (req, res) => {
  console.log("New Message: " + req.query.msg);
  await publisherChannel.sendToQueue(q, Buffer.from(req.query.msg));
  // res.send("New message: " + req.query.msg);
  res.send("");
});

app.listen(3000, () => {
  console.log("Listening on 3000");
});
