const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");
const https = require("https");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static UI
app.use(express.static("public"));

// === APP STORE ENDPOINT ===
app.get("/api/apps", (req, res) => {
  fs.readFile(path.join(__dirname, "appstore.json"), "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Could not load appstore" });
    res.json(JSON.parse(data));
  });
});

// === SENSOR STUB (Simulated Data) ===
// Replace later with hardware (DHT22, DS18B20, etc.)
function getSensorData() {
  return {
    temperature: (20 + Math.random() * 10).toFixed(1),
    humidity: (40 + Math.random() * 20).toFixed(1),
    timestamp: Date.now(),
  };
}

// === CRYPTO DATA (Bitcoin + Ethereum) ===
let cryptoHistory = {
  bitcoin: [],
  ethereum: [],
  timestamps: [],
};

async function getCryptoPrices() {
  return new Promise((resolve) => {
    const url =
      "https://api.coingecko.com/api/v3/simple/price" +
      "?ids=bitcoin,ethereum" +
      "&vs_currencies=usd" +
      "&include_24hr_change=true";

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            const now = Date.now();
            const btcPrice = parsed.bitcoin?.usd || 0;
            const ethPrice = parsed.ethereum?.usd || 0;

            cryptoHistory.bitcoin.push(btcPrice);
            cryptoHistory.ethereum.push(ethPrice);
            cryptoHistory.timestamps.push(now);

            if (cryptoHistory.bitcoin.length > 100) {
              cryptoHistory.bitcoin.shift();
              cryptoHistory.ethereum.shift();
              cryptoHistory.timestamps.shift();
            }

            resolve({
              ...parsed,
              history: cryptoHistory,
            });
          } catch (e) {
            resolve({ bitcoin: { usd: 0 }, ethereum: { usd: 0 }, history: cryptoHistory });
          }
        });
      })
      .on("error", () => {
        resolve({ bitcoin: { usd: 0 }, ethereum: { usd: 0 }, history: cryptoHistory });
      });
  });
}

// === SPOTIFY (Placeholder, not functional yet) ===
function getSpotifyStatus() {
  return {
    track: "No track (demo placeholder)",
    artist: "—",
    playing: false,
  };
}

// === API Endpoints for each app ===
app.get("/api/temp", (req, res) => {
  res.json(getSensorData());
});

app.get("/api/crypto", async (req, res) => {
  const crypto = await getCryptoPrices();
  res.json(crypto);
});

app.get("/api/spotify", (req, res) => {
  res.json(getSpotifyStatus());
});

// === WebSocket Broadcast ===
wss.on("connection", (ws) => {
  console.log("📡 Client connected");

  const sendData = async () => {
    const sensor = getSensorData();
    const crypto = await getCryptoPrices();
    const spotify = getSpotifyStatus();
    ws.send(JSON.stringify({ sensor, crypto, spotify }));
  };

  sendData();
  const interval = setInterval(sendData, 30000);

  ws.on("close", () => {
    clearInterval(interval);
    console.log("❌ Client disconnected");
  });
});

// === Start server ===
const PORT = 80;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Room Monitor running on http://localhost:${PORT}`);
});
