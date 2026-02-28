import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronRight,
  Download,
  Edit,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  Grid,
  Image,
  List,
  MoreHorizontal,
  Presentation,
  Search,
  Star,
  StarOff,
  Trash2,
  Move,
  Home,
} from 'lucide-react'
import { useDocuments, useToggleStar, useDeleteDocument, useTrackDownload, useBreadcrumb } from '../hooks/useDocuments'
import { useToast } from '@/hooks/use-toast'
import type { Document, File as DocFile, DocumentFilters, DocumentCategory, AccessLevel } from '../types/documents.types'
import { DOCUMENT_CATEGORIES, ACCESS_LEVELS } from '../types/documents.types'
import { format } from 'date-fns'

interface DocumentBrowserProps {
  onFolderOpen: (folderId: string | undefined) => void
  currentFolderId?: string
  onEdit: (doc: Document) => void
  onMove: (doc: Document) => void
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(fileType?: string) {
  switch (fileType) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />
    case 'doc':
    case 'docx':
      return <FileText className="h-5 w-5 text-blue-500" />
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    case 'ppt':
    case 'pptx':
      return <Presentation className="h-5 w-5 text-orange-500" />
    case 'jpg':
    case 'png':
      return <Image className="h-5 w-5 text-purple-500" />
    default:
      return <File className="h-5 w-5 text-gray-500" />
  }
}

function getAccessBadge(level: AccessLevel) {
  const variants: Record<AccessLevel, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    public: 'default',
    staff_only: 'secondary',
    admin_only: 'destructive',
    restricted: 'outline',
  }
  const labels = ACCESS_LEVELS.reduce((acc, l) => ({ ...acc, [l.value]: l.label }), {} as Record<AccessLevel, string>)
  return <Badge variant={variants[level]}>{labels[level]}</Badge>
}

export function DocumentBrowser({ onFolderOpen, currentFolderId, onEdit, onMove }: DocumentBrowserProps) {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [filters, setFilters] = useState<DocumentFilters>({
    parentId: currentFolderId || 'null',
    page: 1,
    limit: 20,
  })

  const { data: result, isLoading } = useDocuments({
    ...filters,
    parentId: currentFolderId || 'null',
  })
  const { data: breadcrumbResult } = useBreadcrumb(currentFolderId || '')
  const toggleStar = useToggleStar()
  const deleteDoc = useDeleteDocument()
  const trackDownload = useTrackDownload()

  const documents = result?.data || []
  const breadcrumb = breadcrumbResult?.data || []

  const handleToggleStar = async (id: string) => {
    try {
      await toggleStar.mutateAsync(id)
    } catch {
      toast({ title: 'Error', description: 'Failed to update star', variant: 'destructive' })
    }
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.name}"? ${doc.type === 'folder' ? 'All contents will be deleted.' : ''}`)) return
    try {
      await deleteDoc.mutateAsync(doc.id)
      toast({ title: 'Success', description: `${doc.type === 'folder' ? 'Folder' : 'File'} deleted` })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const handleDownload = async (doc: DocFile) => {
    try {
      const result = await trackDownload.mutateAsync(doc.id)
      window.open(result.data.url, '_blank')
    } catch {
      toast({ title: 'Error', description: 'Failed to download', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => onFolderOpen(undefined)}
        >
          <Home className="h-4 w-4" />
        </Button>
        {breadcrumb.map((item, index) => (
          <div key={item.id} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => onFolderOpen(item.id)}
              disabled={index === breadcrumb.length - 1}
            >
              {item.name}
            </Button>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-9"
            value={filters.search || ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
          />
        </div>

        <Select
          value={filters.category || 'all'}
          onValueChange={(v) => setFilters((f) => ({ ...f, category: v === 'all' ? undefined : v as DocumentCategory, page: 1 }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.accessLevel || 'all'}
          onValueChange={(v) => setFilters((f) => ({ ...f, accessLevel: v === 'all' ? undefined : v as AccessLevel, page: 1 }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access</SelectItem>
            {ACCESS_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Documents */}
      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No documents</h3>
          <p className="text-sm text-muted-foreground">
            This folder is empty. Upload files or create folders to get started.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="cursor-pointer"
                  onClick={() => doc.type === 'folder' && onFolderOpen(doc.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {doc.type === 'folder' ? (
                        <Folder className="h-5 w-5 text-amber-500" />
                      ) : (
                        getFileIcon((doc as DocFile).fileType)
                      )}
                      <span className="font-medium">{doc.name}</span>
                      {doc.isStarred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    {doc.category && (
                      <Badge variant="outline">
                        {DOCUMENT_CATEGORIES.find((c) => c.value === doc.category)?.label || doc.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {doc.type === 'file' ? formatBytes((doc as DocFile).fileSize) : '-'}
                  </TableCell>
                  <TableCell>{getAccessBadge(doc.accessLevel)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        {doc.type === 'file' && (
                          <DropdownMenuItem onClick={() => handleDownload(doc as DocFile)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleToggleStar(doc.id)}>
                          {doc.isStarred ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              Unstar
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Star
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(doc)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMove(doc)}>
                          <Move className="mr-2 h-4 w-4" />
                          Move
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(doc)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group relative rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
              onClick={() => doc.type === 'folder' && onFolderOpen(doc.id)}
            >
              <div className="flex flex-col items-center gap-2">
                {doc.type === 'folder' ? (
                  <Folder className="h-12 w-12 text-amber-500" />
                ) : (
                  <div className="h-12 w-12 flex items-center justify-center">
                    {getFileIcon((doc as DocFile).fileType)}
                  </div>
                )}
                <span className="text-sm font-medium text-center line-clamp-2">{doc.name}</span>
                {doc.type === 'file' && (
                  <span className="text-xs text-muted-foreground">
                    {formatBytes((doc as DocFile).fileSize)}
                  </span>
                )}
              </div>
              {doc.isStarred && (
                <Star className="absolute top-2 right-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                  {doc.type === 'file' && (
                    <DropdownMenuItem onClick={() => handleDownload(doc as DocFile)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleToggleStar(doc.id)}>
                    {doc.isStarred ? (
                      <>
                        <StarOff className="mr-2 h-4 w-4" />
                        Unstar
                      </>
                    ) : (
                      <>
                        <Star className="mr-2 h-4 w-4" />
                        Star
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(doc)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMove(doc)}>
                    <Move className="mr-2 h-4 w-4" />
                    Move
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(doc)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {result?.meta && result.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(result.meta.page - 1) * result.meta.limit + 1} to{' '}
            {Math.min(result.meta.page * result.meta.limit, result.meta.total)} of {result.meta.total} items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={result.meta.page === 1}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={result.meta.page === result.meta.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
