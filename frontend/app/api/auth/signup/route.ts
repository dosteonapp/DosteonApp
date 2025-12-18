import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const requestUrl = new URL(request.url)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { email, password, role, firstName, lastName } = await request.json()

    // 1. Sign up with Supabase Auth
    const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!user) {
        return NextResponse.json({ error: "Signup failed" }, { status: 500 })
    }

    // 2. Create Profile
    const { error: profileError } = await supabase
        .from('profiles')
        .insert([
            {
                id: user.id,
                email: email,
                role: role || 'restaurant', // Default to restaurant if not provided
                first_name: firstName,
                last_name: lastName,
            },
        ])

    if (profileError) {
        console.error('Profile creation error:', profileError)
        // Optional: Delete auth user if profile creation fails to maintain consistency?
        // For now, return error.
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

    return NextResponse.json({
        message: "Signup successful",
        user: {
            id: user.id,
            email: user.email,
            role: role
        }
    })
}
