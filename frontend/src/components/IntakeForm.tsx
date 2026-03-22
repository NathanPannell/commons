import { useRef, useState } from 'react'
import type { IntakeFormData } from '../types'

interface Props {
  onSubmit: (data: IntakeFormData) => void
}

export function IntakeForm({ onSubmit }: Props) {
  const [bioText, setBioText] = useState('')
  const [rolesInput, setRolesInput] = useState('')
  const [industriesInput, setIndustriesInput] = useState('')
  const [locationsInput, setLocationsInput] = useState('')
  const [interestsInput, setInterestsInput] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function parseTagInput(value: string): string[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!bioText.trim() && !pdfFile) {
      setError('Please paste your bio/resume text or upload a PDF.')
      return
    }

    onSubmit({
      bioText,
      pdfFile,
      roles: parseTagInput(rolesInput),
      industries: parseTagInput(industriesInput),
      locations: parseTagInput(locationsInput),
      interests: parseTagInput(interestsInput),
    })
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-16 w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — Hero */}
        <div className="animate-fade-in-up">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-4">
            Intelligence Network
          </p>
          <h1 className="font-display text-5xl font-bold text-ink leading-tight tracking-tight mb-6">
            Find your network — even if you don't have one yet.
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-lg">
            Commons uses AI to map your professional trajectory. Upload your experience
            or describe your journey to discover people, events, and communities tailored to you.
          </p>

          {/* Social proof / stats */}
          <div className="flex items-center gap-6 mt-10">
            <div>
              <p className="text-2xl font-display font-bold text-ink">1,240+</p>
              <p className="text-xs text-muted">Potential leads matched</p>
            </div>
            <div className="w-px h-10 bg-border-warm" />
            <div>
              <p className="text-2xl font-display font-bold text-ink">5</p>
              <p className="text-xs text-muted">Lead categories</p>
            </div>
            <div className="w-px h-10 bg-border-warm" />
            <div>
              <p className="text-2xl font-display font-bold text-ink">AI</p>
              <p className="text-xs text-muted">Powered outreach</p>
            </div>
          </div>
        </div>

        {/* Right — Form card with glassmorphism */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form
            onSubmit={handleSubmit}
            className="glass-warm border border-border-warm rounded-xl p-8 shadow-glass space-y-5"
          >
            {/* Experience textarea */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-sage mb-2">
                Experience & Narrative
              </label>
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={6}
                placeholder="Paste your resume or describe your career journey, achievements, and what makes your professional path unique..."
                className="w-full bg-white border border-border-warm rounded-lg px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terra-cta/30 focus:border-terra-cta resize-none shadow-card"
              />
            </div>

            {/* PDF Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg px-4 py-5 text-center cursor-pointer transition-all ${
                pdfFile
                  ? 'border-terra-cta bg-primary-50'
                  : 'border-border-warm hover:border-sage hover:bg-white/50'
              }`}
            >
              {pdfFile ? (
                <div className="flex items-center justify-center gap-2 text-terra-cta">
                  <span>📄</span>
                  <span className="text-sm font-medium">{pdfFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPdfFile(null)
                    }}
                    className="text-muted hover:text-ink ml-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted font-medium">Upload your PDF Resume</p>
                  <p className="text-xs text-muted/60 mt-0.5">Drag and drop or click to browse</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            />

            {/* Tags grid */}
            <div className="grid grid-cols-2 gap-3">
              <TagInput label="Target Roles" placeholder="Add role..." value={rolesInput} onChange={setRolesInput} />
              <TagInput label="Industries" placeholder="Add industry..." value={industriesInput} onChange={setIndustriesInput} />
              <TagInput label="Locations" placeholder="e.g. Remote, New York" value={locationsInput} onChange={setLocationsInput} />
              <TagInput label="Interests" placeholder="e.g. Sustainable Tech" value={interestsInput} onChange={setInterestsInput} />
            </div>

            {error && (
              <div className="bg-error-50 border border-error-100 text-error-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-900 hover:bg-primary-950 text-white font-semibold py-3.5 rounded-lg shadow-glow transition-all text-base"
            >
              Find my network
            </button>

            <p className="text-center text-[10px] text-muted/60 uppercase tracking-wide">
              Your data is not stored. Results powered by Claude AI.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function TagInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-border-warm rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terra-cta/30 focus:border-terra-cta"
      />
      <p className="text-[10px] text-muted mt-0.5">Comma-separated</p>
    </div>
  )
}
