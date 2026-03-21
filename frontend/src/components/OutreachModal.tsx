import { useState } from 'react'
import type { LeadCard } from '../types'
import { LEAD_TYPE_CONFIG } from './LeadCardComponent'

interface Props {
  card: LeadCard
  onClose: () => void
}

export function OutreachModal({ card, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const config = LEAD_TYPE_CONFIG[card.lead_type]

  async function handleCopy() {
    if (!card.outreach_message) return
    await navigator.clipboard.writeText(card.outreach_message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 rounded-t-2xl ${config.bgLight} border-b border-gray-100`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{config.icon}</span>
                <span className={`text-xs font-semibold uppercase tracking-wide ${config.textColor}`}>
                  {card.lead_type}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{card.title}</h2>
              <p className="text-sm text-gray-600 mt-0.5">{card.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Why relevant */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Why this is relevant to you
            </h3>
            <p className="text-gray-800 text-sm leading-relaxed">{card.why_relevant}</p>
          </section>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-sm">
            {card.date && (
              <span className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(card.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {card.location && (
              <span className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {card.location}
              </span>
            )}
            {card.platform && (
              <span className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {card.platform}
              </span>
            )}
          </div>

          {/* Action plan */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Action plan
            </h3>
            <p className="text-gray-800 text-sm leading-relaxed">{card.action_plan}</p>
          </section>

          {/* Outreach message */}
          {card.outreach_message && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Outreach message
                </h3>
                <button
                  onClick={handleCopy}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {card.outreach_message}
                </p>
              </div>
            </section>
          )}

          {/* Sources */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Sources
            </h3>
            <div className="flex flex-col gap-1.5">
              {card.source_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                >
                  {url}
                </a>
              ))}
            </div>
          </section>

          {/* Confidence */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Confidence</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-400 transition-all"
                style={{ width: `${card.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{Math.round(card.confidence * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
