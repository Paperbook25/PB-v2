import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Play,
  FileText,
  HelpCircle,
  ClipboardList,
  Video,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import type { Lesson } from '../types/lms.types'
import { statusColors, moduleColors } from '@/lib/design-tokens'

// ==================== PROPS ====================

interface LessonViewerProps {
  lesson: Lesson
  onComplete?: () => void
}

// ==================== VIDEO HELPERS ====================

function extractYouTubeId(url: string): string | null {
  // Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]

  const longMatch = url.match(
    /youtube\.com\/(?:watch\?.*v=|embed\/)([a-zA-Z0-9_-]{11})/
  )
  if (longMatch) return longMatch[1]

  return null
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match ? match[1] : null
}

// ==================== RENDERERS ====================

function VideoRenderer({ lesson }: { lesson: Lesson }) {
  const { videoProvider, contentUrl } = lesson

  if (videoProvider === 'youtube') {
    const videoId = extractYouTubeId(contentUrl)
    if (videoId) {
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={lesson.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
  }

  if (videoProvider === 'vimeo') {
    const videoId = extractVimeoId(contentUrl)
    if (videoId) {
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            title={lesson.title}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
  }

  if (videoProvider === 'upload') {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
        <video
          src={contentUrl}
          controls
          className="h-full w-full"
          title={lesson.title}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  // Fallback placeholder
  return (
    <Card className="aspect-video flex items-center justify-center bg-muted">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Play className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Video is not available for preview.
        </p>
        {contentUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={contentUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Video Link
            </a>
          </Button>
        )}
      </div>
    </Card>
  )
}

function DocumentRenderer({ lesson }: { lesson: Lesson }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="icon-box" style={{ backgroundColor: statusColors.infoLight }}>
            <FileText className="h-5 w-5" style={{ color: statusColors.info }} />
          </div>
          {lesson.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Download or view the document to study this lesson's material.
        </p>
        {lesson.contentUrl && (
          <Button asChild>
            <a
              href={lesson.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Download Document
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function QuizRenderer({ lesson }: { lesson: Lesson }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-800">
            <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-200" />
          </div>
          {lesson.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Test your understanding with this quiz. Make sure you have reviewed the
          lesson material before attempting.
        </p>
        <Button>Start Quiz</Button>
      </CardContent>
    </Card>
  )
}

function AssignmentRenderer({ lesson }: { lesson: Lesson }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="icon-box" style={{ backgroundColor: statusColors.successLight }}>
            <ClipboardList className="h-5 w-5" style={{ color: statusColors.success }} />
          </div>
          {lesson.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Complete this assignment and submit your work for grading.
        </p>
        <p className="text-sm font-medium">View Assignment</p>
      </CardContent>
    </Card>
  )
}

function LiveClassRenderer({ lesson }: { lesson: Lesson }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="icon-box" style={{ backgroundColor: statusColors.errorLight }}>
            <Video className="h-5 w-5" style={{ color: statusColors.error }} />
          </div>
          {lesson.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Join the live class session at the scheduled time.
        </p>
        {lesson.contentUrl && (
          <Button asChild>
            <a
              href={lesson.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Meeting
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== MAIN COMPONENT ====================

export function LessonViewer({ lesson, onComplete }: LessonViewerProps) {
  return (
    <div className="space-y-6">
      {/* Lesson content by type */}
      {lesson.type === 'video' && <VideoRenderer lesson={lesson} />}
      {lesson.type === 'document' && <DocumentRenderer lesson={lesson} />}
      {lesson.type === 'quiz' && <QuizRenderer lesson={lesson} />}
      {lesson.type === 'assignment' && <AssignmentRenderer lesson={lesson} />}
      {lesson.type === 'live_class' && <LiveClassRenderer lesson={lesson} />}

      {/* Mark as Complete */}
      {onComplete && (
        <div className="flex justify-end pt-2">
          <Button onClick={onComplete} variant="default">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Complete
          </Button>
        </div>
      )}
    </div>
  )
}
