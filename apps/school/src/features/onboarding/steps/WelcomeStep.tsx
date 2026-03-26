import { Sparkles, Users, BookOpen, CreditCard, Globe } from 'lucide-react'

const FEATURES = [
  { icon: BookOpen, title: 'Academic Management', desc: 'Classes, sections, subjects, timetable' },
  { icon: Users, title: 'People Management', desc: 'Students, staff, attendance tracking' },
  { icon: CreditCard, title: 'Finance', desc: 'Fee collection, payments, reports' },
  { icon: Globe, title: 'School Website', desc: 'Public website for your school' },
]

export function WelcomeStep({ schoolName }: { schoolName: string }) {
  return (
    <div className="text-center py-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mx-auto mb-4">
        <Sparkles className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome to PaperBook!
      </h2>
      <p className="text-gray-500 mb-6">
        Let's set up <strong>{schoolName}</strong> in just a few minutes.
      </p>

      <div className="grid grid-cols-2 gap-3 text-left max-w-md mx-auto">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <f.icon className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900">{f.title}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-6">
        This wizard will guide you through the essential setup. You can always skip and come back later.
      </p>
    </div>
  )
}
