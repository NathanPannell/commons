import { useState } from 'react'
import { createPortal } from 'react-dom'
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
      <div className="group animate-fade-in">
        <button
          onClick={() => setModalOpen(true)}
          className="w-full text-left bg-white border border-border-warm rounded-xl p-5 hover:border-sage hover:shadow-elevated transition-all duration-200 relative overflow-hidden"
        >
          {/* Top row: badge + match score */}
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md ${config.badgeBg}`}>
              <span>{config.icon}</span>
              {config.label}
            </span>
          </div>

          {/* Title & subtitle */}
          <h3 className="font-semibold text-ink text-base leading-snug mb-0.5">{card.title}</h3>
          <p className="text-sm text-muted mb-3">{card.subtitle}</p>

          {/* Why relevant */}
          <p className="text-sm text-ink leading-relaxed line-clamp-2">{card.why_relevant}</p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-3 text-xs text-muted">
            {card.date && (
              <span className="flex items-center gap-1">
                📅
                <span>{new Date(card.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </span>
            )}
            {card.location && (
              <span className="flex items-center gap-1">
                📍 {card.location}
              </span>
            )}
            {card.outreach_message && (
              <span className="ml-auto text-terra-cta font-medium">View outreach →</span>
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
            className="mt-2 w-full text-sm font-medium text-terra-cta hover:text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-lg py-2 transition-colors"
          >
            👥 Find people at this event →
          </button>
        )}
      </div>

      {modalOpen && createPortal(
        <OutreachModal card={card} onClose={() => setModalOpen(false)} />,
        document.body,
      )}
      {findPeopleOpen && profile && createPortal(
        <FindPeopleModal
          eventCard={card}
          profile={profile}
          onClose={() => setFindPeopleOpen(false)}
        />,
        document.body,
      )}
    </>
  )
}
