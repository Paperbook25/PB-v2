import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FolderPlus, Upload, Star, Archive, Clock } from 'lucide-react'
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
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as DocsTab)}>
      <TabsList variant="secondary" className="flex flex-wrap w-full">
        <TabsTrigger variant="secondary" value="browse" className="flex items-center gap-2">
          <Archive className="h-4 w-4" />
          Browse
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="starred" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Starred
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="recent" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </TabsTrigger>
      </TabsList>

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

        <TabsContent value="browse" className="mt-0">
          <DocumentBrowser
            currentFolderId={currentFolderId}
            onFolderOpen={setCurrentFolderId}
            onEdit={setEditDocument}
            onMove={setMoveDocument}
          />
        </TabsContent>

        <TabsContent value="starred" className="mt-0">
          <DocumentBrowser
            currentFolderId={undefined}
            onFolderOpen={setCurrentFolderId}
            onEdit={setEditDocument}
            onMove={setMoveDocument}
          />
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          <DocumentActivityList limit={50} />
        </TabsContent>
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
    </Tabs>
  )
}
