import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 500 })

  try {
    const city = request.nextUrl.searchParams.get('city') ?? 'Praha'
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},CZ&appid=${apiKey}&units=metric&lang=cs&cnt=40`
    )
    if (!res.ok) return NextResponse.json({ error: 'OpenWeather error' }, { status: 502 })

    const data = await res.json()

    const targetDate = new Date(`${date}T12:00:00`)
    let closest: any = null
    let minDiff = Infinity

    for (const entry of data.list) {
      const entryTime = new Date(entry.dt * 1000)
      const diff = Math.abs(entryTime.getTime() - targetDate.getTime())
      if (diff < minDiff) {
        minDiff = diff
        closest = entry
      }
    }

    if (!closest) return NextResponse.json({ error: 'too_far' }, { status: 404 })

    // Ověř že nalezený záznam je skutečně na správném dni (tolerance 12 hodin)
    const closestDate = new Date(closest.dt * 1000)
    const sameDay =
      closestDate.getFullYear() === targetDate.getFullYear() &&
      closestDate.getMonth() === targetDate.getMonth() &&
      closestDate.getDate() === targetDate.getDate()

    if (!sameDay) return NextResponse.json({ error: 'too_far' }, { status: 404 })

    return NextResponse.json({
      temp: Math.round(closest.main.temp),
      feelsLike: Math.round(closest.main.feels_like),
      description: closest.weather[0].description,
      icon: closest.weather[0].icon,
      humidity: closest.main.humidity,
      windSpeed: Math.round(closest.wind.speed * 3.6),
    })
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
