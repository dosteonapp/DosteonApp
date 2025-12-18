const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Signup
router.post('/signup', async (req, res) => {
    const { email, password, role, firstName, lastName } = req.body;

    try {
        let user, authError;

        // 1. Sign up with Supabase Auth (Triggers Email Verification)
        const { data: authData, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    role: role || 'restaurant'
                }
            }
        });

        user = authData.user;
        authError = error;

        if (authError) return res.status(400).json({ error: authError.message });
        if (!user) return res.status(500).json({ error: 'Signup failed' });

        // 2. Create Profile
        // Service Role Key allows us to write to 'profiles' table directly (Bypassing RLS)
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert([{
                id: user.id,
                email: email,
                role: role || 'restaurant',
                first_name: firstName,
                last_name: lastName
            }]);

        if (profileError) {
            console.error('Profile error:', profileError);
            // If profile fails, ideally we rollback user, but that's hard.
            return res.status(500).json({ error: 'Failed to create user profile' });
        }

        res.json({
            message: 'Signup successful',
            user: { id: user.id, email: user.email, role }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) return res.status(401).json({ error: authError.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Fetch Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return res.status(500).json({ error: 'Failed to fetch user profile' });
        }

        res.json({
            user: { id: user.id, email: user.email },
            role: profile.role,
            access_token: session.access_token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
