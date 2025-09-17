#!/bin/bash

# Monitor Railway deployment progress
# Checks every 30 seconds until complete backend is deployed

RAILWAY_URL="https://web-production-4fb4.up.railway.app"
MAX_ATTEMPTS=20
ATTEMPT=1

echo "🔍 Monitoring Railway deployment progress..."
echo "📡 URL: $RAILWAY_URL"
echo ""

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "🔄 Attempt $ATTEMPT/$MAX_ATTEMPTS - $(date)"

    # Test the endpoint
    RESPONSE=$(curl -s "$RAILWAY_URL" 2>/dev/null)

    if echo "$RESPONSE" | grep -q "Chess Academy Backend Running"; then
        echo "✅ COMPLETE BACKEND DEPLOYED!"
        echo ""
        echo "🧪 Testing complete functionality..."
        node test-railway-deployment.js
        exit 0
    elif echo "$RESPONSE" | grep -q "Real Multiplayer Chess"; then
        echo "⏳ Old backend still running, waiting..."
    else
        echo "❓ Unexpected response or backend starting up..."
    fi

    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo ""
        echo "⚠️  Deployment taking longer than expected"
        echo "📋 Current response:"
        echo "$RESPONSE"
        echo ""
        echo "💡 Possible actions:"
        echo "1. Check Railway dashboard: https://railway.app"
        echo "2. Check deployment logs"
        echo "3. Manual redeploy may be needed"
        exit 1
    fi

    echo "⏱️  Waiting 30 seconds before next check..."
    sleep 30
    ATTEMPT=$((ATTEMPT + 1))
done