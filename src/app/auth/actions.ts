'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { type Provider } from '@supabase/supabase-js'

const PROVIDERS: Provider[] = ['google', 'github']

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/')
}

export async function oAuthSignIn(formData: FormData) {
  const provider = formData.get('provider') as Provider

  if (provider && !PROVIDERS.includes(provider)) {
    return redirect('/login?message=Unsupported provider')
  }

  const supabase = await createClient()
  const heads = await headers()
  const origin = heads.get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
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
