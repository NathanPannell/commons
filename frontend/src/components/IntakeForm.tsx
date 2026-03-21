import { useRef, useState } from 'react'
import type { ProfileInput, ProfileSummary } from '../types'
import { submitIntake, submitIntakeWithPdf } from '../api/client'

interface Props {
  onSuccess: (profile: ProfileSummary) => void
}

export function IntakeForm({ onSuccess }: Props) {
  const [bioText, setBioText] = useState('')
  const [rolesInput, setRolesInput] = useState('')
  const [industriesInput, setIndustriesInput] = useState('')
  const [locationsInput, setLocationsInput] = useState('')
  const [interestsInput, setInterestsInput] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function parseTagInput(value: string): string[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!bioText.trim() && !pdfFile) {
      setError('Please paste your bio/resume text or upload a PDF.')
      return
    }

    setLoading(true)
    try {
      let profile: ProfileSummary
      const roles = parseTagInput(rolesInput)
      const industries = parseTagInput(industriesInput)
      const locations = parseTagInput(locationsInput)
      const interests = parseTagInput(interestsInput)

      if (pdfFile) {
        profile = await submitIntakeWithPdf(bioText, pdfFile, roles, industries, locations, interests)
      } else {
        const input: ProfileInput = {
          bio_text: bioText || null,
          target_roles: roles,
          target_industries: industries,
          target_locations: locations,
          interests,
        }
        profile = await submitIntake(input)
      }
      onSuccess(profile)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BridgeIn</h1>
          <p className="text-lg text-gray-500">
            Find your network — even if you don't have one yet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bio / Resume text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your bio or resume
              <span className="text-gray-400 font-normal ml-1">(paste text here)</span>
            </label>
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              rows={8}
              placeholder="I'm a third-year CS student at UVic interested in backend development. I've built projects using Python, React, and PostgreSQL. I'm looking for co-op opportunities in Victoria or Vancouver..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Resume PDF
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-colors ${
                pdfFile
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              {pdfFile ? (
                <div className="flex items-center justify-center gap-2 text-indigo-700">
                  <span>📄</span>
                  <span className="text-sm font-medium">{pdfFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPdfFile(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Drop a PDF here or click to browse
                </p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Tags grid */}
          <div className="grid grid-cols-2 gap-4">
            <TagInput label="Target roles" placeholder="e.g. Software Engineer, Backend Dev" value={rolesInput} onChange={setRolesInput} />
            <TagInput label="Industries" placeholder="e.g. SaaS, Fintech, Startups" value={industriesInput} onChange={setIndustriesInput} />
            <TagInput label="Locations" placeholder="e.g. Victoria BC, Remote" value={locationsInput} onChange={setLocationsInput} />
            <TagInput label="Interests" placeholder="e.g. open source, machine learning" value={interestsInput} onChange={setInterestsInput} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
          >
            {loading ? 'Analyzing your profile...' : 'Find my network →'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Your data is not stored. Results powered by Claude AI + web search.
          </p>
        </form>
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
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
      />
      <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
    </div>
  )
}
