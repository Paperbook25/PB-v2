import { useState } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'

interface Course {
  name: string
  category: string
  duration: string
  eligibility: string
  fee: string
  image: string
}

export function CoursesTabs({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Our Courses'
  const description = field(section.content, 'description', '')
  const showFees = field<boolean>(section.content, 'showFees', true)
  const courses = field<Course[]>(section.content, 'courses', [])

  const fallbackCourses: Course[] = [
    { name: 'Science', category: 'Senior Secondary', duration: '2 Years', eligibility: 'Class 10 Pass', fee: '₹45,000/yr', image: '' },
    { name: 'Commerce', category: 'Senior Secondary', duration: '2 Years', eligibility: 'Class 10 Pass', fee: '₹40,000/yr', image: '' },
    { name: 'Arts', category: 'Senior Secondary', duration: '2 Years', eligibility: 'Class 10 Pass', fee: '₹35,000/yr', image: '' },
    { name: 'Class 6-8', category: 'Middle School', duration: '3 Years', eligibility: 'Class 5 Pass', fee: '₹32,000/yr', image: '' },
    { name: 'Class 9-10', category: 'Secondary', duration: '2 Years', eligibility: 'Class 8 Pass', fee: '₹38,000/yr', image: '' },
  ]

  const displayCourses = courses.length > 0 ? courses : fallbackCourses
  const categories = Array.from(new Set(displayCourses.map((c) => c.category)))
  const [activeTab, setActiveTab] = useState(categories[0] || '')

  const filtered = displayCourses.filter((c) => c.category === activeTab)

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">{description}</p>
        )}

        {/* Tabs */}
        <div className="mt-8 flex justify-center border-b border-gray-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === cat
                  ? 'border-b-2 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === cat ? { borderBottomColor: theme.defaultAccentColor, color: theme.defaultPrimaryColor } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, idx) => (
            <div
              key={idx}
              className={`overflow-hidden ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              {course.image ? (
                <img src={course.image} alt={course.name} className="h-40 w-full object-cover" />
              ) : (
                <div
                  className="flex h-40 items-center justify-center text-2xl font-bold text-white/40"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  {course.name.charAt(0)}
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Duration:</span> {course.duration}</p>
                  <p><span className="font-medium">Eligibility:</span> {course.eligibility}</p>
                  {showFees && course.fee && (
                    <p className="font-semibold" style={{ color: theme.defaultAccentColor }}>
                      {course.fee}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
