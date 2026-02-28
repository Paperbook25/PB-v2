import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, Paperclip } from 'lucide-react'
import { useMessages, useSendMessage, useMarkConversationAsRead } from '../hooks/useParentPortal'
import type { Conversation, Message } from '../types/parent-portal.types'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface ChatViewProps {
  conversation: Conversation
  currentUserId: string
  currentUserName: string
  currentUserType: 'parent' | 'teacher'
  currentUserAvatar?: string
}

export function ChatView({
  conversation,
  currentUserId,
  currentUserName,
  currentUserType,
  currentUserAvatar,
}: ChatViewProps) {
  const { toast } = useToast()
  const [newMessage, setNewMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: result, isLoading } = useMessages(conversation.id)
  const sendMutation = useSendMessage()
  const markReadMutation = useMarkConversationAsRead()

  const messages = result?.data ?? []

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversation.unreadCount > 0) {
      markReadMutation.mutate(conversation.id)
    }
  }, [conversation.id, conversation.unreadCount])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim()) return

    try {
      await sendMutation.mutateAsync({
        conversationId: conversation.id,
        data: {
          senderId: currentUserId,
          senderName: currentUserName,
          senderType: currentUserType,
          senderAvatar: currentUserAvatar,
          content: newMessage.trim(),
        },
      })
      setNewMessage('')
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId)

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton className="h-16 w-64 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherParticipant?.avatar} />
            <AvatarFallback>
              {otherParticipant?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{otherParticipant?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Re: {conversation.studentName} ({conversation.studentClass} - {conversation.studentSection})
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea ref={scrollRef} className="h-[calc(100vh-380px)] p-4">
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {!isOwn && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.senderAvatar} />
                        <AvatarFallback className="text-xs">
                          {msg.senderName?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMutation.isPending}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
