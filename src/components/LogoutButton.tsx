import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function LogoutButton() {
  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <form action={logout}>
      <button type="submit" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
        Odhlásit se
      </button>
    </form>
  )
}
