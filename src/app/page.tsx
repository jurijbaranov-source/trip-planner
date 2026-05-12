import { createClient } from '@/lib/supabase/server'
import Calendar from '@/components/calendar/Calendar'
import type { Profile } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profiles } = await supabase.from('profiles').select('*')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Sdílený kalendář</h2>
        <p className="text-sm text-gray-500 mt-1">
          Klikni na <span className="font-medium text-blue-600">+</span> u dne kdy máš volno.
          Čím tmavší zelená, tím více lidí má volno. Kliknutím na den otevřeš detail.
        </p>
      </div>
      <Calendar
        currentUserId={user!.id}
        allProfiles={(profiles ?? []) as Profile[]}
      />
    </div>
  )
}