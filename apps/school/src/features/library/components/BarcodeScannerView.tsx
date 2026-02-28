import { useState } from 'react'
import { Search, ScanLine, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useBarcodeScan } from '../hooks/useLibrary'
import { statusColors } from '@/lib/design-tokens'

export function BarcodeScannerView() {
  const [isbn, setIsbn] = useState('')
  const [scannedIsbn, setScannedIsbn] = useState('')

  const { data: result, isLoading } = useBarcodeScan(scannedIsbn)
  const scanResult = result?.data

  const handleScan = () => {
    if (isbn.trim().length >= 10) {
      setScannedIsbn(isbn.trim())
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Barcode / ISBN Scanner</h3>
        <p className="text-sm text-muted-foreground">Enter or scan an ISBN to quickly find a book in the catalog</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 max-w-md">
            <div className="relative flex-1">
              <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="Enter ISBN (e.g., 978-0-1234-5678-9)"
                className="pl-10"
              />
            </div>
            <Button onClick={handleScan} disabled={isbn.trim().length < 10 || isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Lookup
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Tip: In a real deployment, a USB/Bluetooth barcode scanner would auto-fill this field
          </p>
        </CardContent>
      </Card>

      {scannedIsbn && scanResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {scanResult.found ? (
                <CheckCircle className="h-5 w-5" style={{ color: statusColors.success }} />
              ) : (
                <XCircle className="h-5 w-5" style={{ color: statusColors.error }} />
              )}
              Scan Result for: <span className="font-mono">{scanResult.isbn}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanResult.found && scanResult.book ? (
              <div className="flex gap-4">
                <img
                  src={scanResult.book.coverUrl}
                  alt={scanResult.book.title}
                  className="w-20 h-28 rounded object-cover bg-muted"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x300?text=No+Cover' }}
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold">{scanResult.book.title}</h4>
                  <p className="text-sm text-muted-foreground">by {scanResult.book.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{scanResult.book.category}</Badge>
                    <Badge variant={scanResult.book.availableCopies > 0 ? 'default' : 'destructive'}>
                      {scanResult.book.availableCopies > 0
                        ? `${scanResult.book.availableCopies} available`
                        : 'Not Available'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shelf: {scanResult.book.location} &middot; Publisher: {scanResult.book.publisher} &middot; Year: {scanResult.book.publicationYear}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No book found with ISBN <span className="font-mono">{scanResult.isbn}</span></p>
                <p className="text-sm text-muted-foreground mt-1">You can add this book to the catalog manually.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
