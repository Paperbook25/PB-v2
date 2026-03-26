import { Globe, Palette } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TEMPLATES = [
  { id: 'modern', name: 'Modern', desc: 'Clean, minimal design', color: 'indigo' },
  { id: 'classic', name: 'Classic', desc: 'Traditional school look', color: 'blue' },
  { id: 'vibrant', name: 'Vibrant', desc: 'Colorful and engaging', color: 'purple' },
]

export function WebsiteSetupStep() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">School Website</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        PaperBook includes a free website for your school. You can set it up now or customize it later.
      </p>

      <div className="space-y-2">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors cursor-pointer"
          >
            <div className={`h-10 w-10 rounded-lg bg-${t.color}-100 flex items-center justify-center`}>
              <Palette className={`h-5 w-5 text-${t.color}-600`} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{t.name}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-gray-50 text-center">
        <p className="text-xs text-gray-500 mb-2">
          You can fully customize your website in the Website Builder.
        </p>
        <button
          onClick={() => navigate('/school-website')}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Open Website Builder →
        </button>
      </div>
    </div>
  )
}
