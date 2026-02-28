import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  ParentPortalStatsCards,
  ConversationList,
  ChatView,
  MeetingsList,
  ScheduleMeetingDialog,
  ProgressReportCard,
} from '../components'
import type { Conversation, Meeting } from '../types/parent-portal.types'
import { useAuthStore } from '@/stores/useAuthStore'

export function ParentPortalPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('messages')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)

  // Mock parent data - in real app, get from user context
  const parentId = user?.id || 'PAR001'
  const parentName = user?.name || 'Parent User'

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleViewMeetingDetails = (meeting: Meeting) => {
    // Could open a detail dialog
    console.log('View meeting details:', meeting)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parent Portal"
        description="Communicate with teachers and track your child's progress"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Parent Portal' },
        ]}
        moduleColor="parent-portal"
      />

      <ParentPortalStatsCards parentId={parentId} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-340px)]">
            <div className="lg:col-span-1">
              <ConversationList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.id}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <ChatView
                  conversation={selectedConversation}
                  currentUserId={parentId}
                  currentUserName={parentName}
                  currentUserType="parent"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground">
                    Select a conversation to start messaging
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          <MeetingsList
            onSchedule={() => setScheduleDialogOpen(true)}
            onViewDetails={handleViewMeetingDetails}
          />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressReportCard />
          </div>
        </TabsContent>
      </Tabs>

      <ScheduleMeetingDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        parentId={parentId}
        parentName={parentName}
      />
    </div>
  )
}
