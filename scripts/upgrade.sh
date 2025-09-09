#!/bin/bash
set -e

echo "🔄 Upgrading Room Monitor..."

# Go to repo
cd ~/room-monitor || { echo "❌ Room Monitor not installed at ~/room-monitor"; exit 1; }

# Pull the latest version
git fetch --all
git reset --hard origin/main

# Install updates to dependencies if any
npm install

# Restart service
sudo pm2 restart room-monitor

echo "✅ Upgrade complete!"
