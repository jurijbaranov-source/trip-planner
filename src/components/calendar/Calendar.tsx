'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'
import type { Profile, Availability } from '@/types'
import CalendarDay from './CalendarDay'

const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
const DAYS = ['Po','Út','St','Čt','Pá','So','Ne']

interface Props {
  currentUserId: string
  allProfiles: Profile[]
}

export default function Calendar({ currentUserId, allProfiles }: Props) {
  const [supabase] = useState(() => createClient())
  const today = new Date()

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchAvailability = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const to = new Date(year, month + 1, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('availability')
      .select('*')
      .gte('date', from)
      .lte('date', to)

    setAvailability(data ?? [])
    if (!silent) setLoading(false)
  }, [supabase, year, month])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  useEffect(() => {
    const channel = supabase
      .channel(`availability-${year}-${month}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability' }, () => {
        fetchAvailability(true)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, year, month, fetchAvailability])

  async function toggleDay(dateStr: string) {
    setToggling(dateStr)
    const isAvailable = availability.some(a => a.user_id === currentUserId && a.date === dateStr)

    if (isAvailable) {
      await supabase.from('availability').delete()
        .eq('user_id', currentUserId)
        .eq('date', dateStr)
    } else {
      await supabase.from('availability').insert({ user_id: currentUserId, date: dateStr })
    }

    await fetchAvailability()
    setToggling(null)
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-xl">‹</button>
        <h3 className="text-lg font-semibold text-gray-800">{MONTHS[month]} {year}</h3>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-xl">›</button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {loading ? (
        <div className="h-56 flex items-center justify-center text-gray-400 text-sm">Načítám...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayData = availability.filter(a => a.date === dateStr)
            const cellMs = new Date(year, month, day).getTime()

            return (
              <CalendarDay
                key={dateStr}
                day={day}
                dateStr={dateStr}
                count={dayData.length}
                total={allProfiles.length}
                isCurrentUser={dayData.some(a => a.user_id === currentUserId)}
                isToday={cellMs === todayMs}
                isPast={cellMs < todayMs}
                isToggling={toggling === dateStr}
                onToggle={toggleDay}
              />
            )
          })}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" /><span>nikdo</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100" /><span>pár lidí</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-300" /><span>polovina</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /><span>většina</span></div>
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200">
          <span className="font-bold text-blue-700">tučné</span><span>= ty máš volno</span>
        </div>
      </div>
    </div>
  )
}
