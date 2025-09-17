import { io } from 'socket.io-client';

console.log('🔍 Testing Socket.IO connection to Railway backend...\n');

const RAILWAY_BACKEND = 'https://web-production-4fb4.up.railway.app';

async function testConnection() {
    console.log(`🔌 Connecting to: ${RAILWAY_BACKEND}`);

    const socket = io(RAILWAY_BACKEND, {
        transports: ['polling', 'websocket'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log(`✅ Connected successfully!`);
        console.log(`   Socket ID: ${socket.id}`);
        console.log(`   Transport: ${socket.io.engine.transport.name}`);

        // Test authentication
        const testUser = {
            userId: 'test-cli-user-' + Math.random().toString(36).substr(2, 6),
            username: 'CLITestPlayer' + Math.floor(Math.random() * 1000),
            rating: 1200
        };

        console.log(`🔐 Testing authentication with user: ${testUser.username}`);
        socket.emit('authenticate', testUser);

        // Send test ping
        setTimeout(() => {
            console.log('🏓 Sending test ping...');
            socket.emit('ping', { timestamp: Date.now() });
        }, 1000);

        // Disconnect after 10 seconds
        setTimeout(() => {
            console.log('🔚 Test completed, disconnecting...');
            socket.disconnect();
            process.exit(0);
        }, 10000);
    });

    socket.on('authenticated', (data) => {
        console.log(`🔐 Authentication result:`, data);
    });

    socket.on('pong', (data) => {
        const latency = Date.now() - data.timestamp;
        console.log(`🏓 Pong received, latency: ${latency}ms`);
    });

    socket.on('disconnect', (reason) => {
        console.log(`❌ Disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
        console.error(`❌ Connection error: ${error.message}`);
        process.exit(1);
    });
}

testConnection().catch(console.error);