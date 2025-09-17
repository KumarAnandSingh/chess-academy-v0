// Debug the socket manager event system
import { socketManager } from './src/services/socketManager.js';

console.log('🔍 Testing SocketManager Event System');

// Add event listeners to monitor what's happening
socketManager.on('connection_status', (data) => {
  console.log('📡 Connection Status Event:', data);
});

socketManager.on('authenticated', (data) => {
  console.log('🔐 SocketManager Authenticated Event Received:', data);
});

// Test if the socket manager can receive events properly
setTimeout(() => {
  console.log('⚠️ Starting connection diagnostics...');
  console.log('🔍 Socket Manager State:', socketManager.getConnectionState());

  if (socketManager.isConnected()) {
    console.log('✅ Socket is connected, testing authentication...');

    const userData = {
      userId: 'debug-socket-manager-' + Date.now(),
      username: 'SocketManagerDebugger',
      rating: 1500
    };

    console.log('📤 Calling socketManager.authenticate()');
    socketManager.authenticate(userData);
  } else {
    console.log('❌ Socket not connected, waiting...');
  }
}, 3000);

// Monitor for 15 seconds
setTimeout(() => {
  console.log('🔍 Final diagnostics after 15 seconds:');
  console.log('   Socket Connected:', socketManager.isConnected());
  console.log('   Connection State:', socketManager.getConnectionState());
  process.exit(0);
}, 15000);