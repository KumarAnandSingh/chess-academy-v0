#!/usr/bin/env node

/**
 * Test Railway Deployment After Fix
 * Comprehensive test to verify the complete backend is deployed
 */

import { io } from 'socket.io-client';

const RAILWAY_URL = 'https://web-production-4fb4.up.railway.app';

console.log('🧪 Testing Railway deployment after complete backend fix...');
console.log(`📡 Railway URL: ${RAILWAY_URL}`);

// Wait for deployment to complete
console.log('⏳ Waiting 30 seconds for Railway deployment to complete...');

setTimeout(async () => {
  console.log('\n📋 Testing HTTP endpoint...');

  try {
    const response = await fetch(RAILWAY_URL);
    const data = await response.json();

    console.log('✅ HTTP Response:', data);

    // Check for complete backend indicators
    if (data.status === 'Chess Academy Backend Running') {
      console.log('✅ COMPLETE BACKEND DETECTED!');
      console.log(`🎮 Active Games: ${data.activeGames}`);
      console.log(`👥 Connected Players: ${data.connectedPlayers}`);
      console.log(`⏳ Matchmaking Queue: ${data.matchmakingQueue}`);

      testSocketConnection();
    } else if (data.status === 'ok') {
      console.log('⚠️  OLD BACKEND STILL RUNNING - deployment may still be in progress');
      console.log('Wait a few more minutes and test again');
      process.exit(1);
    } else {
      console.log('❌ Unexpected response format');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ HTTP endpoint test failed:', error.message);
    process.exit(1);
  }
}, 30000);

function testSocketConnection() {
  console.log('\n🔌 Testing Socket.IO connection...');

  const socket = io(RAILWAY_URL, {
    transports: ['polling', 'websocket'],
    timeout: 10000
  });

  socket.on('connect', () => {
    console.log('✅ Socket.IO connected successfully!');
    console.log(`🆔 Socket ID: ${socket.id}`);

    // Test authentication
    console.log('\n🔐 Testing authentication...');
    socket.emit('authenticate', {
      userId: 'test-user-' + Date.now(),
      username: 'TestUser',
      rating: 1200
    });
  });

  socket.on('authenticated', (data) => {
    console.log('✅ Authentication successful!', data);

    // Test matchmaking
    console.log('\n🎯 Testing matchmaking...');
    socket.emit('join_matchmaking', {
      timeControl: {
        type: 'blitz',
        initial: 300,
        increment: 3
      }
    });
  });

  socket.on('matchmaking_joined', (data) => {
    console.log('✅ Joined matchmaking queue!', data);

    // Test heartbeat
    console.log('\n💓 Testing heartbeat...');
    socket.emit('heartbeat', { timestamp: Date.now() });
  });

  socket.on('heartbeat', (data) => {
    console.log('✅ Heartbeat working!', data);

    setTimeout(() => {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('✅ Complete backend successfully deployed to Railway');
      console.log('✅ Connection fluctuations should now be resolved');
      console.log('\n🎯 Next steps:');
      console.log('1. Test multiplayer at: https://elaborate-twilight-0dd8b0.netlify.app');
      console.log('2. Connection should be stable without fluctuations');
      console.log('3. All multiplayer features should work correctly');

      socket.disconnect();
      process.exit(0);
    }, 2000);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error.message);
    process.exit(1);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });

  // Timeout after 20 seconds
  setTimeout(() => {
    console.error('❌ Socket test timeout');
    process.exit(1);
  }, 20000);
}

// Immediate test to see current status
console.log('\n📋 Quick status check...');
fetch(RAILWAY_URL)
  .then(response => response.json())
  .then(data => {
    if (data.status === 'Chess Academy Backend Running') {
      console.log('✅ Complete backend already deployed! Testing immediately...');
      testSocketConnection();
    } else {
      console.log('⏳ Deployment in progress, waiting...');
    }
  })
  .catch(() => {
    console.log('⏳ Backend starting up, waiting for deployment...');
  });