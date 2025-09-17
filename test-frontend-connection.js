import { io } from 'socket.io-client';

console.log('🎯 Testing frontend Socket.IO connection configuration...\n');

// Test the exact configuration used by the frontend
const backendUrl = process.env.VITE_BACKEND_URL || 'https://web-production-4fb4.up.railway.app';

console.log(`🔗 Backend URL from environment: ${backendUrl}`);
console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}\n`);

async function testFrontendConnection() {
    console.log('🔌 Creating Socket.IO connection with frontend configuration...');

    const socket = io(backendUrl, {
        // Exact same configuration as frontend
        transports: ['polling', 'websocket'],
        forceNew: false,
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 30000,
        reconnectionAttempts: 15,
        randomizationFactor: 0.3,
        upgrade: true,
        rememberUpgrade: true,
        autoConnect: true,
        withCredentials: false,
        extraHeaders: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
            'Cache-Control': 'no-cache'
        },
        query: {
            client: 'chess-academy',
            version: '1.0.0',
            platform: 'railway',
            timestamp: Date.now()
        }
    });

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            socket.disconnect();
            reject(new Error('Connection timeout after 30 seconds'));
        }, 30000);

        socket.on('connect', () => {
            clearTimeout(timeout);
            console.log(`✅ Connected successfully!`);
            console.log(`   Socket ID: ${socket.id}`);
            console.log(`   Transport: ${socket.io.engine.transport.name}`);

            // Test authentication like frontend does
            let userId = 'test-frontend-' + Math.random().toString(36).substr(2, 6);
            let username = 'FrontendTestPlayer' + Math.floor(Math.random() * 1000);

            const userData = {
                userId,
                username,
                rating: 1200 + Math.floor(Math.random() * 400)
            };

            console.log(`🔐 Testing authentication with: ${JSON.stringify(userData)}`);
            socket.emit('authenticate', userData);
        });

        socket.on('authenticated', (data) => {
            console.log(`🔐 Authentication successful:`, data);

            // Test matchmaking like frontend does
            console.log(`🎯 Testing matchmaking functionality...`);
            const matchmakingOptions = {
                timeControl: {
                    initial: 300, // 5 minutes
                    increment: 3,
                    type: 'blitz'
                }
            };

            socket.emit('join_matchmaking', matchmakingOptions);
        });

        socket.on('matchmaking_joined', (data) => {
            console.log(`🎯 Matchmaking joined:`, data);

            // Leave matchmaking and finish test
            socket.emit('leave_matchmaking');
            console.log(`✅ All frontend functionality tests passed!`);

            setTimeout(() => {
                socket.disconnect();
                resolve('Test completed successfully');
            }, 2000);
        });

        socket.on('heartbeat', (data) => {
            console.log(`💓 Heartbeat received:`, data.timestamp);
            socket.emit('heartbeat_ack', { timestamp: Date.now() });
        });

        socket.on('pong', (data) => {
            const latency = Date.now() - data.timestamp;
            console.log(`🏓 Pong received, latency: ${latency}ms`);
        });

        socket.on('disconnect', (reason) => {
            clearTimeout(timeout);
            console.log(`❌ Disconnected: ${reason}`);
            resolve('Disconnected: ' + reason);
        });

        socket.on('connect_error', (error) => {
            clearTimeout(timeout);
            console.error(`❌ Connection error: ${error.message}`);
            reject(error);
        });

        // Send periodic ping like frontend does
        setTimeout(() => {
            if (socket.connected) {
                console.log('🏓 Sending heartbeat ping...');
                socket.emit('ping', { timestamp: Date.now() });
            }
        }, 5000);
    });
}

testFrontendConnection()
    .then((result) => {
        console.log(`\n🎉 Test Result: ${result}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error(`\n❌ Test Failed: ${error.message}`);
        process.exit(1);
    });