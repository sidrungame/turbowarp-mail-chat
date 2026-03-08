const WebSocket = require("ws");
const express = require("express");

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

let lastClient = null;

const server = app.listen(port, () => {
  console.log("Serveur démarré");
});

const wss = new WebSocket.Server({ server });

console.log("WebSocket prêt");

// connexion turbowarp
wss.on("connection", ws => {

  console.log("Client TurboWarp connecté");

  lastClient = ws;

  ws.on("message", async data => {

    const message = data.toString();

    console.log("Message TurboWarp:", message);

    await sendEmail(message);

  });

});

async function sendEmail(message){

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "chat@resend.dev",
      to: process.env.EMAIL,
      subject: "Message TurboWarp",
      text: message,
      reply_to: "reply@tondomaine.com"
    })
  });

}

// webhook réponse email
app.post("/reply", (req,res)=>{

  const reply = req.body.text;

  console.log("Réponse email:", reply);

  if(lastClient){
    lastClient.send(reply);
  }

  res.send("ok");

});
