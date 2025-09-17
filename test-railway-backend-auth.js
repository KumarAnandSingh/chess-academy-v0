import { io } from 'socket.io-client';

console.log('🔍 Testing Railway Backend Authentication Handler');
console.log('📍 Backend: https://web-production-4fb4.up.railway.app');

const socket = io('https://web-production-4fb4.up.railway.app', {
  transports: ['polling', 'websocket'],
  timeout: 20000,
  forceNew: true
});

socket.on('connect', () => {
  console.log('✅ Connected to Railway backend');
  console.log('🆔 Socket ID:', socket.id);
  console.log('🚀 Transport:', socket.io.engine.transport.name);

  // Test authentication
  console.log('🔐 Testing authentication...');
  const userData = {
    userId: 'test-auth-' + Date.now(),
    username: 'AuthTester',
    rating: 1500
  };

  console.log('📤 Sending authenticate event:', userData);
  socket.emit('authenticate', userData);

  // Set timeout to check if we get a response
  setTimeout(() => {
    console.log('⏰ 5 seconds elapsed, checking authentication response...');
  }, 5000);

  setTimeout(() => {
    console.log('❌ 10 seconds elapsed - Authentication TIMEOUT');
    console.log('🔍 This confirms the backend is NOT responding to authenticate events');
    socket.disconnect();
    process.exit(1);
  }, 10000);
});

socket.on('authenticated', (data) => {
  console.log('✅ AUTHENTICATION SUCCESS:', data);
  socket.disconnect();
  process.exit(0);
});

socket.on('authentication_error', (data) => {
  console.log('❌ AUTHENTICATION ERROR:', data);
  socket.disconnect();
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
  process.exit(1);
});

// Listen for any other events that might come back
const commonEvents = ['pong', 'heartbeat', 'server_message', 'error'];
commonEvents.forEach(event => {
  socket.on(event, (data) => {
    console.log(`📨 Received ${event}:`, data);
  });
});