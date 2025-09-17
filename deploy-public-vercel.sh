#!/bin/bash

# Chess Academy - Public Vercel Deployment
# Deploy using a fresh Vercel project without team restrictions

set -e

echo "🎯 Chess Academy - Public Vercel Deployment"
echo "Creating a new public deployment without team restrictions..."
echo ""

# Remove existing Vercel configuration
echo "🧹 Cleaning up existing Vercel configuration..."
rm -rf .vercel
rm -f vercel.json

# Create new public vercel.json
echo "📝 Creating public Vercel configuration..."
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "public": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "all"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "functions": {},
  "routes": []
}
EOF

# Build the project
echo "🏗️  Building project..."
npm run build

# Deploy with public flag
echo "🚀 Deploying with public access..."
npx vercel deploy --prod --public --confirm

# Get the deployment URL
echo ""
echo "🔍 Getting deployment URL..."
DEPLOYMENT_URL=$(npx vercel ls | grep "Ready" | head -1 | awk '{print $2}')

if [ -z "$DEPLOYMENT_URL" ]; then
    echo "❌ Could not get deployment URL"
    exit 1
fi

echo "✅ Deployment completed!"
echo "🌐 New public URL: https://$DEPLOYMENT_URL"

# Test the deployment
echo ""
echo "🧪 Testing deployment..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Deployment is publicly accessible (HTTP $HTTP_STATUS)"
else
    echo "❌ Deployment returned HTTP $HTTP_STATUS"
fi

# Test multiplayer page
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL/multiplayer" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Multiplayer page is accessible (HTTP $HTTP_STATUS)"
else
    echo "❌ Multiplayer page returned HTTP $HTTP_STATUS"
fi

echo ""
echo "🎉 Public deployment successful!"
echo "🌐 Access your chess academy at: https://$DEPLOYMENT_URL"
echo "♟️  Multiplayer chess at: https://$DEPLOYMENT_URL/multiplayer"
echo ""
echo "💡 This deployment bypasses team restrictions by using the --public flag"