const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

let playerX = null;
let playerO = null;

wss.on('connection', (ws) => {
  // שיוך שחקן פנוי
  if (!playerX) {
    playerX = ws;
    ws.playerSymbol = 'X';
  } else if (!playerO) {
    playerO = ws;
    ws.playerSymbol = 'O';
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
    ws.close();
    return;
  }

  // שלח הודעת welcome עם התפקיד
  ws.send(JSON.stringify({ type: 'welcome', symbol: ws.playerSymbol }));
  console.log(`🔗 שחקן ${ws.playerSymbol} התחבר`);

  ws.on('message', (msg) => {
    try {
      // פענוח ההודעה שהתקבלה
      const data = JSON.parse(msg);
      console.log(`📨 קיבלתי מ-${ws.playerSymbol}:`, data);

      // שליחה לשחקן השני
      const otherPlayer = ws === playerX ? playerO : playerX;
      if (otherPlayer && otherPlayer.readyState === WebSocket.OPEN) {
        otherPlayer.send(JSON.stringify(data));
        console.log(`➡️ שלחתי ל-${otherPlayer.playerSymbol}:`, data);
      }
    } catch (e) {
      console.error('❌ שגיאה בפענוח ההודעה מהלקוח:', e.message);
    }
  });

  ws.on('close', () => {
    console.log(`❌ שחקן ${ws.playerSymbol} התנתק`);
    if (ws === playerX) playerX = null;
    if (ws === playerO) playerO = null;
  });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
});
