import { io } from 'socket.io-client';

console.log('🔍 TESTING BACKEND EVENT HANDLERS');
console.log('📍 Backend: https://web-production-4fb4.up.railway.app');

const socket = io('https://web-production-4fb4.up.railway.app', {
  transports: ['polling', 'websocket'],
  timeout: 20000,
  forceNew: true
});

let authenticated = false;

socket.on('connect', () => {
  console.log('✅ Connected to Railway backend');
  console.log('🆔 Socket ID:', socket.id);

  // Test authentication first
  console.log('🔐 Testing authenticate event...');
  const userData = {
    userId: 'test-events-' + Date.now(),
    username: 'EventTester',
    rating: 1500
  };

  socket.emit('authenticate', userData);
});

socket.on('authenticated', (data) => {
  console.log('✅ authenticate event: WORKING');
  authenticated = true;

  // Now test other events
  testEvents();
});

function testEvents() {
  console.log('\n🧪 TESTING VARIOUS BACKEND EVENTS...\n');

  const eventsToTest = [
    'join_game',
    'make_move',
    'get_game_state',
    'resign',
    'offer_draw',
    'chat_message',
    'ping',
    'heartbeat'
  ];

  eventsToTest.forEach((eventName, index) => {
    setTimeout(() => {
      console.log(`📤 Testing: ${eventName}`);

      // Send different test data based on event
      let testData;
      switch(eventName) {
        case 'join_game':
          testData = { gameId: 'test-game-123' };
          break;
        case 'make_move':
          testData = {
            gameId: 'test-game-123',
            move: { from: 'e2', to: 'e4' },
            timeLeft: 300000
          };
          break;
        case 'get_game_state':
          testData = { gameId: 'test-game-123' };
          break;
        case 'resign':
          testData = { gameId: 'test-game-123' };
          break;
        case 'offer_draw':
          testData = { gameId: 'test-game-123' };
          break;
        case 'chat_message':
          testData = {
            gameId: 'test-game-123',
            message: {
              username: 'EventTester',
              message: 'test message',
              timestamp: new Date().toISOString()
            }
          };
          break;
        case 'ping':
          testData = { timestamp: Date.now() };
          break;
        case 'heartbeat':
          testData = { timestamp: Date.now() };
          break;
        default:
          testData = { test: true };
      }

      socket.emit(eventName, testData);

      // Listen for responses
      const responseTimer = setTimeout(() => {
        console.log(`❌ ${eventName}: NO RESPONSE (likely not implemented)`);
      }, 2000);

      // Listen for potential response events
      const responseEvents = [
        'game_started',
        'game_state',
        'move_made',
        'game_ended',
        'error',
        'pong',
        'heartbeat',
        'chat_message',
        'draw_offered'
      ];

      const originalEventListeners = {};
      responseEvents.forEach(respEvent => {
        const listener = (data) => {
          clearTimeout(responseTimer);
          console.log(`✅ ${eventName} -> ${respEvent}: WORKING`);
          console.log(`   Response:`, data);

          // Clean up listeners
          responseEvents.forEach(evt => {
            if (originalEventListeners[evt]) {
              socket.off(evt, originalEventListeners[evt]);
            }
          });
        };
        originalEventListeners[respEvent] = listener;
        socket.on(respEvent, listener);
      });

    }, index * 3000); // Space out tests by 3 seconds
  });

  // Final cleanup
  setTimeout(() => {
    console.log('\n🏁 Event testing completed');
    socket.disconnect();
    process.exit(0);
  }, eventsToTest.length * 3000 + 5000);
}

socket.on('authentication_error', (data) => {
  console.log('❌ Authentication failed:', data);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
  process.exit(1);
});

// Catch-all event listener to see what the backend actually sends
socket.onAny((eventName, data) => {
  console.log(`📨 Received event: ${eventName}`, data);
});