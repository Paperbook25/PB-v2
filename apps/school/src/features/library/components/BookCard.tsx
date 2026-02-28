import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Book } from '../types/library.types'

interface BookCardProps {
  book: Book
  onClick?: () => void
}

export function BookCard({ book, onClick }: BookCardProps) {
  const isAvailable = book.availableCopies > 0

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-[3/4] bg-muted relative">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://placehold.co/200x300/e2e8f0/64748b?text=${encodeURIComponent(book.title.substring(0, 10))}`
          }}
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Not Available</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <p className="font-medium text-sm line-clamp-1" title={book.title}>
          {book.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1" title={book.author}>
          {book.author}
        </p>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary" className="text-[10px]">
            {book.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {book.availableCopies}/{book.totalCopies}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
