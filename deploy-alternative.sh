#!/bin/bash

# Chess Academy - Alternative Deployment Solutions
# Deploy to multiple platforms to bypass Vercel team restrictions

set -e

echo "🚀 Chess Academy - Alternative Deployment Solutions"
echo "Deploying to multiple platforms to ensure public access..."
echo ""

# Function to build the project
build_project() {
    echo "🏗️  Building project..."
    npm run build
    echo "✅ Build completed"
}

# Function to deploy to Netlify
deploy_to_netlify() {
    echo ""
    echo "🌐 Deploying to Netlify..."

    if ! command -v netlify &> /dev/null; then
        echo "📦 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi

    # Deploy to Netlify
    netlify deploy --prod --dir=dist --site=studyify-chess || {
        echo "🔗 Creating new Netlify site..."
        netlify sites:create --name studyify-chess
        netlify deploy --prod --dir=dist
    }

    echo "✅ Netlify deployment completed"
    echo "🌐 Netlify URL: https://studyify-chess.netlify.app"
}

# Function to deploy to Surge.sh
deploy_to_surge() {
    echo ""
    echo "⚡ Deploying to Surge.sh..."

    if ! command -v surge &> /dev/null; then
        echo "📦 Installing Surge CLI..."
        npm install -g surge
    fi

    # Deploy to Surge
    cd dist
    echo "studyify.surge.sh" > CNAME
    surge --domain studyify.surge.sh
    cd ..

    echo "✅ Surge deployment completed"
    echo "🌐 Surge URL: https://studyify.surge.sh"
}

# Function to deploy to GitHub Pages
deploy_to_github_pages() {
    echo ""
    echo "🐙 Deploying to GitHub Pages..."

    if ! command -v gh &> /dev/null; then
        echo "❌ GitHub CLI not found. Install with: brew install gh"
        return 1
    fi

    # Create gh-pages branch and deploy
    git add dist -f
    git commit -m "Deploy to GitHub Pages" || true
    git subtree push --prefix dist origin gh-pages || {
        git subtree split --prefix=dist -b gh-pages
        git push -f origin gh-pages:gh-pages
    }

    echo "✅ GitHub Pages deployment completed"
    echo "🌐 GitHub Pages URL: https://kumaranandsingh.github.io/chess-academy"
}

# Function to deploy to Firebase Hosting
deploy_to_firebase() {
    echo ""
    echo "🔥 Deploying to Firebase Hosting..."

    if ! command -v firebase &> /dev/null; then
        echo "📦 Installing Firebase CLI..."
        npm install -g firebase-tools
    fi

    # Initialize Firebase if not already done
    if [ ! -f firebase.json ]; then
        echo "⚙️  Initializing Firebase..."
        cat > firebase.json << EOF
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
EOF
    fi

    # Deploy to Firebase
    firebase deploy --only hosting || {
        echo "🔑 Please login to Firebase first:"
        firebase login
        firebase use --add
        firebase deploy --only hosting
    }

    echo "✅ Firebase deployment completed"
}

# Function to verify deployments
verify_deployments() {
    echo ""
    echo "🧪 Verifying deployments..."

    urls=(
        "https://studyify-chess.netlify.app"
        "https://studyify.surge.sh"
        "https://kumaranandsingh.github.io/chess-academy"
    )

    for url in "${urls[@]}"; do
        echo -n "Testing $url... "
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
            echo "✅ Working"
        else
            echo "❌ Failed"
        fi
    done
}

# Main deployment function
main() {
    echo "Starting alternative deployments..."

    # Build project first
    build_project

    # Deploy to multiple platforms
    deploy_to_netlify
    deploy_to_surge
    # deploy_to_github_pages  # Uncomment if needed
    # deploy_to_firebase      # Uncomment if needed

    # Verify all deployments
    verify_deployments

    echo ""
    echo "🎉 Alternative deployments completed!"
    echo ""
    echo "📋 Available URLs:"
    echo "   🌐 Netlify: https://studyify-chess.netlify.app"
    echo "   ⚡ Surge: https://studyify.surge.sh"
    echo "   🐙 GitHub Pages: https://kumaranandsingh.github.io/chess-academy"
    echo "   🔥 Firebase: (run firebase deploy manually)"
    echo ""
    echo "💡 These deployments bypass Vercel team restrictions"
    echo "🎯 Use any of these URLs for public access to your multiplayer chess game"
}

# Run the deployment
main "$@"