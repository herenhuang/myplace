'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  return redirect('/')
}

export async function oAuthSignIn(formData: FormData) {
  const provider = formData.get('provider')

  if (!provider || typeof provider !== 'string') {
    return redirect('/login?message=No provider selected')
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const origin = headers().get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error(error)
    return redirect('/login?message=Could not authenticate user')
  }

  return redirect(data.url)
}
