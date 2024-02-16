import { WebSocketServer } from "ws";
import fs from "fs/promises";

const wss = new WebSocketServer({ port: 9000 });

const sendTo = (connection, message) => {
  connection.send(JSON.stringify(message));
};

wss.on("connection", (ws) => {
  ws.on("message", async (msg) => {
    let data;

    //accepting only JSON messages
    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.log("Invalid JSON");
      data = {};
    }
    const { type, ...rest } = data;

    switch (type) {
      case "to-file":
        {
          appendDataToFile(JSON.stringify(data));
          sendTo(ws, {
            type: "listening",
            success: true,
            message: "I'm still listeninng",
          });
        }
        break;
      case "offer":
        // Handle offer
        break;
      case "answer":
        // Handle answer
        break;
      case "candidate":
        // Handle new ICE candidate
        break;
      default:
        sendTo(ws, {
          type: "error",
          message: "Command not found: " + type,
        });
        break;
    }

    console.log(type, rest);
  });

  ws.send(
    JSON.stringify({
      type: "connect",
      message: "Well hello there, I am a WebSocket server",
    })
  );
});

async function appendDataToFile(data) {
  try {
    const filePath = "./server/listening-file.json";

    await fs.appendFile(filePath, `${performance.now()}: ${data},\n`, "utf8");
  } catch (err) {
    console.log(err.message);
  }
}
