# Room Monitor

A lightweight Node.js + WebSocket server with a web UI to display **room sensors** (temperature & humidity) and **live Bitcoin/Ethereum data**.

---

## 🚀 Quick Install (Fresh Ubuntu)

```bash
bash <(curl -s https://raw.githubusercontent.com/Williamjensen17/room-monitor/main/scripts/install.sh)
```

## 🔄 Upgrade Existing Install

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
