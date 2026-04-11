#!/bin/bash
# WhatsApp Chat Dashboard — VPS Deployment Guide
# ================================================

set -e

echo "=== WhatsApp Chat Dashboard Deployment ==="

# 1. Prerequisites
echo "Ensure these are installed: Node.js 18+, MongoDB, Nginx, Certbot"

# 2. Clone/pull the latest code
# git pull origin main

# 3. Backend setup
echo "Setting up backend..."
cd backend
cp .env.example .env
echo ">>> Edit backend/.env with your actual values!"
npm install --production
cd ..

# 4. Frontend setup
echo "Building frontend..."
cd frontend
cp .env.example .env
echo ">>> Edit frontend/.env with your production API URLs!"
npm install
npm run build
cd ..

# 5. Copy frontend build to web root
echo "Deploying frontend..."
sudo mkdir -p /var/www/whatsapp-chat/frontend
sudo cp -r frontend/dist /var/www/whatsapp-chat/frontend/

# 6. Nginx config
echo "Configuring Nginx..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/whatsapp-chat
sudo ln -sf /etc/nginx/sites-available/whatsapp-chat /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. SSL certificates (run once)
# sudo certbot --nginx -d chat.yourdomain.com -d chat-api.yourdomain.com

# 8. Start backend with systemd (create this service file)
echo "Setting up backend service..."
cat << 'EOF' | sudo tee /etc/systemd/system/whatsapp-chat.service
[Unit]
Description=WhatsApp Chat Dashboard API
After=network.target mongod.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/whatsapp-chat/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable whatsapp-chat
sudo systemctl start whatsapp-chat

echo "=== Deployment complete ==="
echo ""
echo "IMPORTANT POST-DEPLOYMENT STEPS:"
echo "1. Update backend/.env with production values"
echo "2. Update frontend/.env with production API URL"
echo "3. Set your Meta webhook URL to: https://chat-api.yourdomain.com/api/webhook"
echo "4. Ensure ports 80/443 are open in firewall"
echo "5. Run: sudo certbot --nginx for SSL"
echo "6. Create your admin user via /api/auth/register"
