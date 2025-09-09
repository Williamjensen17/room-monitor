#!/bin/bash
set -e

echo "🔄 Upgrading Room Monitor..."

cd ~/room-monitor || { echo "❌ Not installed in ~/room-monitor"; exit 1; }

# Fetch new code
git fetch --all
git reset --hard origin/main

# Reinstall dependencies
npm install

# Restart service
sudo pm2 restart room-monitor

echo "✅ Upgrade complete!"
