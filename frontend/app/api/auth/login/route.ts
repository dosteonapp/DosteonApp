import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const requestUrl = new URL(request.url)
    const supabase = createClient()
    const { email, password } = await request.json()

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch profile to get role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error('Profile fetch error:', profileError)
        // Fallback or error? For now, successful auth is better than failing, but we need role.
        // Let's return error if role is strictly required.
        return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    return NextResponse.json({
        user: {
            id: user.id,
            email: user.email,
        },
        role: profile.role
    })
}
