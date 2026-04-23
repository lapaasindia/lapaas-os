#!/bin/bash

# Setup Docker containers for Lapaas OS

echo "🐳 Setting up Docker containers for Lapaas OS..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Stop existing containers if they exist
echo "🛑 Stopping existing containers..."
docker stop lapaas-postgres lapaas-redis 2>/dev/null || true
docker rm lapaas-postgres lapaas-redis 2>/dev/null || true

# Create PostgreSQL container
echo "📦 Creating PostgreSQL container..."
docker run --name lapaas-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=lapaas_dev \
  -p 5432:5432 \
  -d postgres:15

# Create Redis container
echo "📦 Creating Redis container..."
docker run --name lapaas-redis \
  -p 6379:6379 \
  -d redis:7

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 3

# Check if containers are running
if docker ps | grep -q lapaas-postgres && docker ps | grep -q lapaas-redis; then
    echo "✅ Docker containers started successfully!"
    echo ""
    echo "📊 Container Status:"
    docker ps --filter "name=lapaas" --format "table {{.Names}}\t{{.Status}}"
    echo ""
    echo "🔗 Connection Details:"
    echo "   PostgreSQL: postgresql://postgres:password@localhost:5432/lapaas_dev"
    echo "   Redis: redis://localhost:6379"
else
    echo "❌ Failed to start containers"
    exit 1
fi
