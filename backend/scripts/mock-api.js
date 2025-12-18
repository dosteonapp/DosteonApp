const http = require('http');

const PORT = 4001;

let authenticatedUser = null;

const server = http.createServer((req, res) => {
    // CORS setup
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    console.log(`${req.method} ${pathname}`);

    // Helper to send JSON response
    const json = (data, code = 200) => {
        res.writeHead(code, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data }));
    };

    // Only handle /api/v1 routes
    if (pathname.startsWith('/api/v1')) {
        const path = pathname.replace('/api/v1', '');

        // Auth endpoints
        if (path === '/auth/signin' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const { email, password } = JSON.parse(body);

                // Emulate dynamic user based on email
                const accountType = email.includes('supplier') ? 'supplier' : 'restaurant';

                authenticatedUser = {
                    id: 'user_123',
                    email: email,
                    firstName: 'Test',
                    lastName: accountType === 'supplier' ? 'Supplier' : 'Restaurant',
                    accountType: accountType,
                    onboardingCompleted: true
                };

                return json({
                    user: authenticatedUser
                });
            });
            return;
        }

        if (path === '/auth/signup' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const { email, accountType } = JSON.parse(body);
                authenticatedUser = {
                    id: 'user_new',
                    email: email,
                    firstName: 'New',
                    lastName: 'User',
                    accountType: accountType || 'restaurant',
                    onboardingCompleted: true
                };
                return json({ message: 'Signup successful', user: authenticatedUser });
            });
            return;
        }

        if (path === '/auth/logout') {
            authenticatedUser = null;
            return json({ message: 'Logged out' });
        }

        if (path === '/auth/forgot-password' && req.method === 'POST') {
            return json({ message: 'Reset email sent' });
        }

        if (path === '/auth/reset-password' && req.method === 'POST') {
            return json({ message: 'Password reset successful' });
        }

        // User endpoint
        if (path === '/user' && req.method === 'GET') {
            if (!authenticatedUser) {
                return json({ message: 'Not authenticated' }, 401);
            }
            return json({
                ...authenticatedUser,
                _id: authenticatedUser.id,
                name: `${authenticatedUser.firstName} ${authenticatedUser.lastName}`,
                createdAt: new Date().toISOString(),
                emailVerified: true
            });
        }


        // Restaurant endpoints
        if (path === '/restaurant/stats') {
            return json({ revenue: 1000, orders: 50, active_listings: 12 });
        }
        if (path === '/restaurant/inventory/low-stock') {
            return json({ items: [] });
        }
        if (path === '/restaurant/orders/recent') {
            return json({ orders: [] });
        }

        // Inventory
        if (path.startsWith('/restaurant/inventory')) {
            // For GET list or items
            if (req.method === 'GET') return json({ items: [], total: 0 });
            // For POST/PUT/DELETE
            return json({ message: 'Operation successful', id: 'item_123' });
        }

        // Discovery/Network
        if (path.includes('/discover') || path.includes('/network')) {
            return json({ items: [], total: 0 });
        }

        // Categories
        if (path === '/general/product-categories') {
            return json({
                items: [
                    { id: '1', name: 'Vegetables' },
                    { id: '2', name: 'Meat' },
                    { id: '3', name: 'Dairy' }
                ]
            });
        }

        // Default catch-all for API
        return json({ message: 'Mock endpoint hit' });
    }

    // 404 for non-API
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Mock API running at http://localhost:${PORT}`);
});
