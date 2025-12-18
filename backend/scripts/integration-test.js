const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

// Validate key presence
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testAdminCreate() {
    const email = `test_admin_${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    console.log(`Attempting to create user (Admin API): ${email}`);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            first_name: 'AdminTest',
            last_name: 'User',
            role: 'restaurant'
        }
    });

    if (error) {
        console.error('❌ Admin user creation failed', error);
        process.exit(1);
    }

    console.log('✅ Admin user created successfully:', data.user.email);
    console.log('User ID:', data.user.id);

    // Optional: Check if profile creation is needed (if not verifying HTTP endpoint)
    // But this script proves the backend CAN create users validly.
}

testAdminCreate();
