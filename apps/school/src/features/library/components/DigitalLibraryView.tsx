import { useState } from 'react'
import { Download, FileText, Headphones, BookOpen, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useDigitalBooks, useRecordDigitalAccess } from '../hooks/useLibrary'
import { BOOK_CATEGORIES, DIGITAL_FORMAT_LABELS, type DigitalFormat } from '../types/library.types'

const FORMAT_ICONS: Record<DigitalFormat, typeof FileText> = {
  pdf: FileText,
  epub: BookOpen,
  audiobook: Headphones,
}

export function DigitalLibraryView() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data: result, isLoading } = useDigitalBooks({
    search,
    category: categoryFilter as any,
    format: formatFilter as any,
    page,
    limit: 12,
  })
  const recordAccess = useRecordDigitalAccess()

  const books = result?.data || []
  const pagination = result?.meta

  const handleAccess = (id: string, title: string) => {
    recordAccess.mutate(id, {
      onSuccess: () => toast({ title: 'Opening', description: `Accessing "${title}"...` }),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Digital Library</h3>
        <p className="text-sm text-muted-foreground">Access e-books, PDFs, and audiobooks from the digital collection</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search digital books..."
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {BOOK_CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={formatFilter} onValueChange={(v) => { setFormatFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="epub">ePub</SelectItem>
            <SelectItem value="audiobook">Audiobook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : books.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No digital books found.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map(book => {
            const FormatIcon = FORMAT_ICONS[book.format]
            return (
              <Card key={book.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-3 p-4">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-16 h-22 rounded object-cover bg-muted flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x300?text=No+Cover' }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{book.title}</h4>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <FormatIcon className="h-3 w-3 mr-1" />
                          {DIGITAL_FORMAT_LABELS[book.format]}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">{book.fileSize}</Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">{book.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-3 flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-muted-foreground">
                      <Eye className="h-3 w-3 inline mr-1" />
                      {book.totalAccesses} accesses
                    </span>
                    <Button size="sm" variant="outline" onClick={() => handleAccess(book.id, book.title)}>
                      <Download className="h-3 w-3 mr-1" />
                      {book.format === 'audiobook' ? 'Listen' : 'Read'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
