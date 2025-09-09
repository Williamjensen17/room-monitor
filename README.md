# Room Monitor Dashboard

A lightweight Node.js + WebSocket server with a web UI to display **sensor data (temp, humidity)** and **real BTC/ETH prices & charts**.

---

## 🚀 Quick Install (fresh Ubuntu Server)

```bash
bash <(curl -s https://raw.githubusercontent.com/YOUR_USERNAME/room-monitor/main/scripts/install.sh)
```

- Installs Node.js, NPM, PM2
- Clones repo and runs server
- Opens HTTP port 80

Then visit: `http://YOUR_SERVER_IP`

---

## 🔄 Upgrade Existing Installation

```bash
cd ~/room-monitor/scripts
bash upgrade.sh
```

This pulls the latest GitHub commit and restarts.

---

## 🗂 Repo Structure

- `server.js` – Node.js backend
- `public/index.html` – Dashboard frontend
- `scripts/install.sh` – Fresh install script
- `scripts/upgrade.sh` – Update/upgrade script

---

## 🛠 Requirements

- Ubuntu 20.04+ (server, not desktop/kiosk)
- Internet access
- At least Node.js LTS installed (auto-handled)

---
