import { prisma } from '../config/db.js'

interface ChatResponse {
  answer: string
  confidence: number // 0-1
  source: string // 'faq', 'school_info', 'admissions', 'fallback'
  suggestedQuestions?: string[]
}

// Pre-built knowledge base from school data
async function getSchoolKnowledge(schoolId: string) {
  const [profile, settings, faqs, announcements] = await Promise.all([
    prisma.schoolProfile.findFirst({ where: { id: schoolId } }),
    prisma.websiteSettings.findFirst({ where: { organizationId: schoolId } }),
    prisma.websiteSection.findMany({
      where: { organizationId: schoolId, type: 'faq' },
      select: { content: true },
    }),
    prisma.announcement.findMany({
      where: { organizationId: schoolId, isPublished: true },
      take: 5,
      orderBy: { publishedAt: 'desc' },
      select: { title: true, body: true },
    }),
  ])

  // Extract FAQ items
  const faqItems: { question: string; answer: string }[] = []
  for (const section of faqs) {
    const content = section.content as Record<string, unknown>
    const items = (content?.items || content?.questions || []) as Array<{
      question?: string
      answer?: string
    }>
    for (const item of items) {
      if (item.question && item.answer) {
        faqItems.push({ question: item.question, answer: item.answer })
      }
    }
  }

  return { profile, settings, faqItems, announcements }
}

// Simple keyword matching with word-overlap scoring (no external AI needed)
function findBestMatch(
  query: string,
  faqItems: { question: string; answer: string }[]
): { answer: string; score: number } | null {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2)

  let bestMatch: { answer: string; score: number } | null = null

  for (const faq of faqItems) {
    const questionLower = faq.question.toLowerCase()
    const answerLower = faq.answer.toLowerCase()

    // Exact substring match
    if (questionLower.includes(queryLower) || queryLower.includes(questionLower)) {
      return { answer: faq.answer, score: 1.0 }
    }

    // Word overlap score
    let matchCount = 0
    for (const word of queryWords) {
      if (questionLower.includes(word) || answerLower.includes(word)) matchCount++
    }
    const score = queryWords.length > 0 ? matchCount / queryWords.length : 0

    if (score > 0.4 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { answer: faq.answer, score }
    }
  }

  return bestMatch
}

export async function handleChat(schoolId: string, message: string): Promise<ChatResponse> {
  const knowledge = await getSchoolKnowledge(schoolId)
  const msgLower = message.toLowerCase()

  // 1. Check FAQ match (high confidence)
  const faqMatch = findBestMatch(message, knowledge.faqItems)
  if (faqMatch && faqMatch.score > 0.5) {
    return {
      answer: faqMatch.answer,
      confidence: faqMatch.score,
      source: 'faq',
      suggestedQuestions: knowledge.faqItems.slice(0, 3).map((f) => f.question),
    }
  }

  // 2. Check common school queries via keyword patterns
  if (/admission|apply|enrol/.test(msgLower)) {
    return {
      answer:
        'Admissions are open! You can apply online through our admissions page. Click the "Apply Now" button on our website or visit the Admissions section for details about eligibility, fees, and the application process.',
      confidence: 0.8,
      source: 'admissions',
      suggestedQuestions: [
        'What are the admission fees?',
        'What documents are required?',
        'What is the admission process?',
      ],
    }
  }

  if (/fee|cost|price|payment/.test(msgLower)) {
    return {
      answer:
        'Please check our Fee Structure section on the Admissions page for detailed fee information. We offer flexible payment options including online payment, bank transfer, and installments. Scholarships are available for meritorious students.',
      confidence: 0.7,
      source: 'school_info',
      suggestedQuestions: [
        'Are scholarships available?',
        'What payment methods do you accept?',
        'Is there an installment option?',
      ],
    }
  }

  if (/contact|phone|email|address|location|reach/.test(msgLower)) {
    const p = knowledge.profile
    let answer = 'You can reach us through:'
    if (p?.phone) answer += `\nPhone: ${p.phone}`
    if (p?.email) answer += `\nEmail: ${p.email}`
    if (p?.address)
      answer += `\nAddress: ${[p.address, p.city, p.state, p.pincode].filter(Boolean).join(', ')}`
    return {
      answer,
      confidence: 0.9,
      source: 'school_info',
    }
  }

  if (/timing|hour|open|close|schedule/.test(msgLower)) {
    return {
      answer:
        'Our school timings are:\n- Pre-Primary: 8:30 AM - 12:30 PM\n- Primary: 8:00 AM - 2:30 PM\n- Middle & Senior: 7:30 AM - 3:00 PM\n\nThe school office is open Monday-Saturday, 8:00 AM - 4:00 PM.',
      confidence: 0.7,
      source: 'school_info',
    }
  }

  if (/transport|bus|route|pickup/.test(msgLower)) {
    return {
      answer:
        'We provide GPS-tracked bus service covering multiple routes across the city. Each bus has a female attendant, CCTV, and first-aid kit. Please visit our Campus & Facilities page for route details, or contact the transport office.',
      confidence: 0.7,
      source: 'school_info',
    }
  }

  // 3. Partial FAQ match (lower threshold)
  if (faqMatch && faqMatch.score > 0.3) {
    return {
      answer: faqMatch.answer,
      confidence: faqMatch.score,
      source: 'faq',
      suggestedQuestions: knowledge.faqItems.slice(0, 3).map((f) => f.question),
    }
  }

  // 4. Fallback — offer WhatsApp if available
  const whatsapp = (knowledge.settings as Record<string, unknown>)?.whatsappNumber as
    | string
    | undefined
  return {
    answer: whatsapp
      ? `I'm not sure about that. Would you like to chat with our admissions team directly on WhatsApp? Click here: https://wa.me/${whatsapp.replace(/\D/g, '')}`
      : "I'm not sure about that. Please contact our school office for more information, or try asking about admissions, fees, timings, transport, or facilities.",
    confidence: 0.1,
    source: 'fallback',
    suggestedQuestions: [
      'How do I apply for admission?',
      'What are the school fees?',
      'What facilities do you have?',
      'What are the school timings?',
    ],
  }
}
