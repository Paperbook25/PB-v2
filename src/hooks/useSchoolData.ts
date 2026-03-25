import { useQuery } from '@tanstack/react-query'
import { fetchClasses, fetchSubjects, fetchDepartments, fetchAcademicYears } from '@/features/settings/api/settings.api'
import { settingsKeys } from '@/features/settings/hooks/useSettings'

const STALE_TIME = 5 * 60 * 1000 // 5 minutes

// ==================== CLASSES ====================

export function useClassesData() {
  return useQuery({
    queryKey: settingsKeys.classes(),
    queryFn: fetchClasses,
    staleTime: STALE_TIME,
    select: (res) => res.data,
  })
}

export function useClassNames() {
  return useQuery({
    queryKey: settingsKeys.classes(),
    queryFn: fetchClasses,
    staleTime: STALE_TIME,
    select: (res) => res.data.map((c) => c.className),
  })
}

export function useAllSections() {
  return useQuery({
    queryKey: settingsKeys.classes(),
    queryFn: fetchClasses,
    staleTime: STALE_TIME,
    select: (res) => {
      const allSections = new Set<string>()
      for (const cls of res.data) {
        for (const sec of cls.sections) {
          allSections.add(sec)
        }
      }
      return [...allSections].sort()
    },
  })
}

export function useSectionsForClass(className: string | undefined) {
  return useQuery({
    queryKey: settingsKeys.classes(),
    queryFn: fetchClasses,
    staleTime: STALE_TIME,
    select: (res) => {
      if (!className) return []
      const cls = res.data.find((c) => c.className === className)
      return cls?.sections ?? []
    },
  })
}

// ==================== SUBJECTS ====================

export function useSubjectsData() {
  return useQuery({
    queryKey: settingsKeys.subjects(),
    queryFn: fetchSubjects,
    staleTime: STALE_TIME,
    select: (res) => res.data,
  })
}

export function useSubjectNames() {
  return useQuery({
    queryKey: settingsKeys.subjects(),
    queryFn: fetchSubjects,
    staleTime: STALE_TIME,
    select: (res) => res.data.map((s) => s.name),
  })
}

// ==================== DEPARTMENTS ====================

export function useDepartmentsData() {
  return useQuery({
    queryKey: settingsKeys.departments(),
    queryFn: fetchDepartments,
    staleTime: STALE_TIME,
    select: (res) => res.data,
  })
}

export function useDepartmentNames() {
  return useQuery({
    queryKey: settingsKeys.departments(),
    queryFn: fetchDepartments,
    staleTime: STALE_TIME,
    select: (res) => res.data.map((d) => d.name),
  })
}

// ==================== ACADEMIC YEARS ====================

export function useAcademicYearsData() {
  return useQuery({
    queryKey: settingsKeys.academicYears(),
    queryFn: fetchAcademicYears,
    staleTime: STALE_TIME,
    select: (res) => res.data,
  })
}
