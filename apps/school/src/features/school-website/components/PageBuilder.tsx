import { useState } from 'react'
import {
  Plus, Eye, EyeOff, Trash2, ChevronUp, ChevronDown,
  Globe, FileText, GripVertical, Layers, PanelRightOpen, PanelRightClose,
} from 'lucide-react'
import { useSchoolWebsite } from '../hooks/useSchoolWebsite'
import { SectionEditorPanel } from './SectionEditorPanel'
import { SectionRenderer } from './SectionRenderers'
import { SECTION_TYPES, type SectionType } from '../types/school-website.types'

export function PageBuilder() {
  const {
    pages, currentPage, sections, selectedPageId, selectedSectionId, selectedSection,
    settings, previewOpen, isLoading,
    setSelectedPageId, setSelectedSectionId, setPreviewOpen,
    createPage, deletePage, publishPage, unpublishPage,
    addSection, updateSection, deleteSection, moveSection,
  } = useSchoolWebsite()

  const [showAddSection, setShowAddSection] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [showNewPage, setShowNewPage] = useState(false)

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return
    await createPage(newPageTitle.trim())
    setNewPageTitle('')
    setShowNewPage(false)
  }

  const handleAddSection = async (type: SectionType) => {
    await addSection(type)
    setShowAddSection(false)
  }

  const handleUpdateSection = async (content: Record<string, unknown>, title?: string) => {
    if (!selectedSectionId) return
    await updateSection.mutateAsync({ id: selectedSectionId, content, title })
  }

  const template = settings?.template || 'classic'

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden border rounded-lg bg-white">
      {/* Left Sidebar: Pages & Sections */}
      <div className="w-60 border-r flex flex-col shrink-0 bg-gray-50">
        {/* Pages List */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pages</h3>
            <button
              onClick={() => setShowNewPage(!showNewPage)}
              className="text-blue-600 hover:text-blue-700"
              title="Add a new page"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {showNewPage && (
            <div className="space-y-2 mb-2">
              <input
                value={newPageTitle}
                onChange={e => setNewPageTitle(e.target.value)}
                placeholder="Page name (e.g. About Us)"
                className="w-full px-2.5 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={e => e.key === 'Enter' && handleCreatePage()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreatePage}
                  disabled={!newPageTitle.trim()}
                  className="flex-1 px-2 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Page
                </button>
                <button
                  onClick={() => { setShowNewPage(false); setNewPageTitle('') }}
                  className="px-2 py-1.5 text-sm text-gray-500 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="space-y-0.5">
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => setSelectedPageId(page.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-left transition ${
                  selectedPageId === page.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">{page.title}</span>
                {page.isPublished && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Globe className="h-3 w-3" />
                    Live
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sections List */}
        {currentPage && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sections</h3>
            </div>
            {sections.length === 0 ? (
              <div className="text-center py-6">
                <Layers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No sections yet</p>
                <p className="text-xs text-gray-400">Add one below to get started</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {sections.map((section, idx) => {
                  const sectionMeta = SECTION_TYPES.find(st => st.value === section.type)
                  return (
                    <div
                      key={section.id}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md text-sm cursor-pointer transition group ${
                        selectedSectionId === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : section.isVisible
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedSectionId(section.id)}
                    >
                      <GripVertical className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      <span className="flex-1 truncate">
                        {sectionMeta?.label || (section.type || 'Section').replace('_', ' ')}
                      </span>
                      {!section.isVisible && (
                        <span className="text-xs text-gray-400">Hidden</span>
                      )}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={e => { e.stopPropagation(); moveSection(section.id, 'up') }}
                          disabled={idx === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); moveSection(section.id, 'down') }}
                          disabled={idx === sections.length - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            updateSection.mutate({ id: section.id, isVisible: !section.isVisible })
                          }}
                          className="p-0.5 hover:bg-gray-200 rounded"
                          title={section.isVisible ? 'Hide this section' : 'Show this section'}
                        >
                          {section.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-gray-400" />}
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); deleteSection.mutate(section.id) }}
                          className="p-0.5 hover:bg-red-100 rounded text-red-500"
                          title="Remove this section"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add Section */}
            <div className="mt-3 relative">
              <button
                onClick={() => setShowAddSection(!showAddSection)}
                className="flex items-center gap-1.5 w-full text-sm text-blue-600 hover:text-blue-700 px-2.5 py-2 rounded-md hover:bg-blue-50 transition"
              >
                <Plus className="h-4 w-4" />
                Add a Section
              </button>
              {showAddSection && (
                <div className="absolute left-0 bottom-full mb-1 z-10 bg-white rounded-xl shadow-xl border py-2 w-72 max-h-80 overflow-y-auto">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase">Choose a section type</div>
                  {SECTION_TYPES.map(st => (
                    <button
                      key={st.value}
                      onClick={() => handleAddSection(st.value)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition"
                    >
                      <div className="font-medium text-sm text-gray-900">{st.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{st.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Center: Editor */}
      <div className="flex-1 overflow-y-auto">
        {currentPage && (
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">{currentPage.title}</h2>
            <div className="flex-1" />
            <button
              onClick={() => setPreviewOpen(!previewOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 transition text-gray-600"
              title={previewOpen ? 'Hide preview' : 'Show preview'}
            >
              {previewOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              {previewOpen ? 'Hide Preview' : 'Preview'}
            </button>
            {currentPage.isPublished ? (
              <button
                onClick={() => unpublishPage.mutate(currentPage.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-orange-300 text-orange-600 rounded-md hover:bg-orange-50 transition"
              >
                Take Offline
              </button>
            ) : (
              <button
                onClick={() => publishPage.mutate(currentPage.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
              >
                <Globe className="h-3.5 w-3.5" />
                Make Live
              </button>
            )}
            <button
              onClick={() => { if (confirm('Are you sure you want to delete this page? This cannot be undone.')) deletePage.mutate(currentPage.id) }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
              title="Delete this page"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="p-6">
          {selectedSection ? (
            <SectionEditorPanel section={selectedSection} onUpdate={handleUpdateSection} />
          ) : currentPage ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Layers className="h-12 w-12 text-gray-200 mb-4" />
              <h3 className="text-base font-medium text-gray-500 mb-1">Select a section to edit</h3>
              <p className="text-sm text-gray-400">
                Pick a section from the left sidebar, or add a new one
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-gray-200 mb-4" />
              <h3 className="text-base font-medium text-gray-500 mb-1">Select a page</h3>
              <p className="text-sm text-gray-400">
                Choose a page from the left to start editing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Preview */}
      {previewOpen && currentPage && (
        <div className="w-96 border-l overflow-y-auto bg-white shrink-0">
          <div className="sticky top-0 bg-white border-b px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
            <Eye className="h-3.5 w-3.5" />
            Live Preview
          </div>
          <div className="transform scale-[0.45] origin-top-left w-[213%]">
            {sections.filter(s => s.isVisible).map(section => (
              <SectionRenderer key={section.id} section={section} template={template} />
            ))}
            {sections.filter(s => s.isVisible).length === 0 && (
              <div className="py-20 text-center text-gray-400">No visible sections</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
