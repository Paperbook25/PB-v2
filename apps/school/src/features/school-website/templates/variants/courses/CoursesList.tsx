import { useState } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface Course {
  name: string
  category: string
  duration: string
  eligibility: string
  fee: string
  description: string
}

export function CoursesList({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Our Courses'
  const description = field(section.content, 'description', '')
  const showFees = field<boolean>(section.content, 'showFees', true)
  const courses = field<Course[]>(section.content, 'courses', [])

  const fallbackCourses: Course[] = [
    { name: 'Science Stream', category: 'Senior Secondary', duration: '2 Years', eligibility: 'Class 10 Pass with 60%+', fee: '₹45,000/yr', description: 'Comprehensive science curriculum covering Physics, Chemistry, Biology, and Mathematics.' },
    { name: 'Commerce Stream', category: 'Senior Secondary', duration: '2 Years', eligibility: 'Class 10 Pass', fee: '₹40,000/yr', description: 'Business-focused curriculum with Accountancy, Economics, and Business Studies.' },
    { name: 'Arts Stream', category: 'Senior Secondary', duration: '2 Years', eligibility: 'Class 10 Pass', fee: '₹35,000/yr', description: 'Liberal arts education with History, Geography, Political Science, and Languages.' },
  ]

  const displayCourses = courses.length > 0 ? courses : fallbackCourses
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-4xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">{description}</p>
        )}

        <div className="mt-10 space-y-3">
          {displayCourses.map((course, idx) => {
            const isExpanded = expandedIndex === idx
            return (
              <div
                key={idx}
                className={`border transition-shadow ${radiusClass(theme.cornerRadius)} ${
                  isExpanded ? 'border-gray-300 shadow-md' : 'border-gray-200'
                }`}
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium text-white ${radiusClass(theme.cornerRadius)}`}
                      style={{ backgroundColor: theme.defaultAccentColor }}
                    >
                      {course.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden text-sm text-gray-500 sm:block">{course.duration}</span>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    {course.description && (
                      <p className="text-sm text-gray-600">{course.description}</p>
                    )}
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <span className="font-medium text-gray-500">Duration</span>
                        <p className="mt-0.5 text-gray-900">{course.duration}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Eligibility</span>
                        <p className="mt-0.5 text-gray-900">{course.eligibility}</p>
                      </div>
                      {showFees && course.fee && (
                        <div>
                          <span className="font-medium text-gray-500">Fee</span>
                          <p className="mt-0.5 font-semibold" style={{ color: theme.defaultPrimaryColor }}>
                            {course.fee}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
