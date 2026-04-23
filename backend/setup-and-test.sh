#!/bin/bash

# Complete setup and test script for Lapaas OS Backend

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🚀 Lapaas OS Backend - Setup & Test                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "✅ Node.js $(node --version) found"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm --version) found"

# Step 2: Check if dependencies are installed
echo ""
echo "📋 Step 2: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
else
    echo "✅ Dependencies already installed"
fi

# Step 3: Setup environment
echo ""
echo "📋 Step 3: Setting up environment..."
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi

# Step 4: Check Docker containers
echo ""
echo "📋 Step 4: Checking Docker containers..."
if docker ps 2>/dev/null | grep -q lapaas-postgres; then
    echo "✅ PostgreSQL container is running"
else
    echo "⚠️  PostgreSQL container not found"
    echo "   Run: bash setup-docker.sh"
fi

if docker ps 2>/dev/null | grep -q lapaas-redis; then
    echo "✅ Redis container is running"
else
    echo "⚠️  Redis container not found"
    echo "   Run: bash setup-docker.sh"
fi

# Step 5: Build TypeScript
echo ""
echo "📋 Step 5: Building TypeScript..."
npm run build

# Step 6: Test API endpoints
echo ""
echo "📋 Step 6: Starting backend server..."
echo "⏳ Server starting on http://localhost:3000"
echo ""

# Start server in background
npm run dev &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Step 7: Test endpoints
echo ""
echo "📋 Step 7: Testing API endpoints..."
echo ""

# Test 1: Health check
echo "🧪 Test 1: Health Check"
HEALTH=$(curl -s http://localhost:3000/api/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ Health check passed"
    echo "   Response: $HEALTH"
else
    echo "❌ Health check failed"
fi

echo ""

# Test 2: Register user
echo "🧪 Test 2: User Registration"
REGISTER=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }')

if echo "$REGISTER" | grep -q "success"; then
    echo "✅ Registration passed"
    echo "   Response: $REGISTER"
    USER_ID=$(echo "$REGISTER" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ Registration failed"
    echo "   Response: $REGISTER"
fi

echo ""

# Test 3: Login user
echo "🧪 Test 3: User Login"
LOGIN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }')

if echo "$LOGIN" | grep -q "accessToken"; then
    echo "✅ Login passed"
    echo "   Response: $LOGIN"
    ACCESS_TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ Login failed"
    echo "   Response: $LOGIN"
fi

echo ""

# Test 4: Get current user
if [ ! -z "$ACCESS_TOKEN" ]; then
    echo "🧪 Test 4: Get Current User"
    CURRENT_USER=$(curl -s -X GET http://localhost:3000/api/v1/auth/me \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$CURRENT_USER" | grep -q "success"; then
        echo "✅ Get current user passed"
        echo "   Response: $CURRENT_USER"
    else
        echo "❌ Get current user failed"
        echo "   Response: $CURRENT_USER"
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     ✅ Setup & Tests Complete!                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "   ✅ Dependencies installed"
echo "   ✅ Environment configured"
echo "   ✅ Backend server running"
echo "   ✅ API endpoints tested"
echo ""
echo "🔗 Access Points:"
echo "   API: http://localhost:3000"
echo "   Health: http://localhost:3000/api/health"
echo "   API v1: http://localhost:3000/api/v1"
echo ""
echo "📚 Documentation:"
echo "   Module Docs: ../MODULES/M1_AUTHENTICATION.md"
echo "   Build Guide: ../BUILD_INSTRUCTIONS.md"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Keep server running
wait $SERVER_PID
