import { useEffect, useState } from 'react'

const SEARCHING_MESSAGES = [
  'Scouring LinkedIn for warm intros...',
  'Cross-referencing your skills with open roles...',
  'Finding events where your people hang out...',
  'Checking who\'s hiring in your target cities...',
  'Digging through Slack communities...',
  'Matching you with founders in your space...',
  'Scanning meetup groups near you...',
  'Hunting for co-op postings...',
  'Reading conference speaker lists...',
  'Finding open-source projects you\'d vibe with...',
  'Checking job boards the bots haven\'t found yet...',
  'Looking for mentors with your background...',
  'Mapping your industry\'s hidden network...',
  'Finding Discord servers worth joining...',
  'Cross-checking company culture reviews...',
  'Surfacing newsletter communities...',
]

interface Props {
  phase: 'analyzing' | 'searching'
}

export function SearchAngles({ phase }: Props) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [fade, setFade] = useState(true)
  // Controls the cross-fade between analyzing → searching
  const [visible, setVisible] = useState(true)
  const [displayPhase, setDisplayPhase] = useState(phase)

  // Animate phase transitions
  useEffect(() => {
    if (phase !== displayPhase) {
      setVisible(false)
      const timer = setTimeout(() => {
        setDisplayPhase(phase)
        setMsgIndex(0)
        setFade(true)
        setVisible(true)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [phase, displayPhase])

  // Rotate searching messages
  useEffect(() => {
    if (displayPhase !== 'searching') return
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % SEARCHING_MESSAGES.length)
        setFade(true)
      }, 300)
    }, 2000)
    return () => clearInterval(interval)
  }, [displayPhase])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-surface">
      <div
        className={`max-w-md w-full px-6 text-center transition-all duration-400 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {displayPhase === 'analyzing' ? (
          /* ── Analyzing phase: pulsing document orb ── */
          <>
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-terra-cta/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-2 rounded-full bg-terra-cta/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
              <div className="absolute inset-4 rounded-full bg-terra-cta/40 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-terra-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-ink mb-2">
              Analyzing your resume
            </h2>
            <p className="text-sm text-muted">
              Extracting skills, experience, and building your professional profile...
            </p>

            <div className="flex items-center justify-center gap-1.5 mt-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-terra-cta animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </>
        ) : (
          /* ── Searching phase: orbiting network + rotating messages ── */
          <>
            <div className="relative w-32 h-32 mx-auto mb-10">
              {/* Orbiting dots */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 72}deg) translateY(-48px)`,
                    transformOrigin: '0 0',
                    animation: `orbit 6s linear infinite`,
                    animationDelay: `${i * -1.2}s`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full bg-terra-cta"
                    style={{
                      animation: 'pulse 2s ease-in-out infinite',
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                </div>
              ))}

              {/* Center orb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-terra-cta/20 to-primary-200"
                    style={{ animation: 'pulse 3s ease-in-out infinite' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-terra-cta/80 shadow-glow" />
                  </div>
                </div>
              </div>

              {/* Dashed orbit ring */}
              <svg className="absolute inset-0 w-full h-full" style={{ animation: 'spin 20s linear infinite' }}>
                <circle cx="64" cy="64" r="48" fill="none" stroke="currentColor" className="text-border-warm" strokeWidth="1" strokeDasharray="4 8" />
              </svg>
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-3">
              Building Your Network
            </p>

            <div className="h-8 flex items-center justify-center">
              <p
                className={`text-base text-ink font-medium transition-all duration-300 ${
                  fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                {SEARCHING_MESSAGES[msgIndex]}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-terra-cta"
                  style={{
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
