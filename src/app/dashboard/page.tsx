'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Calendar from '@/components/calendar/Calendar'
import type { Profile } from '@/types'

export default function DashboardPage() {
  const [supabase] = useState(() => createClient())
  const [userId, setUserId] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [{ data: { user } }, { data: profilesData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('profiles').select('*'),
      ])
      setUserId(user?.id ?? null)
      setProfiles(profilesData ?? [])
      setLoading(false)
    }
    loadData()
  }, [supabase])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Načítám...
    </div>
  )

  if (!userId) return null

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
        currentUserId={userId}
        allProfiles={profiles}
      />
    </div>
  )
}