import { io } from 'socket.io-client';

console.log('🔍 Testing Frontend Authentication Flow');
console.log('📍 Backend: https://web-production-4fb4.up.railway.app');

// Replicate the exact frontend configuration
const socket = io('https://web-production-4fb4.up.railway.app', {
  // Railway-optimized transport configuration
  transports: ['polling', 'websocket'], // Allow upgrade to websockets for better performance
  forceNew: false,

  // Timeouts optimized for Railway deployment
  timeout: 20000, // Railway-optimized timeout

  // Enhanced reconnection strategy for Railway
  reconnection: true,
  reconnectionDelay: 2000, // Start with 2 second delay
  reconnectionDelayMax: 30000, // Max 30 second delay for Railway cold starts
  reconnectionAttempts: 15, // More attempts for Railway stability
  randomizationFactor: 0.3, // Less jitter for better predictability

  // Railway-friendly options
  upgrade: true, // Allow upgrade to websockets for better Railway performance
  rememberUpgrade: true, // Remember successful upgrades
  autoConnect: true,
  withCredentials: false,

  // Enhanced headers for Railway CORS
  extraHeaders: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Cache-Control': 'no-cache'
  },

  // Query parameters for Railway debugging
  query: {
    client: 'chess-academy',
    version: '1.0.0',
    platform: 'railway',
    timestamp: Date.now()
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to Railway backend with frontend config');
  console.log('🆔 Socket ID:', socket.id);
  console.log('🚀 Transport:', socket.io.engine.transport.name);

  // Replicate the exact frontend authentication logic
  // Generate consistent user ID for this browser session
  const userId = 'demo-user-' + Math.random().toString(36).substr(2, 6);
  const username = 'Player' + Math.floor(Math.random() * 1000);
  const rating = 1200 + Math.floor(Math.random() * 400);

  const userData = {
    userId,
    username,
    rating
  };

  console.log('🔐 Testing authentication with frontend-style data...');
  console.log('📤 Sending authenticate event:', userData);
  socket.emit('authenticate', userData);

  // Set timeout to check if we get a response
  setTimeout(() => {
    console.log('⏰ 5 seconds elapsed, checking authentication response...');
  }, 5000);

  setTimeout(() => {
    console.log('❌ 10 seconds elapsed - Authentication TIMEOUT');
    console.log('🔍 Backend may not be responding to authenticate events');
    socket.disconnect();
    process.exit(1);
  }, 10000);
});

socket.on('authenticated', (data) => {
  console.log('✅ AUTHENTICATION SUCCESS:', data);
  console.log('🎯 This confirms the backend authentication handler is working!');
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

// Handle Railway heartbeat exactly like frontend
socket.on('heartbeat', (data) => {
  console.log('💓 Heartbeat received:', data.timestamp);
  // Respond to keep connection alive
  socket.emit('heartbeat_ack', { timestamp: Date.now() });
});

// Handle pong responses
socket.on('pong', (data) => {
  console.log('🏓 Pong received, latency:', Date.now() - data.timestamp, 'ms');
});

// Listen for other events that might interfere
const otherEvents = ['game_started', 'matchmaking_joined', 'server_message', 'error'];
otherEvents.forEach(event => {
  socket.on(event, (data) => {
    console.log(`📨 Received ${event}:`, data);
  });
});