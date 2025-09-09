const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");
const https = require("https");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve UI + widget JS apps
app.use(express.static("public"));
app.use("/apps", express.static(path.join(__dirname, "public/apps")));

// === APP STORE ENDPOINT ===
app.get("/api/apps", (req, res) => {
  const appsDir = path.join(__dirname, "apps");
  fs.readdir(appsDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot read apps dir" });
    const apps = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const data = fs.readFileSync(path.join(appsDir, f), "utf8");
        return JSON.parse(data);
      });
    res.json(apps);
  });
});

// === SENSOR STUB ===
function getSensorData() {
  return {
    temperature: (20 + Math.random() * 10).toFixed(1),
    humidity: (40 + Math.random() * 20).toFixed(1),
    timestamp: Date.now(),
  };
}

// === CRYPTO (BTC+ETH) ===
let cryptoHistory = {
  bitcoin: [],
  ethereum: [],
  timestamps: [],
};

async function getCryptoPrices() {
  return new Promise((resolve) => {
    const url =
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";

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

            if (cryptoHistory.bitcoin.length > 500) {
              cryptoHistory.bitcoin.shift();
              cryptoHistory.ethereum.shift();
              cryptoHistory.timestamps.shift();
            }

            resolve({
              ...parsed,
              history: cryptoHistory,
            });
          } catch {
            resolve({
              bitcoin: { usd: 0 },
              ethereum: { usd: 0 },
              history: cryptoHistory,
            });
          }
        });
      })
      .on("error", () => {
        resolve({
          bitcoin: { usd: 0 },
          ethereum: { usd: 0 },
          history: cryptoHistory,
        });
      });
  });
}

// === SPOTIFY (Stub) ===
function getSpotifyStatus() {
  return {
    track: "No track (demo)",
    artist: "—",
    playing: false,
  };
}

// APIs
app.get("/api/temp", (req, res) => res.json(getSensorData()));
app.get("/api/crypto", async (req, res) => {
  res.json(await getCryptoPrices());
});
app.get("/api/spotify", (req, res) => res.json(getSpotifyStatus()));

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

  ws.on("close", () => clearInterval(interval));
});

// Start
const PORT = 80;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Room Monitor running on http://localhost:${PORT}`);
});
