import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FolderPlus, Upload, Star, Archive, Clock } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { DocumentStatsCards } from '../components/DocumentStatsCards'
import { DocumentBrowser } from '../components/DocumentBrowser'
import { DocumentActivityList } from '../components/DocumentActivityList'
import { CreateFolderDialog } from '../components/CreateFolderDialog'
import { UploadFileDialog } from '../components/UploadFileDialog'
import { EditDocumentDialog } from '../components/EditDocumentDialog'
import { MoveDocumentDialog } from '../components/MoveDocumentDialog'
import type { Document } from '../types/documents.types'

export function DocumentsPage() {
  const { hasRole } = useAuthStore()
  const canManageDocuments = hasRole(['admin', 'principal', 'teacher'])
  const [activeTab, setActiveTab] = useState('browse')
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [uploadFileOpen, setUploadFileOpen] = useState(false)
  const [editDocument, setEditDocument] = useState<Document | null>(null)
  const [moveDocument, setMoveDocument] = useState<Document | null>(null)

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Documents"
        description="Manage school documents, files, and folders"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Documents' },
        ]}
        moduleColor="documents"
        actions={
          canManageDocuments ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCreateFolderOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
              <Button onClick={() => setUploadFileOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </div>
          ) : undefined
        }
      />

      <DocumentStatsCards />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">
            <Archive className="mr-2 h-4 w-4" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="starred">
            <Star className="mr-2 h-4 w-4" />
            Starred
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="mr-2 h-4 w-4" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <DocumentBrowser
            currentFolderId={currentFolderId}
            onFolderOpen={setCurrentFolderId}
            onEdit={setEditDocument}
            onMove={setMoveDocument}
          />
        </TabsContent>

        <TabsContent value="starred" className="mt-6">
          <DocumentBrowser
            currentFolderId={undefined}
            onFolderOpen={setCurrentFolderId}
            onEdit={setEditDocument}
            onMove={setMoveDocument}
          />
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <DocumentActivityList limit={50} />
        </TabsContent>
      </Tabs>

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
    </div>
  )
}
