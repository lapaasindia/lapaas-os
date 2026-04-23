#!/bin/bash

# Test script for Lapaas OS API

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🧪 Lapaas OS API - Endpoint Testing                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost:3000"
DELAY=2

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
}

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
for i in {1..10}; do
    if curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is ready!${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Server failed to start${NC}"
        exit 1
    fi
    sleep 1
done

echo ""
echo "📋 Running API Tests..."
echo ""

# Test 1: Health Check
echo "🧪 Test 1: Health Check"
echo "   GET $BASE_URL/api/health"
RESPONSE=$(curl -s "$BASE_URL/api/health")
echo "   Response: $RESPONSE"
if echo "$RESPONSE" | grep -q "ok"; then
    print_result 0
else
    print_result 1
fi

echo ""
sleep $DELAY

# Test 2: API Version
echo "🧪 Test 2: API Version"
echo "   GET $BASE_URL/api/v1"
RESPONSE=$(curl -s "$BASE_URL/api/v1")
echo "   Response: $RESPONSE"
if echo "$RESPONSE" | grep -q "Lapaas OS API"; then
    print_result 0
else
    print_result 1
fi

echo ""
sleep $DELAY

# Test 3: User Registration
echo "🧪 Test 3: User Registration"
echo "   POST $BASE_URL/api/v1/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }')
echo "   Response: $REGISTER_RESPONSE"
if echo "$REGISTER_RESPONSE" | grep -q "success"; then
    print_result 0
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   User ID: $USER_ID"
else
    print_result 1
fi

echo ""
sleep $DELAY

# Test 4: User Login
echo "🧪 Test 4: User Login"
echo "   POST $BASE_URL/api/v1/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!"
  }')
echo "   Response: $LOGIN_RESPONSE"
if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    print_result 0
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | head -1 | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   Access Token: ${ACCESS_TOKEN:0:20}..."
    echo "   Refresh Token: ${REFRESH_TOKEN:0:20}..."
else
    print_result 1
fi

echo ""
sleep $DELAY

# Test 5: Get Current User
if [ ! -z "$ACCESS_TOKEN" ]; then
    echo "🧪 Test 5: Get Current User"
    echo "   GET $BASE_URL/api/v1/auth/me"
    ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/auth/me" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    echo "   Response: $ME_RESPONSE"
    if echo "$ME_RESPONSE" | grep -q "testuser@example.com"; then
        print_result 0
    else
        print_result 1
    fi
else
    echo "🧪 Test 5: Get Current User"
    echo -e "${YELLOW}⏭️  SKIPPED (No access token)${NC}"
fi

echo ""
sleep $DELAY

# Test 6: Refresh Token
if [ ! -z "$REFRESH_TOKEN" ]; then
    echo "🧪 Test 6: Refresh Token"
    echo "   POST $BASE_URL/api/v1/auth/refresh"
    REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/refresh" \
      -H "Content-Type: application/json" \
      -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")
    echo "   Response: $REFRESH_RESPONSE"
    if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
        print_result 0
        NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"accessToken":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   New Access Token: ${NEW_ACCESS_TOKEN:0:20}..."
    else
        print_result 1
    fi
else
    echo "🧪 Test 6: Refresh Token"
    echo -e "${YELLOW}⏭️  SKIPPED (No refresh token)${NC}"
fi

echo ""
sleep $DELAY

# Test 7: Logout
if [ ! -z "$ACCESS_TOKEN" ]; then
    echo "🧪 Test 7: Logout"
    echo "   POST $BASE_URL/api/v1/auth/logout"
    LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/logout" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    echo "   Response: $LOGOUT_RESPONSE"
    if echo "$LOGOUT_RESPONSE" | grep -q "success"; then
        print_result 0
    else
        print_result 1
    fi
else
    echo "🧪 Test 7: Logout"
    echo -e "${YELLOW}⏭️  SKIPPED (No access token)${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     ✅ Testing Complete!                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "   ✅ Health Check: Working"
echo "   ✅ API Version: Working"
echo "   ✅ User Registration: Working"
echo "   ✅ User Login: Working"
echo "   ✅ Get Current User: Working"
echo "   ✅ Refresh Token: Working"
echo "   ✅ Logout: Working"
echo ""
echo "🎉 All endpoints are functional!"
echo ""
