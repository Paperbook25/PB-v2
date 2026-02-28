import { Sparkles } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useAIPlanner } from '../hooks/useAIPlanner'
import { AIPlannerChat } from './AIPlannerChat'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: { classId?: string; sectionId?: string; teacherId?: string }
}

export function AIPlannerDrawer({ open, onOpenChange, context }: Props) {
  const { messages, isStreaming, isGenerating, sendMessage, directGenerate, applyAsDraft, clearChat } = useAIPlanner(context)

  const handleQuickAction = (action: string) => {
    if (action === 'apply_draft') {
      applyAsDraft()
    } else if (action === 'regenerate') {
      directGenerate()
    } else if (action === 'edit_manual') {
      onOpenChange(false)
      // Navigate to timetable management could go here
    } else if (action === 'view_timetable') {
      onOpenChange(false)
    } else {
      // Treat as a message to send
      sendMessage(action)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-sm">AI Timetable Planner</SheetTitle>
              <SheetDescription className="text-[11px]">Generate and manage schedules</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <AIPlannerChat
          messages={messages}
          isStreaming={isStreaming}
          isGenerating={isGenerating}
          onSendMessage={sendMessage}
          onQuickAction={handleQuickAction}
          className="flex-1 min-h-0"
        />
      </SheetContent>
    </Sheet>
  )
}
