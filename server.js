const WebSocket = require("ws");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

let client = null;

const server = app.listen(port, () => {
  console.log("Serveur démarré");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", ws => {

  console.log("Client TurboWarp connecté");

  client = ws;

  ws.on("message", async data => {

    const message = data.toString();

    console.log("Message reçu :", message);

    await sendEmail(message);

  });

});

async function sendEmail(message){

  const replyLink =
  `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/reply?msg=`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: process.env.EMAIL,
      subject: "Message TurboWarp",
      text:
`Message reçu :

${message}

Répondre :
${replyLink}TA_REPONSE`
    })
  });

}

app.get("/reply",(req,res)=>{

  const reply = req.query.msg;

  if(client){
    client.send(reply);
  }

  res.send("Réponse envoyée au client TurboWarp");

});
