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
  `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/reply`;

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

Répondre ici :
${replyLink}`
    })
  });

}

// page pour écrire la réponse
app.get("/reply",(req,res)=>{

res.send(`
<h2>Répondre au message TurboWarp</h2>
<form action="/send">
<input name="msg" placeholder="Ta réponse">
<button type="submit">Envoyer</button>
</form>
`);

});

// envoyer la réponse
app.get("/send",(req,res)=>{

  const reply = req.query.msg;

  if(client){
    client.send(reply);
  }

  res.send("Réponse envoyée au client TurboWarp");

});
