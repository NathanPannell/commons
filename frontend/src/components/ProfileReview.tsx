import type { ProfileSummary } from '../types'

interface Props {
  profile: ProfileSummary
  onConfirm: () => void
  onBack: () => void
}

export function ProfileReview({ profile, onConfirm, onBack }: Props) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
        {/* Success banner */}
        <div className="text-center mb-10 animate-fade-in">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-terra-cta mb-3">
            Profile Intelligence Ready
          </p>
          <h1 className="font-display text-4xl font-bold text-ink tracking-tight mb-2">
            {profile.name ?? 'Your Profile'}
          </h1>
          <p className="text-base text-muted max-w-xl mx-auto">
            Our AI has analyzed your professional footprint. Review the extracted data below to optimize your networking reach.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left column — 3/5 */}
          <div className="lg:col-span-3 space-y-6 animate-fade-in-up">
            {/* Name card */}
            <div className="bg-white border border-border-warm rounded-xl p-6 shadow-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-900" />
              <div className="pl-4">
                {profile.education && (
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-1">Education</p>
                    <p className="text-sm text-ink">{profile.education}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-1">Experience Highlights</p>
                  <p className="text-sm text-ink leading-relaxed">{profile.experience_summary}</p>
                </div>
              </div>
            </div>

            {/* AI Search Angles */}
            <div className="bg-white border border-border-warm rounded-xl p-6 shadow-card">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-4">
                AI-Derived Search Angles
              </p>
              <div className="space-y-3">
                {profile.angles.map((angle, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg border-l-2 border-terra-cta"
                  >
                    <span className="text-terra-cta text-sm mt-0.5">🔍</span>
                    <p className="text-sm text-ink leading-relaxed">{angle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — 2/5 */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Intelligence Taxonomies card */}
            <div className="bg-white border border-border-warm rounded-xl p-6 shadow-card space-y-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-1">
                Intelligence Taxonomies
              </p>

              <TaxonomySection label="Core Skills" items={profile.skills} variant="skill" />
              <TaxonomySection label="Target Roles" items={profile.target_roles} variant="role" />
              <TaxonomySection label="Industries" items={profile.target_industries} variant="industry" />
              <TaxonomySection label="Locations" items={profile.locations} variant="location" />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-border-warm z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {['bg-primary-300', 'bg-sage-light', 'bg-terra'].map((bg, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white`} />
              ))}
              <div className="w-8 h-8 rounded-full bg-primary-900 border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">AI</span>
              </div>
            </div>
            <p className="text-sm text-muted hidden sm:block">
              Matching with <span className="font-semibold text-ink">1,240+</span> potential leads...
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 border border-border-warm text-ink font-semibold rounded-lg hover:bg-sage-muted transition-colors text-sm"
            >
              Edit Profile
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 bg-primary-900 hover:bg-primary-950 text-white font-semibold rounded-lg shadow-glow transition-all text-sm"
            >
              Search for leads
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaxonomySection({
  label,
  items,
  variant,
}: {
  label: string
  items: string[]
  variant: 'skill' | 'role' | 'industry' | 'location'
}) {
  if (items.length === 0) return null

  const styles: Record<string, string> = {
    skill:    'bg-white border border-border-warm shadow-card text-ink',
    role:     'bg-terra/20 border border-terra-cta/20 text-primary-900',
    industry: 'bg-primary-100 text-primary-800',
    location: 'bg-white border border-border-warm shadow-card text-ink',
  }

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className={`text-xs font-medium px-2.5 py-1 rounded-md ${styles[variant]}`}
          >
            {variant === 'location' && '📍 '}{item}
          </span>
        ))}
      </div>
    </div>
  )
}
