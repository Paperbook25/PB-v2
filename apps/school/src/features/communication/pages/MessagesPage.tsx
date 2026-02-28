import { useState } from 'react'
import { format } from 'date-fns'
import { Search, Plus, MessageSquare, Users, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/layout/PageHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useConversations,
  useMessages,
  useSendMessage,
} from '../hooks/useCommunication'
import { MessageThread } from '../components/MessageThread'
import { Conversation } from '../types/communication.types'
import { cn, getInitials } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function MessagesPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const currentUserId = 'current-user-id' // In real app, get from auth store

  const { data: conversationsResult, isLoading: conversationsLoading } = useConversations({
    search: search || undefined,
  })

  const { data: messagesResult, isLoading: messagesLoading } = useMessages(
    selectedConversation?.id || '',
    1,
    100
  )

  const sendMessageMutation = useSendMessage()

  const conversations = conversationsResult?.data || []
  const messages = messagesResult?.data || []

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        content,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      })
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    if (conversation.type === 'direct') {
      return conversation.participants.find((p) => p.userId !== currentUserId)
    }
    return null
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Two-way messaging with parents, teachers, and staff"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Communication', href: '/communication' },
          { label: 'Messages' },
        ]}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a New Conversation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input placeholder="Search for a user..." />
                <p className="text-sm text-muted-foreground text-center py-4">
                  Search for a teacher, parent, or staff member to start a conversation
                </p>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-72px)]">
            {conversationsLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new conversation to begin messaging</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation)
                  const isSelected = selectedConversation?.id === conversation.id

                  return (
                    <div
                      key={conversation.id}
                      className={cn(
                        'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                        isSelected && 'bg-muted'
                      )}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={otherParticipant?.userAvatar} />
                          <AvatarFallback>
                            {conversation.type === 'direct'
                              ? getInitials(otherParticipant?.userName || '')
                              : conversation.title?.charAt(0) || 'G'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {conversation.type === 'direct'
                                ? otherParticipant?.userName
                                : conversation.title || 'Group Chat'}
                            </p>
                            {conversation.lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  new Date(conversation.lastMessage.createdAt),
                                  'h:mm a'
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {conversation.type === 'group' ? (
                              <Users className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <User className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {conversation.type === 'direct'
                                ? otherParticipant?.userRole
                                : `${conversation.participants.length} members`}
                            </span>
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              messages={messages}
              currentUserId={currentUserId}
              onSendMessage={handleSendMessage}
              isLoading={messagesLoading}
              isSending={sendMessageMutation.isPending}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">
                Choose a conversation from the list to view messages
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
