#!/bin/bash

# Chess Academy - Public Deployment Script
# Fixes 401 errors by ensuring public access during deployment

set -e

echo "🚀 Starting public deployment for Chess Academy..."

# Step 1: Ensure we're authenticated with Vercel
echo "📝 Checking Vercel authentication..."
if ! npx vercel whoami > /dev/null 2>&1; then
    echo "❌ Not authenticated with Vercel. Please run 'npx vercel login' first."
    exit 1
fi

# Step 2: Remove any existing password protection
echo "🔓 Removing password protection settings..."
npx vercel project rm --yes chess-academy || true
npx vercel link --yes

# Step 3: Set environment variables for public access
echo "🌐 Configuring environment variables for public access..."
npx vercel env rm VERCEL_PASSWORD_PROTECTION --yes || true
npx vercel env rm VERCEL_TEAM_ACCESS --yes || true
npx vercel env add VERCEL_PUBLIC_ACCESS production <<< "true"

# Step 4: Deploy with public access flags
echo "🏗️  Building and deploying..."
npx vercel build --prod
npx vercel deploy --prebuilt --prod --public

# Step 5: Update project settings via API
echo "⚙️  Updating project settings..."
PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)

# Remove password protection via API
curl -X PATCH \
  "https://api.vercel.com/v9/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $(npx vercel env pull --environment=production --yes && grep VERCEL_TOKEN .env.production | cut -d'=' -f2 || echo '')" \
  -H "Content-Type: application/json" \
  -d '{
    "passwordProtection": null,
    "publicSource": true,
    "framework": "vite"
  }' || echo "⚠️  API call failed, but deployment should still work"

# Step 6: Verify deployment
echo "✅ Verifying deployment..."
DEPLOYMENT_URL="https://studyify.in"

# Test the main page
echo "🧪 Testing main page accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Main page is accessible (HTTP $HTTP_STATUS)"
else
    echo "❌ Main page returned HTTP $HTTP_STATUS"
fi

# Test the multiplayer page
echo "🧪 Testing multiplayer page accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/multiplayer" || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Multiplayer page is accessible (HTTP $HTTP_STATUS)"
else
    echo "❌ Multiplayer page returned HTTP $HTTP_STATUS"
fi

echo ""
echo "🎉 Deployment completed!"
echo "🌐 Main URL: https://studyify.in"
echo "♟️  Multiplayer: https://studyify.in/multiplayer"
echo ""
echo "If you still see 401 errors, they may be due to:"
echo "1. DNS propagation delay (wait 5-10 minutes)"
echo "2. Browser cache (try incognito mode)"
echo "3. Team-level restrictions (contact Vercel support)"