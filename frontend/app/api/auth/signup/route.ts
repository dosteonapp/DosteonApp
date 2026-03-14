import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const requestUrl = new URL(request.url)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { email, password, role, firstName, lastName } = await request.json()

    // 1. Sign up with Supabase Auth
    // We pass data in options to allow the Postgres trigger to pick it up
    const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                role: role || 'restaurant',
            }
        }
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!user) {
        return NextResponse.json({ error: "Signup failed" }, { status: 500 })
    }

    // Note: Profile creation is handled by the 'on_auth_user_created' trigger 
    // in the database (see backend/supabase_schema.sql)


    return NextResponse.json({
        message: "Signup successful",
        user: {
            id: user.id,
            email: user.email,
            role: role
        }
    })
}
