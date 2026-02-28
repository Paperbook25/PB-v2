import { useState, useCallback } from 'react'
import {
  usePages, usePage, useCreatePage, useDeletePage,
  usePublishPage, useUnpublishPage,
  useAddSection, useUpdateSection, useDeleteSection, useReorderSections,
  useWebsiteSettings,
} from '../api/school-website.api'
import type { WebsiteSection, SectionType } from '../types/school-website.types'

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'page'
}

export function useSchoolWebsite() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const pagesQuery = usePages()
  const pageQuery = usePage(selectedPageId)
  const settingsQuery = useWebsiteSettings()

  const createPageMutation = useCreatePage()
  const deletePage = useDeletePage()
  const publishPage = usePublishPage()
  const unpublishPage = useUnpublishPage()

  const addSection = useAddSection()
  const updateSection = useUpdateSection()
  const deleteSection = useDeleteSection()
  const reorderSections = useReorderSections()

  const pages = pagesQuery.data ?? []
  const currentPage = pageQuery.data ?? null
  const sections = currentPage?.sections ?? []
  const selectedSection = sections.find(s => s.id === selectedSectionId) ?? null
  const settings = settingsQuery.data ?? null

  // Auto-select first page if none selected
  if (!selectedPageId && pages.length > 0) {
    setSelectedPageId(pages[0].id)
  }

  const handleSelectPage = useCallback((id: string) => {
    setSelectedPageId(id)
    setSelectedSectionId(null)
  }, [])

  // Simplified page creation — just pass a title, slug is auto-generated
  const handleCreatePage = useCallback(async (title: string) => {
    const slug = toSlug(title)
    const result = await createPageMutation.mutateAsync({ slug, title })
    return result
  }, [createPageMutation])

  const handleAddSection = useCallback(async (type: SectionType) => {
    if (!selectedPageId) return
    const result = await addSection.mutateAsync({ pageId: selectedPageId, type, content: {} })
    if (result && typeof result === 'object' && 'id' in result) {
      setSelectedSectionId((result as WebsiteSection).id)
    }
  }, [selectedPageId, addSection])

  const handleMoveSection = useCallback(async (sectionId: string, direction: 'up' | 'down') => {
    if (!selectedPageId) return
    const idx = sections.findIndex(s => s.id === sectionId)
    if (idx === -1) return
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= sections.length) return

    const reordered = sections.map((s, i) => {
      if (i === idx) return { id: s.id, sortOrder: newIdx }
      if (i === newIdx) return { id: s.id, sortOrder: idx }
      return { id: s.id, sortOrder: i }
    })
    await reorderSections.mutateAsync({ pageId: selectedPageId, sections: reordered })
  }, [selectedPageId, sections, reorderSections])

  return {
    // Data
    pages,
    currentPage,
    sections,
    selectedPageId,
    selectedSectionId,
    selectedSection,
    settings,
    previewOpen,
    hasPages: pages.length > 0,

    // Loading
    isLoading: pagesQuery.isLoading || pageQuery.isLoading,
    isSettingsLoading: settingsQuery.isLoading,

    // Actions
    setSelectedPageId: handleSelectPage,
    setSelectedSectionId,
    setPreviewOpen,

    createPage: handleCreatePage,
    createPageMutation,
    deletePage,
    publishPage,
    unpublishPage,

    addSection: handleAddSection,
    updateSection,
    deleteSection,
    reorderSections,
    moveSection: handleMoveSection,
  }
}
