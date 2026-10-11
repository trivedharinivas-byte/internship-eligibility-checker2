# ========================================================
# Stage 1: Build React Application with Node.js
# ========================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies with caching
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# ========================================================
# Stage 2: Serve Production Assets with Lightweight Nginx
# ========================================================
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Clean default Nginx static files
RUN rm -rf ./*

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
