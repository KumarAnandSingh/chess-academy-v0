import { io } from 'socket.io-client';

console.log('🔍 TESTING COMPLETE BACKEND SERVER');
console.log('🚀 This test verifies ALL game functionality works');

let socket1, socket2, testSocket;
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

// Test the complete backend functionality
async function testCompleteBackend() {
  const backendUrl = 'http://localhost:3002'; // Local test server

  try {
    console.log('\n🔌 STEP 1: Testing Connections...');

    // Create three socket connections
    socket1 = io(backendUrl, { forceNew: true });
    socket2 = io(backendUrl, { forceNew: true });
    testSocket = io(backendUrl, { forceNew: true });

    // Wait for all connections
    await Promise.all([
      waitForEvent(socket1, 'connected'),
      waitForEvent(socket2, 'connected'),
      waitForEvent(testSocket, 'connected')
    ]);
    console.log('✅ All three sockets connected');

    console.log('\n🔐 STEP 2: Testing Authentication...');

    const player1 = {
      userId: 'test-complete-1-' + Date.now(),
      username: 'CompletePlayer1',
      rating: 1500
    };
    const player2 = {
      userId: 'test-complete-2-' + Date.now(),
      username: 'CompletePlayer2',
      rating: 1500
    };

    socket1.emit('authenticate', player1);
    socket2.emit('authenticate', player2);
    testSocket.emit('authenticate', { ...player1, userId: player1.userId + '-test' });

    await Promise.all([
      waitForEvent(socket1, 'authenticated'),
      waitForEvent(socket2, 'authenticated'),
      waitForEvent(testSocket, 'authenticated')
    ]);
    console.log('✅ All players authenticated');

    console.log('\n🎯 STEP 3: Testing Matchmaking...');

    const timeControl = {
      initial: 300,
      increment: 3,
      type: 'blitz'
    };

    socket1.emit('join_matchmaking', { timeControl });
    socket2.emit('join_matchmaking', { timeControl });

    const gameData1 = await waitForEvent(socket1, 'game_started', 15000);
    const gameData2 = await waitForEvent(socket2, 'game_started', 15000);

    console.log('✅ Game created successfully');
    console.log('🆔 Game ID:', gameData1.gameId);

    gameId = gameData1.gameId;

    if (gameData1.gameId !== gameData2.gameId) {
      throw new Error('Game IDs don\'t match!');
    }

    console.log('\n🚪 STEP 4: Testing join_game functionality...');

    // Test socket tries to join the game
    testSocket.emit('join_game', { gameId });
    const joinResponse = await waitForEvent(testSocket, 'game_started', 5000);
    console.log('✅ join_game works - received game data');
    console.log('🎮 Player color:', joinResponse.playerColor);

    console.log('\n♟️ STEP 5: Testing make_move functionality...');

    // Determine who plays white
    const whiteSocket = gameData1.color === 'white' ? socket1 : socket2;
    const blackSocket = gameData1.color === 'white' ? socket2 : socket1;

    // White makes first move
    console.log('⚪ White player making move: e2-e4');
    whiteSocket.emit('make_move', {
      gameId,
      move: { from: 'e2', to: 'e4' },
      timeLeft: 300000
    });

    // Wait for move confirmation
    const moveResponse1 = await waitForEvent(whiteSocket, 'move_made', 5000);
    console.log('✅ First move successful');
    console.log('📍 New position:', moveResponse1.position);

    // Black makes second move
    console.log('⚫ Black player making move: e7-e5');
    blackSocket.emit('make_move', {
      gameId,
      move: { from: 'e7', to: 'e5' },
      timeLeft: 300000
    });

    const moveResponse2 = await waitForEvent(blackSocket, 'move_made', 5000);
    console.log('✅ Second move successful');
    console.log('📍 New position:', moveResponse2.position);

    console.log('\n💬 STEP 6: Testing chat functionality...');

    // Send chat message
    socket1.emit('chat_message', {
      gameId,
      message: {
        username: player1.username,
        message: 'Good game!',
        timestamp: new Date().toISOString()
      }
    });

    const chatResponse = await waitForEvent(socket2, 'chat_message', 5000);
    console.log('✅ Chat message received');
    console.log('💬 Message:', chatResponse.message.message);

    console.log('\n🏳️ STEP 7: Testing resignation...');

    // Player 1 resigns
    socket1.emit('resign', { gameId });
    const resignResponse = await waitForEvent(socket1, 'game_ended', 5000);
    console.log('✅ Resignation successful');
    console.log('🏁 Game result:', resignResponse.result);

    console.log('\n🎊 ALL TESTS PASSED!');
    console.log('✅ Connection: WORKING');
    console.log('✅ Authentication: WORKING');
    console.log('✅ Matchmaking: WORKING');
    console.log('✅ join_game: WORKING');
    console.log('✅ make_move: WORKING');
    console.log('✅ chat_message: WORKING');
    console.log('✅ resign: WORKING');

    console.log('\n🎯 BACKEND IS COMPLETE AND FUNCTIONAL!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 This indicates missing functionality in the backend');
  } finally {
    // Cleanup
    socket1?.disconnect();
    socket2?.disconnect();
    testSocket?.disconnect();
    console.log('\n🧹 Test cleanup completed');
  }
}

// Run the test
testCompleteBackend().catch(console.error);