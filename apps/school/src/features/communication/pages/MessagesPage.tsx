import { useState } from 'react'
import { format } from 'date-fns'
import { Search, Plus, MessageSquare, Users, User, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/layout/PageHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import {
  useConversations,
  useMessages,
  useSendMessage,
  useCreateConversation,
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
import { useUser } from '@/stores/useAuthStore'
import { apiGet } from '@/lib/api-client'

export function MessagesPage() {
  const { toast } = useToast()
  const user = useUser()
  const currentUserId = user?.id ?? ''

  const [search, setSearch] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newConvOpen, setNewConvOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')

  const { data: conversationsResult, isLoading: conversationsLoading } = useConversations({
    search: search || undefined,
  })

  const { data: messagesResult, isLoading: messagesLoading } = useMessages(
    selectedConversation?.id || '',
    1,
    100
  )

  const sendMessageMutation = useSendMessage()
  const createConversationMutation = useCreateConversation()

  // User search for new conversation dialog
  const userSearchQuery = useQuery({
    queryKey: ['users', 'search', userSearch],
    queryFn: () => apiGet<{ data: any[] }>(`/api/users?search=${encodeURIComponent(userSearch)}&limit=20`),
    enabled: userSearch.length >= 2 && newConvOpen,
  })

  const conversations = conversationsResult?.data || []
  const messages = messagesResult?.data || []
  const searchedUsers: any[] = userSearchQuery.data?.data || []

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        content,
      })
    } catch {
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' })
    }
  }

  const handleStartConversation = async (recipientUser: any) => {
    try {
      const result = await createConversationMutation.mutateAsync({
        participantIds: [recipientUser.id],
      })
      setSelectedConversation(result.data)
      setNewConvOpen(false)
      setUserSearch('')
    } catch {
      toast({ title: 'Error', description: 'Failed to start conversation.', variant: 'destructive' })
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
          <Dialog open={newConvOpen} onOpenChange={setNewConvOpen}>
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
              <div className="space-y-4 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>

                {userSearch.length < 2 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Type at least 2 characters to search
                  </p>
                ) : userSearchQuery.isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : searchedUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                ) : (
                  <ScrollArea className="max-h-64">
                    <div className="space-y-1">
                      {searchedUsers
                        .filter((u) => u.id !== currentUserId)
                        .map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleStartConversation(u)}
                            disabled={createConversationMutation.isPending}
                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback className="text-xs">{getInitials(u.name || '')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{u.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  </ScrollArea>
                )}
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
                                {format(new Date(conversation.lastMessage.createdAt), 'h:mm a')}
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
              <p className="text-sm">Choose a conversation from the list to view messages</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
