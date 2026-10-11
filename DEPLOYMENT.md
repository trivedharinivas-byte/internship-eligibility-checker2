# 🚀 Deployment Guide: Internship Eligibility Checker

This guide outlines multiple production-ready deployment strategies for the **Internship Eligibility Checker** (both Backend and Frontend).

---

## 📑 Deployment Options Summary

| Method | Best For | Prerequisites | Cost |
|---|---|---|---|
| **Option 1: Docker Compose** | VPS (DigitalOcean, Linode, AWS EC2, local testing) | Docker & Docker Compose | Low / Free on existing server |
| **Option 2: Cloud PaaS (Render / Railway)** | Free/Low-cost cloud deployment with database | GitHub Repository | Free Tier available |
| **Option 3: Split Deployment (Vercel + Render)** | High-performance CDN for React + Cloud Backend | GitHub Repository | Free Tier on both |
| **Option 4: Traditional Linux Server (Systemd)** | Ubuntu / Debian / RHEL Server with MySQL | Java 21+ & MySQL 8.0 | VPS hosting |

---

## 🐳 Option 1: Docker Compose (All-in-One Backend + DB + React)

The project includes a multi-stage production [backend/Dockerfile](file:///d:/intership%20elgibality%20cheker/backend/Dockerfile) and [docker-compose.yml](file:///d:/intership%20elgibality%20cheker/docker-compose.yml).

### Step 1: Run with Docker Compose
```bash
docker compose up -d --build
```

### What this does:
1. Spins up a secured **MySQL 8.0** container with persistent storage volume `mysql_data`.
2. Automatically seeds database tables and initial demo users from [schema-mysql.sql](file:///d:/intership%20elgibality%20cheker/schema-mysql.sql).
3. Builds the Spring Boot fat JAR inside a multi-stage builder container.
4. Launches the minimal, hardened JRE container running as a non-root user.
5. Performs container health checks on `/api/health`.

### Access:
- **Web Portal:** `http://your-server-ip:8080`
- **Health Check:** `http://your-server-ip:8080/api/health`

### To stop or restart:
```bash
docker compose down        # Stop containers
docker compose logs -f     # View live logs
```

---

## ☁️ Option 2: Cloud Deployment on Render.com

Render offers free hosting for web services and databases.

### 1-Click Blueprint Deployment:
1. Push this repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect your GitHub repository.
5. Render reads [render.yaml](file:///d:/intership%20elgibality%20cheker/render.yaml) and automatically provisions:
   - A **MySQL Database**
   - A **Spring Boot Docker Web Service** connected to the database.

### Manual Web Service Setup on Render:
- **Root Directory:** `backend` (or run Maven from root)
- **Build Command:** `mvn clean package -DskipTests`
- **Start Command:** `java -Dserver.port=$PORT -jar target/internship-eligibility-checker-1.0.0.jar`
- **Environment Variables:**
  - `SPRING_PROFILES_ACTIVE`: `prod`
  - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<db-host>:<port>/<db-name>?useSSL=true`
  - `SPRING_DATASOURCE_USERNAME`: `<db-user>`
  - `SPRING_DATASOURCE_PASSWORD`: `<db-password>`

---

## 🚂 Option 3: Cloud Deployment on Railway.app

1. Go to [Railway.app](https://railway.app).
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Add a **MySQL Database** service to the canvas.
4. In your application settings, link variables:
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `SPRING_DATASOURCE_URL`: `${{MySQL.MYSQL_URL}}`
   - `SPRING_DATASOURCE_USERNAME`: `${{MySQL.MYSQLUSER}}`
   - `SPRING_DATASOURCE_PASSWORD`: `${{MySQL.MYSQLPASSWORD}}`
5. Railway automatically builds with the included [Procfile](file:///d:/intership%20elgibality%20cheker/Procfile) and [system.properties](file:///d:/intership%20elgibality%20cheker/system.properties).

---

## ⚡ Option 4: Split Deployment (Vercel for React + Render for Backend)

If you prefer serving the standalone React frontend on Vercel's global CDN:

### Part A: Deploy Backend (Spring Boot)
1. Deploy the backend to Render, Railway, or AWS.
2. Note your backend URL: e.g., `https://internship-checker-api.onrender.com`.

### Part B: Deploy React Frontend to Vercel
1. In `frontend/.env.production`, set your live backend URL:
   ```env
   VITE_API_BASE_URL=https://internship-checker-api.onrender.com
   ```
2. Go to [Vercel](https://vercel.com) $\rightarrow$ **Add New Project**.
3. Select your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Vercel automatically detects Vite and builds using the included [vercel.json](file:///d:/intership%20elgibality%20cheker/frontend/vercel.json).
6. Click **Deploy**.

---

## 🖥️ Option 5: Ubuntu Linux Server (VPS / EC2) with Systemd

### 1. Install Java 21 & MySQL
```bash
sudo apt update
sudo apt install -y openjdk-21-jre-headless mysql-server
```

### 2. Set Up MySQL Database
```sql
sudo mysql -e "CREATE DATABASE internship_db;"
sudo mysql -e "CREATE USER 'internship_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON internship_db.* TO 'internship_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
sudo mysql internship_db < schema-mysql.sql
```

### 3. Deploy JAR File
```bash
sudo mkdir -p /opt/internship-checker
sudo cp backend/target/internship-eligibility-checker-1.0.0.jar /opt/internship-checker/app.jar
```

### 4. Create Systemd Service (`/etc/systemd/system/internship.service`)
```ini
[Unit]
Description=Internship Eligibility Checker Service
After=syslog.target network.target mysql.service

[Service]
User=www-data
WorkingDirectory=/opt/internship-checker
Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/internship_db?useSSL=false"
Environment="SPRING_DATASOURCE_USERNAME=internship_user"
Environment="SPRING_DATASOURCE_PASSWORD=StrongPassword123!"
ExecStart=/usr/bin/java -Xms256m -Xmx512m -jar /opt/internship-checker/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 5. Enable and Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable internship
sudo systemctl start internship
sudo systemctl status internship
```

---

## 🩺 Verifying Deployment Health

Once deployed on any environment, test the health check endpoint:
```bash
curl http://<your-deployed-domain-or-ip>/api/health
```
Response:
```json
{
  "status": "UP",
  "application": "Internship Eligibility Checker",
  "version": "1.0.0",
  "timestamp": "2026-10-11T..."
}
```
