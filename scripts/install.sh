#!/bin/bash
set -e

echo "🚀 Installing Room Monitor from scratch..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js LTS
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install PM2 global
sudo npm install -g pm2

# Clone the repo if not already present
if [ ! -d "$HOME/room-monitor" ]; then
  git clone https://github.com/YOUR_USERNAME/room-monitor.git ~/room-monitor
fi

cd ~/room-monitor

# Install node dependencies
npm install

# Allow HTTP traffic on port 80
if command -v ufw &>/dev/null; then
  sudo ufw allow 80 || true
fi

# Start with PM2
sudo pm2 start server.js --name "room-monitor" -f
sudo pm2 startup -y
sudo pm2 save

echo "✅ Installation complete!"
echo "Now open: http://YOUR_SERVER_IP"
