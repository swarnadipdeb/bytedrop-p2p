# ByteDrop Deployment Guide

This guide outlines several easy deployment options for the bytedrop application, covering both the Java backend and Reactjs+Vite frontend.

## Deployment Options

### Option 1: Local Network Deployment

The simplest deployment for a P2P application is to run it on a computer within your local network.

1. Build the application:
   ```bash
   mvn clean package
   cd ui && npm run build && cd ..
   ```

2. Run the backend:
   ```bash
   java -jar target/p2p-1.0-SNAPSHOT.jar
   ```

3. Run the frontend:
   ```bash
   cd ui && npm preview
   ```
   OR you can serve it using nginx using this config [nginx-proxy.conf](nginx-proxy.conf)

   make sure to do this changes to [nginx-proxy.conf](nginx-proxy.conf) before use it
   ```bash
   #replace these two lines 
   proxy_pass http://backend:8080/upload; --->  proxy_pass http://localhost:8080/upload;
   proxy_pass http://backend:8080/download/$1;  ---> proxy_pass http://loacalhost:8080/download/$1;
   ```

5. Access the application at without nginx to `http://localhost:5000` and with nginx to `http://localhost:80`
6. Share your local IP address with others on the same network to access the application

### Option 2: Docker Deployment

Docker makes it easy to package and deploy both components. We've already created the necessary files for you:

- `Dockerfile.backend` - Docker configuration for the Java backend
- `Dockerfile.frontend` - Docker configuration for the Reactjs frontend
- `docker-compose.yml` - Docker Compose configuration to run both services

To deploy with Docker:

1. Make sure Docker and Docker Compose are installed on your system
2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

This will build and start both the backend and frontend services. The frontend will be available at http://localhost:80 and the backend at http://localhost:8080.

### Option 3: Virtual Private Server (VPS)

For complete control, deploy to a VPS like DigitalOcean, Linode, or AWS EC2. We've created helper files to make this process easier:

- `vps-setup.sh` - A script that automates the setup process on Ubuntu/Debian VPS
- `nginx-proxy.conf` - A sample Nginx configuration with HTTPS and security headers

#### Automated Setup

1. SSH into your server
2. Upload the project files to your server
3. Make the setup script executable and run it:
   ```bash
   chmod +x vps-setup.sh
   ./vps-setup.sh
   ```
   
4. Follow the prompts and instructions during the setup process

#### Manual Setup

If you prefer to set up manually:

1. SSH into your server
2. Install Java, Node.js, Nginx, and PM2
3. Clone your repository
4. Build both applications:
   ```bash
   mvn clean package
   cd ui && npm install && npm run build
   ```

5. Use a process manager like PM2:
   ```bash
   # For the backend
   pm2 start --name bytedrop-backend java -- -jar target/p2p-1.0-SNAPSHOT.jar
   ```

6. Set up Nginx as a reverse proxy using the provided `nginx-proxy.conf` as a template: 
   
   ###### nginx-proxy.conf
   
   ```bash title="nginx-proxy.conf"
   server {
    listen 80 default_server;
    server_name _;

    # Increase max upload size limit
    client_max_body_size 100M;
    client_body_buffer_size 1M;
    client_body_temp_path /var/cache/nginx/client_temp 1 2;

    # Proxy /api/upload to backend and rewrite path
    location /api/upload {
        proxy_pass http://localhost:8080/upload;  #<--- backend upload url
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy /api/download/* to backend and rewrite path
    location ~ ^/api/download/(.*) {
        proxy_pass http://localhost:8080/download/$1;  #<--- backend download url
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
        try_files $uri /index.html;  # SPA fallback
    }
   }

   ```
   #
   
   ```bash
   cd ui/
   sudo cp dist/* /usr/share/nginx/html
   cd ..
   
   sudo mkdir -p /var/cache/nginx/client_temp
   sudo chown -R www-data:www-data /var/cache/nginx
   sudo chmod -R 755 /var/cache/nginx

   sudo cp nginx-proxy.conf /etc/nginx/sites-available/default
   sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. Set up SSL with Let's Encrypt:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Important Considerations for P2P Applications

Since bytedrop is a P2P application that uses dynamic ports for file sharing:

1. **Firewall Configuration**: Ensure your firewall allows connections on these ports

2. **NAT Traversal**: Consider implementing STUN/TURN servers for NAT traversal if deploying for wide-scale use

3. **Security**: For production deployment, this implement required:
   - HTTPS for the frontend and API
   - Authentication system
   - File encryption
   - Rate limiting

## Future Enhancemets

1. Adding application monitoring with tools like New Relic or Datadog
2. Setting up logging with ELK stack or a cloud logging service
3. Implementing a database for user accounts and file metadata
4. Adding a CDN for improved performance
