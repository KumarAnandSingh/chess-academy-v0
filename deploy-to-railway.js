import fs from 'fs';
import path from 'path';

console.log('🚀 RAILWAY DEPLOYMENT PREP');
console.log('📦 Preparing files for Railway deployment...');

// Create deployment directory
const deployDir = './railway-deployment';
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir);
  console.log('📁 Created deployment directory');
}

// Copy and rename files for Railway
try {
  // Copy backend server as index.js (Railway's default entry point)
  fs.copyFileSync('./complete-backend-server.js', path.join(deployDir, 'index.js'));
  console.log('✅ Copied complete-backend-server.js → index.js');

  // Copy package.json for dependencies
  fs.copyFileSync('./backend-package.json', path.join(deployDir, 'package.json'));
  console.log('✅ Copied backend-package.json → package.json');

  // Create a simple README for the deployment
  const readme = `# Chess Academy Backend - Complete Implementation

This backend includes ALL game functionality:

- ✅ Authentication
- ✅ Matchmaking
- ✅ Game creation and joining
- ✅ Real-time chess moves
- ✅ In-game chat
- ✅ Game resignation
- ✅ Spectator support

## Deployment

This is ready for Railway deployment. The entry point is \`index.js\`.

## Environment Variables

- PORT: Automatically set by Railway
- NODE_ENV: Set to 'production'

## Previous Issue Fixed

The original backend was missing the \`join_game\` event handler, causing "Game not found" errors.
This complete implementation fixes all missing functionality.

Generated: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(deployDir, 'README.md'), readme);
  console.log('✅ Created README.md');

  console.log('\n🎯 DEPLOYMENT READY!');
  console.log('📁 Files in ./railway-deployment/:');
  console.log('   ├── index.js (complete backend server)');
  console.log('   ├── package.json (dependencies)');
  console.log('   └── README.md (deployment info)');

  console.log('\n📋 NEXT STEPS:');
  console.log('1. 🌐 Go to Railway dashboard: https://railway.app');
  console.log('2. 🔍 Find your Chess Academy backend project');
  console.log('3. 📤 Upload files from ./railway-deployment/ directory');
  console.log('4. 🚀 Railway will automatically redeploy');
  console.log('5. ✅ Test the complete game flow');

  console.log('\n🎊 This will fix the "Game not found" error!');

} catch (error) {
  console.error('❌ Error preparing deployment:', error.message);
}