import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Folder, ChevronRight, Home } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useDocuments, useMoveDocument } from '../hooks/useDocuments'
import type { Document } from '../types/documents.types'

interface MoveDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document | null
}

export function MoveDocumentDialog({ open, onOpenChange, document }: MoveDocumentDialogProps) {
  const { toast } = useToast()
  const moveDocument = useMoveDocument()
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined)
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined)
  const [breadcrumb, setBreadcrumb] = useState<{ id?: string; name: string }[]>([
    { id: undefined, name: 'Root' },
  ])

  const { data: result, isLoading } = useDocuments({
    parentId: currentFolderId || 'null',
    limit: 100,
  })

  const folders = (result?.data || []).filter(
    (d) => d.type === 'folder' && d.id !== document?.id
  )

  const handleFolderClick = (folder: Document) => {
    setCurrentFolderId(folder.id)
    setSelectedFolderId(undefined)
    setBreadcrumb((b) => [...b, { id: folder.id, name: folder.name }])
  }

  const handleBreadcrumbClick = (index: number) => {
    const item = breadcrumb[index]
    setCurrentFolderId(item.id)
    setSelectedFolderId(undefined)
    setBreadcrumb((b) => b.slice(0, index + 1))
  }

  const handleMove = async () => {
    if (!document) return

    // Can't move to current location
    if (selectedFolderId === document.parentId || (selectedFolderId === undefined && !document.parentId)) {
      toast({ title: 'Info', description: 'Document is already in this location' })
      return
    }

    try {
      await moveDocument.mutateAsync({
        id: document.id,
        targetFolderId: selectedFolderId,
      })
      toast({ title: 'Success', description: 'Document moved successfully' })
      onOpenChange(false)
      // Reset state
      setCurrentFolderId(undefined)
      setSelectedFolderId(undefined)
      setBreadcrumb([{ id: undefined, name: 'Root' }])
    } catch {
      toast({ title: 'Error', description: 'Failed to move document', variant: 'destructive' })
    }
  }

  const handleSelectCurrent = () => {
    setSelectedFolderId(currentFolderId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Move "{document?.name}"</DialogTitle>
          <DialogDescription>
            Select a destination folder for this {document?.type}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm flex-wrap">
            {breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {index === 0 ? <Home className="h-4 w-4" /> : item.name}
                </Button>
              </div>
            ))}
          </div>

          {/* Folder List */}
          <div className="rounded-lg border">
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : folders.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No subfolders in this location
                </div>
              ) : (
                <div className="divide-y">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50"
                    >
                      <button
                        className="flex items-center gap-3 flex-1 text-left"
                        onClick={() => handleFolderClick(folder)}
                      >
                        <Folder className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">{folder.name}</span>
                      </button>
                      <Button
                        variant={selectedFolderId === folder.id ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedFolderId(folder.id)}
                      >
                        {selectedFolderId === folder.id ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Move to current folder option */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-amber-500" />
              <span className="text-sm">
                Move here: <strong>{breadcrumb[breadcrumb.length - 1].name}</strong>
              </span>
            </div>
            <Button
              variant={selectedFolderId === currentFolderId ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleSelectCurrent}
            >
              {selectedFolderId === currentFolderId ? 'Selected' : 'Select'}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={moveDocument.isPending || selectedFolderId === undefined}
          >
            {moveDocument.isPending ? 'Moving...' : 'Move Here'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
