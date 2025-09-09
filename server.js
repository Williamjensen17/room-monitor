const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));
app.use(express.json());

// Store more detailed historical crypto data
let cryptoHistory = {
  bitcoin: [],
  ethereum: [],
  timestamps: []
};

// Store detailed price history for charts (up to 24 hours)
let detailedHistory = {
  bitcoin: [],
  ethereum: [],
  timestamps: []
};

function getSensorData() {
  return {
    temperature: (20 + Math.random() * 10).toFixed(1),
    humidity: (40 + Math.random() * 20).toFixed(1),
    timestamp: Date.now()
  };
}

async function getCryptoPrices() {
  try {
    const https = require('https');
    return new Promise((resolve) => {
      const req = https.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true',
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              
              const now = Date.now();
              const btcPrice = parsed.bitcoin?.usd || 0;
              const ethPrice = parsed.ethereum?.usd || 0;
              
              // Store in short history (last 50 points for main chart)
              cryptoHistory.bitcoin.push(btcPrice);
              cryptoHistory.ethereum.push(ethPrice);
              cryptoHistory.timestamps.push(now);
              
              if (cryptoHistory.bitcoin.length > 50) {
                cryptoHistory.bitcoin.shift();
                cryptoHistory.ethereum.shift();
                cryptoHistory.timestamps.shift();
              }
              
              // Store in detailed history (last 288 points = 24 hours at 5min intervals)
              detailedHistory.bitcoin.push(btcPrice);
              detailedHistory.ethereum.push(ethPrice);
              detailedHistory.timestamps.push(now);
              
              if (detailedHistory.bitcoin.length > 288) {
                detailedHistory.bitcoin.shift();
                detailedHistory.ethereum.shift();
                detailedHistory.timestamps.shift();
              }
              
              resolve({
                ...parsed,
                history: cryptoHistory,
                detailedHistory: detailedHistory
              });
            } catch {
              resolve({ 
                bitcoin: { usd: 0, usd_24h_change: 0, last_updated_at: 0 }, 
                ethereum: { usd: 0, usd_24h_change: 0, last_updated_at: 0 },
                history: cryptoHistory,
                detailedHistory: detailedHistory
              });
            }
          });
        }
      );
      req.on('error', () => resolve({ 
        bitcoin: { usd: 0, usd_24h_change: 0, last_updated_at: 0 }, 
        ethereum: { usd: 0, usd_24h_change: 0, last_updated_at: 0 },
        history: cryptoHistory,
        detailedHistory: detailedHistory
      }));
      req.setTimeout(10000, () => req.destroy());
    });
  } catch {
    return { 
      bitcoin: { usd: 0, usd_24h_change: 0, last_updated_at: 0 }, 
      ethereum: { usd: 0, usd_24h_change: 0, last_updated_at: 0 },
      history: cryptoHistory,
      detailedHistory: detailedHistory
    };
  }
}

// API endpoint for detailed crypto data
app.get('/api/crypto/:coin', (req, res) => {
  const coin = req.params.coin.toLowerCase();
  if (coin !== 'bitcoin' && coin !== 'ethereum') {
    return res.status(400).json({ error: 'Invalid coin' });
  }
  
  res.json({
    coin: coin,
    prices: detailedHistory[coin],
    timestamps: detailedHistory.timestamps,
    currentPrice: detailedHistory[coin][detailedHistory[coin].length - 1] || 0
  });
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  const sendData = async () => {
    const sensor = getSensorData();
    const crypto = await getCryptoPrices();
    ws.send(JSON.stringify({ sensor, crypto }));
  };
  
  sendData();
  const interval = setInterval(sendData, 30000); // Update every 30 seconds
  
  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

const PORT = 80;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
