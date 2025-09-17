import { io } from 'socket.io-client';

console.log('🔍 DEBUGGING GAME LOADING ISSUE');
console.log('📍 Backend: https://web-production-4fb4.up.railway.app');
console.log('❓ Problem: Users get matched but see "Game not found" when navigating to game page');

let socket1, socket2;
let gameId = null;

// Helper function to wait for event
function waitForEvent(socket, eventName, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${eventName}`));
    }, timeout);

    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

async function debugGameFlow() {
  // Create two socket connections
  socket1 = io('https://web-production-4fb4.up.railway.app', {
    transports: ['polling', 'websocket'],
    timeout: 20000,
    forceNew: true
  });

  socket2 = io('https://web-production-4fb4.up.railway.app', {
    transports: ['polling', 'websocket'],
    timeout: 20000,
    forceNew: true
  });

  try {
    // Wait for both connections
    console.log('🔌 Connecting both players...');
    await Promise.all([
      waitForEvent(socket1, 'connect'),
      waitForEvent(socket2, 'connect')
    ]);
    console.log('✅ Both players connected');

    // Authenticate both players
    console.log('🔐 Authenticating both players...');
    const player1 = {
      userId: 'debug-player-1-' + Date.now(),
      username: 'DebugPlayer1',
      rating: 1500
    };
    const player2 = {
      userId: 'debug-player-2-' + Date.now(),
      username: 'DebugPlayer2',
      rating: 1500
    };

    socket1.emit('authenticate', player1);
    socket2.emit('authenticate', player2);

    await Promise.all([
      waitForEvent(socket1, 'authenticated'),
      waitForEvent(socket2, 'authenticated')
    ]);
    console.log('✅ Both players authenticated');

    // Start matchmaking for both players
    console.log('🎯 Starting matchmaking...');
    const timeControl = {
      initial: 300,
      increment: 3,
      type: 'blitz'
    };

    socket1.emit('join_matchmaking', { timeControl });
    socket2.emit('join_matchmaking', { timeControl });

    // Wait for game_started events
    console.log('⏳ Waiting for game to start...');
    const gameData1 = await waitForEvent(socket1, 'game_started', 15000);
    const gameData2 = await waitForEvent(socket2, 'game_started', 15000);

    console.log('🎮 GAME STARTED - Player 1 data:', gameData1);
    console.log('🎮 GAME STARTED - Player 2 data:', gameData2);

    // Extract game IDs
    const gameId1 = gameData1.gameId;
    const gameId2 = gameData2.gameId;

    console.log('🆔 Game ID from Player 1:', gameId1);
    console.log('🆔 Game ID from Player 2:', gameId2);

    if (gameId1 !== gameId2) {
      console.error('❌ CRITICAL: Game IDs don\'t match!');
      console.error('Player 1 gameId:', gameId1);
      console.error('Player 2 gameId:', gameId2);
    } else {
      console.log('✅ Game IDs match:', gameId1);
      gameId = gameId1;
    }

    // Now test joining the game (this is what happens when user navigates to /game/{gameId})
    console.log('🚪 Testing join_game functionality...');

    // Create a third socket to simulate what happens when user navigates to game page
    const testSocket = io('https://web-production-4fb4.up.railway.app', {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      forceNew: true
    });

    await waitForEvent(testSocket, 'connect');
    console.log('✅ Test socket connected');

    // Authenticate test socket
    testSocket.emit('authenticate', {
      userId: player1.userId, // Same as player 1
      username: player1.username,
      rating: player1.rating
    });
    await waitForEvent(testSocket, 'authenticated');
    console.log('✅ Test socket authenticated');

    // Try to join the game (this is what ImprovedLiveChessGame does)
    console.log('🎮 Test socket attempting to join game:', gameId);
    testSocket.emit('join_game', { gameId });

    // Listen for responses
    testSocket.on('game_started', (data) => {
      console.log('✅ Test socket received game_started:', data);
    });

    testSocket.on('error', (error) => {
      console.log('❌ Test socket received error:', error);
    });

    testSocket.on('game_not_found', (error) => {
      console.log('❌ Test socket received game_not_found:', error);
    });

    // Wait for any response
    try {
      const response = await Promise.race([
        waitForEvent(testSocket, 'game_started', 5000),
        waitForEvent(testSocket, 'error', 5000),
        waitForEvent(testSocket, 'game_not_found', 5000)
      ]);
      console.log('📨 Test socket response:', response);
    } catch (error) {
      console.log('⏰ No response to join_game within 5 seconds');
      console.log('❌ THIS IS THE PROBLEM: Backend not responding to join_game events');
    }

    // Cleanup
    testSocket.disconnect();

  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  } finally {
    // Cleanup
    socket1?.disconnect();
    socket2?.disconnect();
    console.log('🧹 Cleanup completed');
  }
}

// Start debugging
debugGameFlow().catch(console.error);