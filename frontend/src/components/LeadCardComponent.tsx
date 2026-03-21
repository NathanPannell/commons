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
    bgLight: 'bg-primary-50',
    textColor: 'text-terra-cta',
    badgeBg: 'bg-primary-100 text-terra-cta',
  },
  person: {
    icon: '👤',
    label: 'Person',
    bgLight: 'bg-sage-muted',
    textColor: 'text-ink',
    badgeBg: 'bg-sage-muted text-ink',
  },
  community: {
    icon: '🤝',
    label: 'Community',
    bgLight: 'bg-primary-50',
    textColor: 'text-ink',
    badgeBg: 'bg-primary-50 text-ink',
  },
  company: {
    icon: '🏢',
    label: 'Company',
    bgLight: 'bg-primary-100',
    textColor: 'text-terra-cta',
    badgeBg: 'bg-primary-100 text-terra-cta',
  },
  resource: {
    icon: '📚',
    label: 'Resource',
    bgLight: 'bg-sage-muted',
    textColor: 'text-muted',
    badgeBg: 'bg-sage-muted text-muted',
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
        className="w-full text-left bg-white border border-border-warm rounded-md p-5 hover:border-sage hover:shadow-card transition-all duration-150 animate-fade-in"
      >
        {/* Type badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.badgeBg}`}>
            <span>{config.icon}</span>
            {config.label}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-border-warm rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-terra-cta"
                style={{ width: `${card.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted">{Math.round(card.confidence * 100)}%</span>
          </div>
        </div>

        {/* Title & subtitle */}
        <h3 className="font-semibold text-ink text-base leading-snug mb-1">{card.title}</h3>
        <p className="text-sm text-muted mb-3">{card.subtitle}</p>

        {/* Why relevant */}
        <p className="text-sm text-ink leading-relaxed line-clamp-2">{card.why_relevant}</p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted">
          {card.date && <span>📅 {new Date(card.date).toLocaleDateString()}</span>}
          {card.location && <span>📍 {card.location}</span>}
          {card.outreach_message && (
            <span className="ml-auto text-terra-cta font-medium">Has outreach message →</span>
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
