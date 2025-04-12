const express = require('express');
const app = express();
const port = 3000;

app.get('/ping', (req, res) => {
  console.log("🏓 Ping ricevuto");
  res.send("Pong!");
});

app.listen(port, () => {
  console.log(`✅ Server di test su http://localhost:${port}`);
});
