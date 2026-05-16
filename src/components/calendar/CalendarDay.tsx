'use client'

import Link from 'next/link'

interface Props {
  day: number
  dateStr: string
  count: number
  total: number
  isCurrentUser: boolean
  isToday: boolean
  isPast: boolean
  isToggling: boolean
  onToggle: (dateStr: string) => void
}

function getColor(count: number, total: number): string {
  if (count === 0) return 'bg-gray-50'
  const r = count / Math.max(total, 1)
  if (r < 0.34) return 'bg-emerald-100'
  if (r < 0.67) return 'bg-emerald-300'
  return 'bg-emerald-500'
}

export default function CalendarDay({
  day, dateStr, count, total, isCurrentUser, isToday, isPast, isToggling, onToggle,
}: Props) {
  const isHighCount = total > 0 && count / total >= 0.67

  return (
    <div className={`
      relative rounded-xl ${isPast ? 'bg-gray-100' : getColor(count, total)}
      ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
    `}>
      <Link
        href={`/dashboard/day/${dateStr}`}
        className={`flex flex-col items-center justify-center aspect-square p-1 ${isPast ? 'pointer-events-none' : 'hover:brightness-95 transition-all'}`}
      >
        <span className={`text-sm leading-tight
          ${isPast ? 'font-medium text-gray-300' : isCurrentUser ? 'font-bold text-blue-700' : 'font-medium text-gray-700'}
          ${!isPast && isHighCount ? '!text-white' : ''}
        `}>
          {day}
        </span>
        {count > 0 && (
          <span className={`text-xs leading-tight ${isPast ? 'text-gray-300' : isHighCount ? 'text-white/80' : 'text-gray-400'}`}>
            {count}
          </span>
        )}
      </Link>

      {!isPast && (
        <button
          onClick={() => onToggle(dateStr)}
          disabled={isToggling}
          title={isCurrentUser ? 'Odznačit volný den' : 'Označit jako volný'}
          className={`
            absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[10px] font-bold
            flex items-center justify-center transition-all
            ${isCurrentUser
              ? 'bg-blue-500 text-white'
              : 'bg-white/80 text-gray-400 hover:bg-white border border-gray-200'
            }
            ${isToggling ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {isCurrentUser ? '✓' : '+'}
        </button>
      )}
    </div>
  )
}