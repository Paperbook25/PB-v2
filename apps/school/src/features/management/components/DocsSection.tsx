import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FolderPlus, Upload } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { DocumentStatsCards } from '@/features/documents/components/DocumentStatsCards'
import { DocumentBrowser } from '@/features/documents/components/DocumentBrowser'
import { DocumentActivityList } from '@/features/documents/components/DocumentActivityList'
import { CreateFolderDialog } from '@/features/documents/components/CreateFolderDialog'
import { UploadFileDialog } from '@/features/documents/components/UploadFileDialog'
import { EditDocumentDialog } from '@/features/documents/components/EditDocumentDialog'
import { MoveDocumentDialog } from '@/features/documents/components/MoveDocumentDialog'
import type { Document } from '@/features/documents/types/documents.types'
import type { DocsTab } from '../types/management.types'

interface DocsSectionProps {
  activeTab: DocsTab
  onTabChange: (tab: DocsTab) => void
}

export function DocsSection({ activeTab, onTabChange }: DocsSectionProps) {
  const { hasRole } = useAuthStore()
  const canManageDocuments = hasRole(['admin', 'principal', 'teacher'])
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [uploadFileOpen, setUploadFileOpen] = useState(false)
  const [editDocument, setEditDocument] = useState<Document | null>(null)
  const [moveDocument, setMoveDocument] = useState<Document | null>(null)

  return (
    <>
      <div className="mt-6 space-y-6">
        {/* Action buttons */}
        {canManageDocuments && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateFolderOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
            <Button onClick={() => setUploadFileOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </div>
        )}

        <DocumentStatsCards />

        {activeTab === 'browse' && (
          <DocumentBrowser
            currentFolderId={currentFolderId}
            onFolderOpen={setCurrentFolderId}
            onEdit={setEditDocument}
            onMove={setMoveDocument}
          />
        )}

        {activeTab === 'starred' && (
          <DocumentBrowser
            currentFolderId={undefined}
            onFolderOpen={setCurrentFolderId}
            onEdit={setEditDocument}
            onMove={setMoveDocument}
          />
        )}

        {activeTab === 'recent' && <DocumentActivityList limit={50} />}
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        parentId={currentFolderId}
      />

      <UploadFileDialog
        open={uploadFileOpen}
        onOpenChange={setUploadFileOpen}
        parentId={currentFolderId}
      />

      <EditDocumentDialog
        open={!!editDocument}
        onOpenChange={(open) => !open && setEditDocument(null)}
        document={editDocument}
      />

      <MoveDocumentDialog
        open={!!moveDocument}
        onOpenChange={(open) => !open && setMoveDocument(null)}
        document={moveDocument}
      />
    </>
  )
}
