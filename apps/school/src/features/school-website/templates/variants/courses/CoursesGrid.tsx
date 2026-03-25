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
  description: string
}

export function CoursesGrid({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Our Courses'
  const description = field(section.content, 'description', '')
  const showFees = field<boolean>(section.content, 'showFees', true)
  const courses = field<Course[]>(section.content, 'courses', [])

  const fallbackCourses: Course[] = [
    { name: 'Science', category: 'Senior Secondary', duration: '2 Years', eligibility: 'Class 10 Pass', fee: '₹45,000/yr', image: '', description: '' },
    { name: 'Commerce', category: 'Senior Secondary', duration: '2 Years', eligibility: 'Class 10 Pass', fee: '₹40,000/yr', image: '', description: '' },
    { name: 'Arts', category: 'Senior Secondary', duration: '2 Years', eligibility: 'Class 10 Pass', fee: '₹35,000/yr', image: '', description: '' },
    { name: 'Primary', category: 'Primary', duration: '5 Years', eligibility: 'Age 6+', fee: '₹30,000/yr', image: '', description: '' },
    { name: 'Middle School', category: 'Secondary', duration: '3 Years', eligibility: 'Class 5 Pass', fee: '₹35,000/yr', image: '', description: '' },
    { name: 'Computer Science', category: 'Senior Secondary', duration: '2 Years', eligibility: 'Class 10 Pass', fee: '₹50,000/yr', image: '', description: '' },
  ]

  const displayCourses = courses.length > 0 ? courses : fallbackCourses
  const categories = ['All', ...Array.from(new Set(displayCourses.map((c) => c.category)))]
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? displayCourses
    : displayCourses.filter((c) => c.category === activeCategory)

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

        {/* Category filter pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${radiusClass(theme.cornerRadius)} ${
                activeCategory === cat
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeCategory === cat ? { backgroundColor: theme.defaultAccentColor } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, idx) => (
            <div
              key={idx}
              className={`overflow-hidden ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              {course.image ? (
                <img src={course.image} alt={course.name} className="h-48 w-full object-cover" />
              ) : (
                <div
                  className="flex h-48 items-center justify-center text-3xl font-bold text-white/40"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  {course.name.charAt(0)}
                </div>
              )}
              <div className="p-5">
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium text-white ${radiusClass(theme.cornerRadius)}`}
                  style={{ backgroundColor: theme.defaultAccentColor }}
                >
                  {course.category}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{course.name}</h3>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Duration:</span> {course.duration}</p>
                  <p><span className="font-medium">Eligibility:</span> {course.eligibility}</p>
                  {showFees && course.fee && (
                    <p><span className="font-medium">Fee:</span> {course.fee}</p>
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
