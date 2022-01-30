const express = require("express");
const path = require("path");

const app = express();

let amqpConnection,
  publisherChannel,
  consumerChannel,
  amqpMaxRetries = 3,
  amqpTimeout = 8000;

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

app.get("/", (req, res) => {
  // return res.send("OK");
  return res
    .status(200)
    .header("Content-Type", "text/html")
    .sendFile(path.join(path.resolve(path.dirname("")), "index.html"));
});

app.get("/subscribe", (req, res) => {
  if (req.headers.accept && req.headers.accept === "text/event-stream")
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

  req.on("close", () => {
    console.log("closed conn");
  });

  consumerChannel.consume(q, (message) => {
    // console.log(message.content.toString());
    res.write(
      `id: ${Date.now()}\ndata: ${new Date().toLocaleTimeString()}\nevent: update\ndata: ${message.content.toString()}\n\n`
    );
  });

  // res.send("SENT");
});

app.get("/post", async (req, res) => {
  console.log(req.query.msg);
  await publisherChannel.sendToQueue(q, Buffer.from(req.query.msg));
  res.send(req.query.msg);
});

app.listen(3000, () => {
  console.log("Listening on 3000");
});
