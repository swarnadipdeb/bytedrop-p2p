#!/bin/bash

# bytedrop VPS Setup Script
# This script sets up Bytedrop on a fresh Ubuntu/Debian VPS

# Exit on any error
set -e

echo "=== bytedrop VPS Setup Script ==="
echo "This script will install Java, Node.js, Nginx, and set up Bytedrop."

# Update system
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Java
echo "Installing Java..."
sudo apt install -y openjdk-17-jdk

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Install PM2
echo "Installing PM2..."
sudo npm install -g pm2

# Install Maven
echo "Installing Maven..."
sudo apt install -y maven

# Build backend
echo "Building Java backend..."
mvn clean package

# Build frontend
echo "Building frontend..."
cd ui
npm install
npm run build
sudo cp -r dist/* /usr/share/nginx/html
cd ..

# Set up Nginx
echo "Setting up Nginx..."
sudo mkdir -p /var/cache/nginx/client_temp
sudo chown -R www-data:www-data /var/cache/nginx
sudo chmod -R 755 /var/cache/nginx

# Create Nginx configuration
echo "Creating /etc/nginx/sites-available/default..."
cat <<'EOF' | sudo tee /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    server_name _;

    # Increase max upload size limit
    client_max_body_size 100M;
    client_body_buffer_size 1M;
    client_body_temp_path /var/cache/nginx/client_temp;

    # Proxy /api/upload to backend
    location /api/upload {
        proxy_pass http://localhost:8080/upload;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy /api/download/* to backend
    location ~ ^/api/download/(.*) {
        proxy_pass http://localhost:8080/download/$1;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve frontend SPA
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri /index.html;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
echo "Nginx configured and reloaded successfully."

# Start backend with PM2
echo "Starting backend with PM2..."
JAR_FILE="target/p2p-1.0-SNAPSHOT.jar"
if [ ! -f "$JAR_FILE" ]; then
    echo "Error: Backend jar not found at $JAR_FILE"
    exit 1
fi

CLASSPATH="$JAR_FILE:$(mvn dependency:build-classpath -DincludeScope=runtime -Dmdep.outputFile=/dev/stdout -q)"
pm2 start --name bytedrop-backend java -- -cp "$CLASSPATH" p2p.App
pm2 save
pm2 startup

echo "=== Setup Complete ==="
echo "Backend API: http://localhost:8080 (access via Nginx)"
echo "Frontend: http://your_vps_ip"
