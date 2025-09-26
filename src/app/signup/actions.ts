'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const name = formData.get('name') as string
  const supabase = await createClient()
  const heads = await headers()
  const origin = heads.get('origin')

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (password.length < 6) {
    return { error: 'Password should be at least 6 characters' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('User already registered')) {
        return redirect('/login')
    }
    console.error('Signup error:', error)
    return { error: 'Could not authenticate user' }
  }

  return { success: true }
}
