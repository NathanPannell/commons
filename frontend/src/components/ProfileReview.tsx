import type { ProfileSummary } from '../types'

interface Props {
  profile: ProfileSummary
  onConfirm: () => void
  onBack: () => void
}

export function ProfileReview({ profile, onConfirm, onBack }: Props) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-display font-bold text-ink">Profile parsed</h2>
          <p className="text-muted mt-1">Review what BridgeIn understood about you before searching.</p>
        </div>

        <div className="bg-white border border-border-warm rounded-md p-6 space-y-5 mb-6 shadow-card">
          {profile.name && (
            <Row label="Name" value={profile.name} />
          )}
          {profile.education && (
            <Row label="Education" value={profile.education} />
          )}
          <Row label="Experience" value={profile.experience_summary} />
          <ChipRow label="Skills" chips={profile.skills} color="indigo" />
          <ChipRow label="Target roles" chips={profile.target_roles} color="purple" />
          <ChipRow label="Industries" chips={profile.target_industries} color="orange" />
          <ChipRow label="Locations" chips={profile.locations} color="green" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sage mb-2">Angles (used for search)</p>
            <ul className="space-y-1">
              {profile.angles.map((a, i) => (
                <li key={i} className="text-sm text-ink flex items-start gap-2">
                  <span className="text-terra-cta mt-0.5">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 border border-border-warm text-ink font-semibold py-3 rounded-md hover:bg-sage-muted transition-colors"
          >
            ← Edit profile
          </button>
          <button
            onClick={onConfirm}
            className="flex-2 flex-grow-[2] bg-terra-cta hover:bg-primary-800 text-ink font-semibold py-3 rounded-md transition-colors"
          >
            Search for leads →
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-sage mb-0.5">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  )
}

function ChipRow({ label, chips, color }: { label: string; chips: string[]; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-primary-100 text-terra-cta',
    purple: 'bg-sage-muted text-ink',
    orange: 'bg-primary-50 text-terra-cta',
    green:  'bg-sage-light text-ink',
  }
  const cls = colorMap[color] ?? 'bg-primary-50 text-ink'

  if (chips.length === 0) return null

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-sage mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip, i) => (
          <span key={i} className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}
