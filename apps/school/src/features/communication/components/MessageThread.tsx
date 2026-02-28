import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Send, Paperclip, Loader2, Check, CheckCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Message, Conversation } from '../types/communication.types'
import { cn, getInitials } from '@/lib/utils'

interface MessageThreadProps {
  conversation: Conversation
  messages: Message[]
  currentUserId: string
  onSendMessage: (content: string) => void
  isLoading?: boolean
  isSending?: boolean
}

export function MessageThread({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  isLoading,
  isSending,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (newMessage.trim() && !isSending) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getOtherParticipant = () => {
    if (conversation.type === 'direct') {
      return conversation.participants.find((p) => p.userId !== currentUserId)
    }
    return null
  }

  const otherParticipant = getOtherParticipant()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar>
          <AvatarImage src={otherParticipant?.userAvatar} />
          <AvatarFallback>
            {getInitials(
              conversation.type === 'direct'
                ? otherParticipant?.userName || ''
                : conversation.title || 'Group'
            )}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">
            {conversation.type === 'direct'
              ? otherParticipant?.userName
              : conversation.title || 'Group Chat'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {conversation.type === 'direct'
              ? otherParticipant?.userRole
              : `${conversation.participants.length} members`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === currentUserId
              return (
                <div
                  key={message.id}
                  className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback className="text-xs">
                      {getInitials(message.senderName)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'max-w-[70%] space-y-1',
                      isOwn && 'items-end'
                    )}
                  >
                    {!isOwn && (
                      <p className="text-xs text-muted-foreground">
                        {message.senderName}
                      </p>
                    )}
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2',
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-1 text-xs text-muted-foreground',
                        isOwn && 'justify-end'
                      )}
                    >
                      <span>
                        {format(new Date(message.createdAt), 'h:mm a')}
                      </span>
                      {isOwn && (
                        <span>
                          {message.status === 'read' ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          ) : message.status === 'delivered' ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                    {message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
