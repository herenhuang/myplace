import Component from '@/components/ui/hero-scroll-animation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Component user={user} />
  );
}
