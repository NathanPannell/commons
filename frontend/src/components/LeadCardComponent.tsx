import { useState } from 'react'
import type { LeadCard, LeadType, ProfileSummary } from '../types'
import { OutreachModal } from './OutreachModal'
import { FindPeopleModal } from './FindPeopleModal'

export const LEAD_TYPE_CONFIG: Record<
  LeadType,
  { icon: string; label: string; bgLight: string; textColor: string; badgeBg: string }
> = {
  event: {
    icon: '📅',
    label: 'Event',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-100 text-blue-700',
  },
  person: {
    icon: '👤',
    label: 'Person',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    badgeBg: 'bg-purple-100 text-purple-700',
  },
  community: {
    icon: '🤝',
    label: 'Community',
    bgLight: 'bg-green-50',
    textColor: 'text-green-700',
    badgeBg: 'bg-green-100 text-green-700',
  },
  company: {
    icon: '🏢',
    label: 'Company',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-700',
    badgeBg: 'bg-orange-100 text-orange-700',
  },
  resource: {
    icon: '📚',
    label: 'Resource',
    bgLight: 'bg-gray-50',
    textColor: 'text-gray-700',
    badgeBg: 'bg-gray-100 text-gray-700',
  },
}

interface Props {
  card: LeadCard
  profile?: ProfileSummary
}

export function LeadCardComponent({ card, profile }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [findPeopleOpen, setFindPeopleOpen] = useState(false)
  const config = LEAD_TYPE_CONFIG[card.lead_type]

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="w-full text-left bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-150 animate-fade-in"
      >
        {/* Type badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.badgeBg}`}>
            <span>{config.icon}</span>
            {config.label}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-400"
                style={{ width: `${card.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{Math.round(card.confidence * 100)}%</span>
          </div>
        </div>

        {/* Title & subtitle */}
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1">{card.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{card.subtitle}</p>

        {/* Why relevant */}
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{card.why_relevant}</p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          {card.date && <span>📅 {new Date(card.date).toLocaleDateString()}</span>}
          {card.location && <span>📍 {card.location}</span>}
          {card.outreach_message && (
            <span className="ml-auto text-indigo-500 font-medium">Has outreach message →</span>
          )}
        </div>
      </button>

      {/* Find People button — event cards only */}
      {card.lead_type === 'event' && profile && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setFindPeopleOpen(true)
          }}
          className="mt-2 w-full text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl py-2 transition-colors"
        >
          👥 Find people at this event →
        </button>
      )}

      {modalOpen && <OutreachModal card={card} onClose={() => setModalOpen(false)} />}
      {findPeopleOpen && profile && (
        <FindPeopleModal
          eventCard={card}
          profile={profile}
          onClose={() => setFindPeopleOpen(false)}
        />
      )}
    </>
  )
}
