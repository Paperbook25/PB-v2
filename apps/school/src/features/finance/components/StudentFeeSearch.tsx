import { useState, useEffect } from 'react'
import { Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Student {
  id: string
  name: string
  className: string
  section: string
  admissionNumber: string
}

interface StudentFeeSearchProps {
  onSelect: (student: Student | null) => void
  selectedStudent?: Student | null
}

export function StudentFeeSearch({ onSelect, selectedStudent }: StudentFeeSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      if (search.length < 2) {
        setStudents([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/finance/students?search=${encodeURIComponent(search)}`)
        const data = await response.json()
        setStudents(data.data || [])
      } catch (error) {
        console.error('Failed to fetch students:', error)
        setStudents([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchStudents, 300)
    return () => clearTimeout(debounce)
  }, [search])

  const handleSelect = (student: Student) => {
    onSelect(student)
    setOpen(false)
    setSearch('')
  }

  const handleClear = () => {
    onSelect(null)
    setSearch('')
  }

  if (selectedStudent) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{selectedStudent.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedStudent.className} - {selectedStudent.section} | {selectedStudent.admissionNumber}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Change
        </Button>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student by name or admission number..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              if (!open) setOpen(true)
            }}
            onClick={() => setOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search student..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : search.length < 2 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            ) : students.length === 0 ? (
              <CommandEmpty>No students found.</CommandEmpty>
            ) : (
              <CommandGroup heading="Students">
                {students.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={student.id}
                    onSelect={() => handleSelect(student)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.className} - {student.section} | {student.admissionNumber}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
