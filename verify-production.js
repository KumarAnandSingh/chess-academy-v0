import fetch from 'node-fetch';

console.log('🚀 Verifying production deployment...\n');

async function verifyProduction() {
    const tests = [
        {
            name: 'Main Site',
            url: 'https://www.studyify.in',
            expected: 'studyify'
        },
        {
            name: 'Multiplayer Page',
            url: 'https://www.studyify.in/multiplayer',
            expected: 'chess'
        },
        {
            name: 'Railway Backend',
            url: 'https://web-production-4fb4.up.railway.app',
            expected: 'socket'
        }
    ];

    for (const test of tests) {
        try {
            console.log(`🔍 Testing ${test.name}: ${test.url}`);

            const response = await fetch(test.url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; TestBot/1.0)'
                }
            });

            if (response.ok) {
                const text = await response.text();
                const containsExpected = text.toLowerCase().includes(test.expected);

                console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
                console.log(`   Contains "${test.expected}": ${containsExpected ? '✅' : '❌'}`);
                console.log(`   Content length: ${text.length} chars`);

                if (test.name === 'Railway Backend') {
                    try {
                        const json = JSON.parse(text);
                        console.log(`   Backend status: ${json.status}`);
                        console.log(`   Backend message: ${json.message}`);
                    } catch (e) {
                        console.log('   Could not parse as JSON');
                    }
                }
            } else {
                console.log(`❌ ${test.name}: ${response.status} ${response.statusText}`);
            }

            console.log('');

        } catch (error) {
            console.error(`❌ Error testing ${test.name}: ${error.message}\n`);
        }
    }
}

verifyProduction().catch(console.error);