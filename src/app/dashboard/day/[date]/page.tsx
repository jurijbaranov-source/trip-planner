'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Profile } from '@/types'
import { getTripsForDate } from '@/lib/trips'

interface WeatherData {
  temp: number
  feelsLike: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

export default function DayDetailPage() {
  const params = useParams()
  const router = useRouter()
  const date = params.date as string

  const [supabase] = useState(() => createClient())
  const [userId, setUserId] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [availableIds, setAvailableIds] = useState<string[]>([])
  const [tripWeathers, setTripWeathers] = useState<Record<number, WeatherData | null | 'too_far'>>({})
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({})
  const [myVote, setMyVote] = useState<number | null>(null)
  const [removedIds, setRemovedIds] = useState<number[]>([])
  const [voting, setVoting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [
        { data: { user } },
        { data: profilesData },
        { data: availData },
        { data: votesData },
        { data: removedData },
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('profiles').select('*'),
        supabase.from('availability').select('user_id').eq('date', date),
        supabase.from('votes').select('user_id, trip_id').eq('date', date),
        supabase.from('removed_trips').select('trip_id'),
      ])

      setUserId(user?.id ?? null)
      setProfiles(profilesData ?? [])
      setAvailableIds((availData ?? []).map((a: any) => a.user_id))

      const counts: Record<number, number> = {}
      for (const v of (votesData ?? [])) {
        counts[v.trip_id] = (counts[v.trip_id] ?? 0) + 1
      }
      setVoteCounts(counts)

      const mine = votesData?.find(v => v.user_id === user?.id)
      setMyVote(mine?.trip_id ?? null)

      const removed = (removedData ?? []).map((r: any) => r.trip_id)
      setRemovedIds(removed)
      setLoading(false)

      const trips = getTripsForDate(date, removed)
      const weatherResults = await Promise.all(
        trips.map(async (trip) => {
          try {
            const res = await fetch(`/api/weather?date=${date}&city=${encodeURIComponent(trip.city)}`)
            if (res.ok) return { id: trip.id, data: await res.json() as WeatherData }
            const body = await res.json().catch(() => ({}))
            return { id: trip.id, data: body.error === 'too_far' ? 'too_far' as const : null }
          } catch {
            return { id: trip.id, data: null }
          }
        })
      )

      const weatherMap: Record<number, WeatherData | null> = {}
      for (const r of weatherResults) weatherMap[r.id] = r.data
      setTripWeathers(weatherMap)
    }

    loadData()
  }, [date, supabase])

  async function handleVote(tripId: number) {
    if (!userId || voting) return
    setVoting(true)

    if (myVote === tripId) {
      await supabase.from('votes').delete().eq('user_id', userId).eq('date', date)
      setVoteCounts(prev => ({ ...prev, [tripId]: Math.max(0, (prev[tripId] ?? 1) - 1) }))
      setMyVote(null)
    } else {
      await supabase.from('votes').upsert(
        { user_id: userId, date, trip_id: tripId },
        { onConflict: 'user_id,date' }
      )
      setVoteCounts(prev => {
        const next = { ...prev }
        if (myVote !== null) next[myVote] = Math.max(0, (next[myVote] ?? 1) - 1)
        next[tripId] = (next[tripId] ?? 0) + 1
        return next
      })
      setMyVote(tripId)
    }

    setVoting(false)
  }

  async function handleRemove(tripId: number) {
    await supabase.from('votes').delete().eq('trip_id', tripId)
    await supabase.from('removed_trips').insert({ trip_id: tripId })
    setRemovedIds(prev => [...prev, tripId])
    if (myVote === tripId) setMyVote(null)
    setVoteCounts(prev => { const next = { ...prev }; delete next[tripId]; return next })
    setTripWeathers(prev => { const next = { ...prev }; delete next[tripId]; return next })
  }

  const [y, m, d] = date.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const formattedDate = dateObj.toLocaleDateString('cs-CZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const availableProfiles = profiles.filter(p => availableIds.includes(p.id))
  const trips = getTripsForDate(date, removedIds)
  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Načítám...</div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Hlavička */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-lg"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-900 capitalize">{formattedDate}</h2>
      </div>

      {/* Kdo má volno */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Kdo má volno ({availableProfiles.length})
        </h3>
        {availableProfiles.length === 0 ? (
          <p className="text-sm text-gray-400">Zatím nikdo nemá tento den volno.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableProfiles.map(profile => (
              <div
                key={profile.id}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-sm font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-xs font-bold">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                {profile.full_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doporučené výlety s hlasováním */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">Doporučené výlety</h3>
          {totalVotes > 0 && (
            <span className="text-xs text-gray-400">{totalVotes} {totalVotes === 1 ? 'hlas' : totalVotes < 5 ? 'hlasy' : 'hlasů'}</span>
          )}
        </div>
        <div className="space-y-4">
          {trips.map(trip => {
            const weather = tripWeathers[trip.id]
            const votes = voteCounts[trip.id] ?? 0
            const isMyVote = myVote === trip.id
            const votePercent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0

            return (
              <div
                key={trip.id}
                className={`rounded-xl overflow-hidden border-2 transition-colors ${isMyVote ? 'border-blue-400' : 'border-gray-100'}`}
              >
                <div className="flex gap-4">
                  <img
                    src={trip.imageUrl}
                    alt={trip.name}
                    className="w-28 h-28 object-cover flex-shrink-0"
                  />
                  <div className="p-3 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-800">{trip.name}</h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleVote(trip.id)}
                          disabled={voting}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            isMyVote
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          👍 {votes}
                        </button>
                        <button
                          onClick={() => handleRemove(trip.id)}
                          title="Byli jsme tu"
                          className="p-1 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{trip.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span>📍 {trip.distance}</span>
                      <span>⏱ {trip.duration}</span>
                      <span>🥾 {trip.difficulty}</span>
                    </div>
                  </div>
                </div>

                {totalVotes > 0 && (
                  <div className="px-4 pt-2 pb-1">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isMyVote ? 'bg-blue-400' : 'bg-gray-300'}`}
                        style={{ width: `${votePercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50 flex items-center gap-3">
                  <span className="text-xs text-gray-400 flex-shrink-0">Počasí v {trip.city}:</span>
                  {weather === undefined ? (
                    <span className="text-xs text-gray-400">Načítám...</span>
                  ) : weather === 'too_far' ? (
                    <span className="text-xs text-gray-400">Počasí zatím není známé, doplní se později ☁️</span>
                  ) : weather === null ? (
                    <span className="text-xs text-gray-400">Předpověď nedostupná</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                          alt={weather.description}
                          className="w-8 h-8"
                        />
                        <span className="text-sm font-semibold text-gray-800">{weather.temp}°C</span>
                        <span className="text-xs text-gray-500 capitalize">{weather.description}</span>
                      </div>
                      <span className="text-xs text-gray-400">💧 {weather.humidity}%</span>
                      <span className="text-xs text-gray-400">💨 {weather.windSpeed} km/h</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {myVote === null && trips.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">Klikni na 👍 u výletu, který chceš jet</p>
        )}
      </div>

    </div>
  )
}
