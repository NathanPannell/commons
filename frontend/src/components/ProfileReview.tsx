import type { ProfileSummary } from '../types'

interface Props {
  profile: ProfileSummary
  onConfirm: () => void
  onBack: () => void
}

export function ProfileReview({ profile, onConfirm, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900">Profile parsed</h2>
          <p className="text-gray-500 mt-1">Review what BridgeIn understood about you before searching.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 mb-6">
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
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Angles (used for search)</p>
            <ul className="space-y-1">
              {profile.angles.map((a, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← Edit profile
          </button>
          <button
            onClick={onConfirm}
            className="flex-2 flex-grow-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
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
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}

function ChipRow({ label, chips, color }: { label: string; chips: string[]; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
  }
  const cls = colorMap[color] ?? 'bg-gray-100 text-gray-700'

  if (chips.length === 0) return null

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">{label}</p>
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
