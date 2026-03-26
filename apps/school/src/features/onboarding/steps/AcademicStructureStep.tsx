import { useState } from 'react'
import { GraduationCap, Check } from 'lucide-react'
import { apiPost } from '@/lib/api-client'

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10', 'Class 11', 'Class 12',
]

const PRESETS = [
  { label: 'Primary (1-5)', range: [3, 7] },
  { label: 'Middle (6-8)', range: [8, 10] },
  { label: 'Secondary (9-10)', range: [11, 12] },
  { label: 'Senior (11-12)', range: [13, 14] },
  { label: 'K-12 (All)', range: [0, 14] },
]

export function AcademicStructureStep() {
  const [selectedClasses, setSelectedClasses] = useState<Set<number>>(new Set())
  const [sections, setSections] = useState('A, B')
  const [academicYear, setAcademicYear] = useState('2024-25')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const toggleClass = (idx: number) => {
    setSelectedClasses((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
    setSaved(false)
  }

  const applyPreset = (start: number, end: number) => {
    setSelectedClasses((prev) => {
      const next = new Set(prev)
      for (let i = start; i <= end; i++) next.add(i)
      return next
    })
    setSaved(false)
  }

  const handleSave = async () => {
    if (selectedClasses.size === 0) return
    setSaving(true)
    try {
      const sectionNames = sections.split(',').map((s) => s.trim()).filter(Boolean)
      const classes = Array.from(selectedClasses).map((i) => CLASSES[i])

      await apiPost('/api/onboarding/quick-setup-academics', {
        academicYear,
        classes,
        sections: sectionNames,
      })
      setSaved(true)
    } catch {
      // Allow continuing
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Academic Structure</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Set up your academic year and select the classes your school offers.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => { setAcademicYear(e.target.value); setSaved(false) }}
              placeholder="2024-25"
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sections (comma-separated)</label>
            <input
              type="text"
              value={sections}
              onChange={(e) => { setSections(e.target.value); setSaved(false) }}
              placeholder="A, B, C"
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Quick presets</label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.range[0], p.range[1])}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Select classes ({selectedClasses.size} selected)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {CLASSES.map((cls, i) => (
              <button
                key={cls}
                onClick={() => toggleClass(i)}
                className={`text-xs py-2 rounded-md border transition-colors ${
                  selectedClasses.has(i)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {selectedClasses.has(i) && <Check className="h-3 w-3 inline mr-0.5" />}
                {cls}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || selectedClasses.size === 0}
        className={`mt-4 h-8 px-4 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
          saved
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {saving ? 'Creating...' : saved ? 'Created!' : 'Create Classes & Sections'}
      </button>
    </div>
  )
}
