import { useState } from 'react'
import type { LeadCard } from '../types'
import { LEAD_TYPE_CONFIG } from './LeadCardComponent'

interface Props {
  card: LeadCard
  onClose: () => void
}

const TONES = ['Direct & Professional', 'Warm & Shared Interest', 'Technical Focused'] as const

export function OutreachModal({ card, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [activeTone, setActiveTone] = useState(0)
  const config = LEAD_TYPE_CONFIG[card.lead_type]

  async function handleCopy() {
    if (!card.outreach_message) return
    await navigator.clipboard.writeText(card.outreach_message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-modal max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left panel — Lead info */}
        <div className="md:w-2/5 bg-primary-50 p-6 border-r border-border-warm overflow-y-auto">
          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 text-muted hover:text-ink"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Lead header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{config.icon}</span>
              <span className={`text-[10px] font-semibold uppercase tracking-widest ${config.textColor}`}>
                {card.lead_type}
              </span>
            </div>
            <h2 className="text-xl font-display font-bold text-ink">{card.title}</h2>
            <p className="text-sm text-muted mt-1">{card.subtitle}</p>
          </div>

          {/* Lead insights */}
          <section className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-2">
              Lead Insights
            </p>
            <p className="text-sm text-ink leading-relaxed">{card.why_relevant}</p>
          </section>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-5 text-sm">
            {card.date && (
              <span className="flex items-center gap-1.5 text-muted bg-white rounded-md px-2 py-1 text-xs">
                📅 {new Date(card.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {card.location && (
              <span className="flex items-center gap-1.5 text-muted bg-white rounded-md px-2 py-1 text-xs">
                📍 {card.location}
              </span>
            )}
            {card.platform && (
              <span className="flex items-center gap-1.5 text-muted bg-white rounded-md px-2 py-1 text-xs">
                ⚡ {card.platform}
              </span>
            )}
          </div>

          {/* Action plan */}
          <section className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-2">
              Action Plan
            </p>
            <p className="text-sm text-ink leading-relaxed">{card.action_plan}</p>
          </section>

          {/* Sources */}
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-2">
              Sources
            </p>
            <div className="flex flex-col gap-1.5">
              {card.source_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-terra-cta hover:underline truncate"
                >
                  {url}
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Right panel — Outreach template */}
        <div className="md:w-3/5 p-6 overflow-y-auto flex flex-col">
          {/* Close button (desktop) */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-ink">AI Outreach Template</h3>
            <button
              onClick={onClose}
              className="hidden md:block text-muted hover:text-ink transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tone selector */}
          <div className="flex flex-wrap gap-2 mb-5">
            {TONES.map((tone, i) => (
              <button
                key={tone}
                onClick={() => setActiveTone(i)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                  activeTone === i
                    ? 'bg-terra-cta text-white'
                    : 'bg-primary-100 text-ink hover:bg-primary-200'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>

          {/* Outreach message */}
          {card.outreach_message ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-primary-50 border border-border-warm rounded-lg p-5 flex-1">
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                  {card.outreach_message}
                </p>
              </div>

              <p className="text-[10px] text-muted/50 mt-2 text-right">AI Assisted</p>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCopy}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    copied
                      ? 'bg-success-50 text-success-700 border border-success-500/20'
                      : 'bg-primary-900 hover:bg-primary-950 text-white shadow-glow'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button className="px-5 py-2.5 border border-border-warm text-ink font-semibold rounded-lg hover:bg-sage-muted transition-colors text-sm">
                  Save Lead
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted py-12">
              <div>
                <p className="text-sm font-medium">No outreach template available</p>
                <p className="text-xs mt-1">This lead type may not require direct outreach.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
