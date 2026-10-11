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

## 🐳 Option 1: Docker Compose (Full-Stack Backend + Frontend + MySQL)

The project includes production Dockerfiles for both backend and frontend:
- [backend/Dockerfile](file:///d:/intership%20elgibality%20cheker/backend/Dockerfile) (Multi-stage Java 21 build + hardened JRE runtime)
- [frontend/Dockerfile](file:///d:/intership%20elgibality%20cheker/frontend/Dockerfile) (Multi-stage Node 20 build + Nginx reverse proxy)
- [docker-compose.yml](file:///d:/intership%20elgibality%20cheker/docker-compose.yml) (Multi-container orchestration)

### Step 1: Run with Docker Compose
```bash
docker compose up -d --build
```

### What this does:
1. Spins up a secured **MySQL 8.0** container (`internship_mysql`) with persistent storage volume `mysql_data`.
2. Automatically seeds database tables and initial demo users from [schema-mysql.sql](file:///d:/intership%20elgibality%20cheker/schema-mysql.sql).
3. Builds the Spring Boot backend inside a multi-stage container and exposes port `8080`.
4. Builds the React SPA and serves it via an optimized **Nginx** container on port `3000` with automated reverse-proxying of `/api/*` to the backend.
5. Performs continuous health probes on `/api/health`.

### Access:
- **Frontend Web UI (React):** `http://localhost:3000`
- **Backend API & Swagger/Health:** `http://localhost:8080/api/health`
- **MySQL Database:** `localhost:3306`

### To stop or restart:
```bash
docker compose down        # Stop containers
docker compose logs -f     # View live logs
```

---

## ☁️ Option 2: Cloud Deployment on Render.com

Render offers free hosting for web services.

### 1-Click Blueprint Deployment:
1. Push this repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect your GitHub repository: `https://github.com/trivedharinivas-byte/internship-eligibility-checker2`.
5. Render reads [render.yaml](file:///d:/intership%20elgibality%20cheker/render.yaml) and provisions the web service automatically.
6. The app boots immediately using the built-in embedded database. To connect to an external MySQL database (e.g. Aiven, Railway, or Clever Cloud), simply set `SPRING_PROFILES_ACTIVE=prod` and add `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` under the service's **Environment** tab.

---

## 🚂 Option 3: Cloud Deployment on Railway.app

Deploying to Railway is plug-and-play using the included [railway.json](file:///d:/intership%20elgibality%20cheker/railway.json):

1. Go to [Railway.app](https://railway.app).
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select your repository `internship-eligibility-checker2`.
4. Railway automatically detects `backend/Dockerfile` and provisions the service.
5. (Optional) Click **New** $\rightarrow$ **Database** $\rightarrow$ **Add MySQL**, then in the app's **Variables** tab add:
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true`
   - `SPRING_DATASOURCE_USERNAME`: `${{MySQL.MYSQLUSER}}`
   - `SPRING_DATASOURCE_PASSWORD`: `${{MySQL.MYSQLPASSWORD}}`
6. Click **Deploy**. Railway checks `/api/health` and activates the live deployment URL.

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
