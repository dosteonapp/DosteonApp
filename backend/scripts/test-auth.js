// Using global fetch (Node 18+)
// If node 18+, global fetch is available.

async function testAuth() {
    const baseUrl = 'http://127.0.0.1:4000/api/auth';
    const email = `test.user.${Date.now()}@gmail.com`;
    const password = 'Password123!';

    const fs = require('fs');
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync('test-results.txt', msg + '\n');
    };

    fs.writeFileSync('test-results.txt', ''); // Clear file

    log(`Testing with email: ${email}`);

    // 1. Test Signup
    log('\n--- Signup ---');
    try {
        const signupRes = await fetch(`${baseUrl}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                role: 'restaurant',
                firstName: 'Test',
                lastName: 'User'
            })
        });
        const signupData = await signupRes.json();
        log(`Status: ${signupRes.status}`);
        log(`Response: ${JSON.stringify(signupData, null, 2)}`);
    } catch (e) {
        log(`Signup Error: ${e.message}`);
    }

    // 2. Test Login
    log('\n--- Login ---');
    try {
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password
            })
        });
        const loginData = await loginRes.json();
        log(`Status: ${loginRes.status}`);
        log(`Response: ${JSON.stringify(loginData, null, 2)}`);

        if (loginData.role === 'restaurant') {
            log('\n✅ SUCCESS: Role verified as restaurant');
        } else {
            log('\n❌ FAILURE: Role mismatch or missing');
        }

    } catch (e) {
        log(`Login Error: ${e.message}`);
    }
}

testAuth();
