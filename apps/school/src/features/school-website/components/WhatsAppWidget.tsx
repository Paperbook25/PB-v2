import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

interface WhatsAppWidgetProps {
  phoneNumber: string
  schoolName: string
}

export function WhatsAppWidget({ phoneNumber, schoolName }: WhatsAppWidgetProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Strip non-numeric characters from phone number
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  const defaultMessage = encodeURIComponent(
    `Hi! I'm interested in learning more about ${schoolName}.`
  )
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="hidden sm:flex fixed bottom-6 right-6 z-40 items-center gap-2 rounded-full shadow-lg transition-all duration-300 cursor-pointer group"
      style={{
        backgroundColor: '#25D366',
        padding: isHovered ? '14px 24px 14px 18px' : '14px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#25D366' }} />

      <MessageCircle className="h-6 w-6 text-white relative z-10 flex-shrink-0" fill="white" stroke="white" />

      <span
        className="text-white font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 relative z-10"
        style={{
          maxWidth: isHovered ? '150px' : '0px',
          opacity: isHovered ? 1 : 0,
        }}
      >
        Chat with us
      </span>
    </a>
  )
}
