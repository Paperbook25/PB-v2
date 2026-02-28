import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEligibleStudentsForHostel } from '../hooks/useHostel'
import type { EligibleStudent } from '../api/hostel.api'

interface StudentSelectorProps {
  value?: string
  onSelect: (student: EligibleStudent | null) => void
  gender?: 'male' | 'female'
  placeholder?: string
  disabled?: boolean
}

export function StudentSelector({
  value,
  onSelect,
  gender,
  placeholder = 'Select a student...',
  disabled = false,
}: StudentSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: studentsResult, isLoading } = useEligibleStudentsForHostel({
    search: searchTerm || undefined,
    gender,
  })

  const students = studentsResult?.data || []
  const selectedStudent = students.find((s) => s.id === value)

  const handleSelect = (student: EligibleStudent) => {
    onSelect(student)
    setOpen(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedStudent ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedStudent.photoUrl} alt={selectedStudent.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(selectedStudent.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedStudent.name}</span>
              <span className="text-muted-foreground text-xs">
                ({selectedStudent.class} - {selectedStudent.section})
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, admission no..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <CommandEmpty>
                {searchTerm ? 'No students found.' : 'No eligible students available.'}
              </CommandEmpty>
            ) : (
              <CommandGroup heading={`Eligible Students (${students.length})`}>
                {students.slice(0, 50).map((student) => (
                  <CommandItem
                    key={student.id}
                    value={student.id}
                    onSelect={() => handleSelect(student)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === student.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={student.photoUrl} alt={student.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.class} - {student.section} | Roll: {student.rollNumber} |{' '}
                        {student.admissionNumber}
                      </p>
                    </div>
                  </CommandItem>
                ))}
                {students.length > 50 && (
                  <div className="px-2 py-3 text-xs text-center text-muted-foreground">
                    Showing first 50 results. Type to search for more.
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
