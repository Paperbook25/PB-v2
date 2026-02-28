import { faker } from '@faker-js/faker'
import type {
  BankQuestion,
  QuestionDifficulty,
  OnlineExamConfig,
  OnlineExamAttempt,
  QuestionBankStats,
} from '@/features/lms/types/question-bank.types'
import type { QuizQuestionType, CourseCategory } from '@/features/lms/types/lms.types'

// ==================== QUESTION POOLS BY SUBJECT ====================

const mathQuestions: Omit<BankQuestion, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'usageCount' | 'status'>[] = [
  // Algebra - Easy
  {
    question: 'Solve for x: 2x + 5 = 15',
    type: 'short_answer',
    options: [],
    correctAnswer: '5',
    points: 2,
    explanation: 'Subtract 5 from both sides: 2x = 10. Then divide by 2: x = 5',
    subject: 'mathematics',
    topic: 'algebra',
    difficulty: 'easy',
    tags: ['linear equations', 'solving'],
  },
  {
    question: 'What is the value of 3² + 4²?',
    type: 'mcq',
    options: ['25', '12', '49', '7'],
    correctAnswer: '25',
    points: 1,
    explanation: '3² = 9, 4² = 16, so 9 + 16 = 25',
    subject: 'mathematics',
    topic: 'algebra',
    difficulty: 'easy',
    tags: ['exponents', 'arithmetic'],
  },
  // Algebra - Medium
  {
    question: 'Factorize: x² - 9',
    type: 'mcq',
    options: ['(x+3)(x-3)', '(x+9)(x-1)', '(x-3)²', '(x+3)²'],
    correctAnswer: '(x+3)(x-3)',
    points: 3,
    explanation: 'This is a difference of squares: a² - b² = (a+b)(a-b). Here x² - 9 = x² - 3² = (x+3)(x-3)',
    subject: 'mathematics',
    topic: 'algebra',
    difficulty: 'medium',
    tags: ['factorization', 'difference of squares'],
  },
  {
    question: 'If f(x) = 2x + 3, what is f(5)?',
    type: 'short_answer',
    options: [],
    correctAnswer: '13',
    points: 2,
    explanation: 'f(5) = 2(5) + 3 = 10 + 3 = 13',
    subject: 'mathematics',
    topic: 'algebra',
    difficulty: 'medium',
    tags: ['functions', 'substitution'],
  },
  // Algebra - Hard
  {
    question: 'Solve the quadratic equation: x² - 5x + 6 = 0',
    type: 'mcq',
    options: ['x = 2, 3', 'x = 1, 6', 'x = -2, -3', 'x = 5, 1'],
    correctAnswer: 'x = 2, 3',
    points: 5,
    explanation: 'Factor: (x-2)(x-3) = 0, so x = 2 or x = 3',
    subject: 'mathematics',
    topic: 'algebra',
    difficulty: 'hard',
    tags: ['quadratic', 'factorization'],
  },
  // Geometry
  {
    question: 'The sum of angles in a triangle is:',
    type: 'mcq',
    options: ['180°', '360°', '90°', '270°'],
    correctAnswer: '180°',
    points: 1,
    explanation: 'The sum of interior angles in any triangle is always 180 degrees.',
    subject: 'mathematics',
    topic: 'geometry',
    difficulty: 'easy',
    tags: ['triangles', 'angles'],
  },
  {
    question: 'A circle has a radius of 7 cm. What is its area? (Use π = 22/7)',
    type: 'short_answer',
    options: [],
    correctAnswer: '154',
    points: 3,
    explanation: 'Area = πr² = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 cm²',
    subject: 'mathematics',
    topic: 'geometry',
    difficulty: 'medium',
    tags: ['circle', 'area'],
  },
  {
    question: 'All radii of a circle are equal in length.',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 'True',
    points: 1,
    explanation: 'By definition, a radius is the distance from the center to any point on the circle, which is constant.',
    subject: 'mathematics',
    topic: 'geometry',
    difficulty: 'easy',
    tags: ['circle', 'properties'],
  },
  // Statistics
  {
    question: 'What is the mean of: 2, 4, 6, 8, 10?',
    type: 'short_answer',
    options: [],
    correctAnswer: '6',
    points: 2,
    explanation: 'Mean = (2+4+6+8+10)/5 = 30/5 = 6',
    subject: 'mathematics',
    topic: 'statistics',
    difficulty: 'easy',
    tags: ['mean', 'average'],
  },
  {
    question: 'The median of an even number of observations is the average of the two middle values.',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 'True',
    points: 2,
    explanation: 'For an even count, median = (n/2 th term + (n/2 + 1)th term) / 2',
    subject: 'mathematics',
    topic: 'statistics',
    difficulty: 'medium',
    tags: ['median', 'central tendency'],
  },
]

const scienceQuestions: Omit<BankQuestion, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'usageCount' | 'status'>[] = [
  // Physics - Easy
  {
    question: 'What is the SI unit of force?',
    type: 'mcq',
    options: ['Newton', 'Joule', 'Watt', 'Pascal'],
    correctAnswer: 'Newton',
    points: 1,
    explanation: 'Force is measured in Newtons (N). 1 N = 1 kg⋅m/s²',
    subject: 'science',
    topic: 'physics',
    difficulty: 'easy',
    tags: ['units', 'force'],
  },
  {
    question: 'Light travels faster than sound.',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 'True',
    points: 1,
    explanation: 'Light travels at ~3×10⁸ m/s while sound travels at ~343 m/s in air.',
    subject: 'science',
    topic: 'physics',
    difficulty: 'easy',
    tags: ['light', 'sound', 'speed'],
  },
  // Physics - Medium
  {
    question: 'A car travels 100 km in 2 hours. What is its average speed?',
    type: 'short_answer',
    options: [],
    correctAnswer: '50',
    points: 2,
    explanation: 'Speed = Distance/Time = 100 km / 2 hours = 50 km/h',
    subject: 'science',
    topic: 'physics',
    difficulty: 'medium',
    tags: ['speed', 'motion'],
  },
  {
    question: 'According to Newton\'s third law, for every action there is:',
    type: 'mcq',
    options: ['An equal and opposite reaction', 'A greater reaction', 'No reaction', 'A delayed reaction'],
    correctAnswer: 'An equal and opposite reaction',
    points: 2,
    explanation: 'Newton\'s third law states that forces always come in pairs - equal in magnitude, opposite in direction.',
    subject: 'science',
    topic: 'physics',
    difficulty: 'medium',
    tags: ['newton laws', 'forces'],
  },
  // Chemistry - Easy
  {
    question: 'What is the chemical symbol for water?',
    type: 'mcq',
    options: ['H₂O', 'CO₂', 'NaCl', 'O₂'],
    correctAnswer: 'H₂O',
    points: 1,
    explanation: 'Water is composed of 2 hydrogen atoms and 1 oxygen atom.',
    subject: 'science',
    topic: 'chemistry',
    difficulty: 'easy',
    tags: ['compounds', 'formulas'],
  },
  {
    question: 'pH value of 7 indicates a neutral solution.',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 'True',
    points: 1,
    explanation: 'pH 7 is neutral, below 7 is acidic, above 7 is basic/alkaline.',
    subject: 'science',
    topic: 'chemistry',
    difficulty: 'easy',
    tags: ['pH', 'acids bases'],
  },
  // Chemistry - Medium
  {
    question: 'What type of bond is formed when electrons are shared between atoms?',
    type: 'mcq',
    options: ['Covalent bond', 'Ionic bond', 'Metallic bond', 'Hydrogen bond'],
    correctAnswer: 'Covalent bond',
    points: 2,
    explanation: 'Covalent bonds involve sharing of electrons. Ionic bonds involve transfer of electrons.',
    subject: 'science',
    topic: 'chemistry',
    difficulty: 'medium',
    tags: ['bonding', 'chemical bonds'],
  },
  // Biology - Easy
  {
    question: 'What is the powerhouse of the cell?',
    type: 'mcq',
    options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi body'],
    correctAnswer: 'Mitochondria',
    points: 1,
    explanation: 'Mitochondria produce ATP (energy currency) through cellular respiration.',
    subject: 'science',
    topic: 'biology',
    difficulty: 'easy',
    tags: ['cell', 'organelles'],
  },
  {
    question: 'Photosynthesis occurs in the leaves of plants.',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 'True',
    points: 1,
    explanation: 'Chloroplasts in leaf cells contain chlorophyll which enables photosynthesis.',
    subject: 'science',
    topic: 'biology',
    difficulty: 'easy',
    tags: ['photosynthesis', 'plants'],
  },
  // Biology - Medium
  {
    question: 'Which blood cells are responsible for carrying oxygen?',
    type: 'mcq',
    options: ['Red Blood Cells', 'White Blood Cells', 'Platelets', 'Plasma'],
    correctAnswer: 'Red Blood Cells',
    points: 2,
    explanation: 'RBCs contain hemoglobin which binds to oxygen and transports it throughout the body.',
    subject: 'science',
    topic: 'biology',
    difficulty: 'medium',
    tags: ['blood', 'circulatory system'],
  },
]

const englishQuestions: Omit<BankQuestion, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'usageCount' | 'status'>[] = [
  // Grammar - Easy
  {
    question: 'Choose the correct form: "She ___ to school every day."',
    type: 'mcq',
    options: ['goes', 'go', 'going', 'gone'],
    correctAnswer: 'goes',
    points: 1,
    explanation: 'Third person singular (she) requires "goes" in simple present tense.',
    subject: 'english',
    topic: 'grammar',
    difficulty: 'easy',
    tags: ['verb forms', 'present tense'],
  },
  {
    question: '"Running" is a gerund (verb form used as a noun).',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 'True',
    points: 1,
    explanation: 'A gerund is the -ing form of a verb used as a noun (e.g., "Running is fun").',
    subject: 'english',
    topic: 'grammar',
    difficulty: 'easy',
    tags: ['gerund', 'parts of speech'],
  },
  // Grammar - Medium
  {
    question: 'Identify the type of sentence: "What a beautiful sunset!"',
    type: 'mcq',
    options: ['Exclamatory', 'Interrogative', 'Declarative', 'Imperative'],
    correctAnswer: 'Exclamatory',
    points: 2,
    explanation: 'Exclamatory sentences express strong emotion and end with an exclamation mark.',
    subject: 'english',
    topic: 'grammar',
    difficulty: 'medium',
    tags: ['sentence types'],
  },
  {
    question: 'Choose the correct pronoun: "Neither of the boys forgot ___ homework."',
    type: 'mcq',
    options: ['his', 'their', 'its', 'them'],
    correctAnswer: 'his',
    points: 3,
    explanation: '"Neither" is singular and takes a singular pronoun. "His" is used for male subjects.',
    subject: 'english',
    topic: 'grammar',
    difficulty: 'medium',
    tags: ['pronouns', 'agreement'],
  },
  // Vocabulary - Easy
  {
    question: 'What is the antonym of "happy"?',
    type: 'mcq',
    options: ['Sad', 'Joyful', 'Cheerful', 'Pleased'],
    correctAnswer: 'Sad',
    points: 1,
    explanation: 'An antonym is a word opposite in meaning. Sad is the opposite of happy.',
    subject: 'english',
    topic: 'vocabulary',
    difficulty: 'easy',
    tags: ['antonyms'],
  },
  {
    question: 'What is a synonym for "big"?',
    type: 'short_answer',
    options: [],
    correctAnswer: 'large',
    points: 1,
    explanation: 'Synonyms include: large, huge, enormous, massive, giant.',
    subject: 'english',
    topic: 'vocabulary',
    difficulty: 'easy',
    tags: ['synonyms'],
  },
  // Literature
  {
    question: 'Who wrote "Romeo and Juliet"?',
    type: 'mcq',
    options: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 'William Shakespeare',
    points: 1,
    explanation: 'Romeo and Juliet is a tragedy written by William Shakespeare around 1594-1596.',
    subject: 'english',
    topic: 'literature',
    difficulty: 'easy',
    tags: ['shakespeare', 'drama'],
  },
  {
    question: 'A metaphor is a direct comparison without using "like" or "as".',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 'True',
    points: 2,
    explanation: 'A metaphor directly states one thing IS another. Similes use "like" or "as".',
    subject: 'english',
    topic: 'literature',
    difficulty: 'medium',
    tags: ['figurative language', 'metaphor'],
  },
  // Reading Comprehension
  {
    question: 'The main idea of a paragraph is usually found in the:',
    type: 'mcq',
    options: ['Topic sentence', 'Last sentence only', 'Middle sentences', 'Title only'],
    correctAnswer: 'Topic sentence',
    points: 2,
    explanation: 'The topic sentence (usually first) contains the main idea; other sentences provide support.',
    subject: 'english',
    topic: 'reading_comprehension',
    difficulty: 'medium',
    tags: ['main idea', 'paragraph structure'],
  },
]

const generalQuestions: Omit<BankQuestion, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'usageCount' | 'status'>[] = [
  {
    question: 'What is the capital of India?',
    type: 'mcq',
    options: ['New Delhi', 'Mumbai', 'Kolkata', 'Chennai'],
    correctAnswer: 'New Delhi',
    points: 1,
    explanation: 'New Delhi has been the capital of India since 1911.',
    subject: 'general',
    topic: 'general_knowledge',
    difficulty: 'easy',
    tags: ['capitals', 'India'],
  },
  {
    question: 'The Great Wall of China is visible from space with the naked eye.',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 'False',
    points: 2,
    explanation: 'This is a common myth. The Great Wall is too narrow to be seen from space without aid.',
    subject: 'general',
    topic: 'general_knowledge',
    difficulty: 'medium',
    tags: ['myths', 'facts'],
  },
  {
    question: 'Which planet is known as the Red Planet?',
    type: 'mcq',
    options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
    points: 1,
    explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
    subject: 'general',
    topic: 'general_knowledge',
    difficulty: 'easy',
    tags: ['planets', 'solar system'],
  },
  {
    question: 'How many days are there in a leap year?',
    type: 'short_answer',
    options: [],
    correctAnswer: '366',
    points: 1,
    explanation: 'A leap year has 366 days, with February having 29 days instead of 28.',
    subject: 'general',
    topic: 'general_knowledge',
    difficulty: 'easy',
    tags: ['calendar', 'time'],
  },
  {
    question: 'If 3 apples cost ₹30, how much do 5 apples cost?',
    type: 'short_answer',
    options: [],
    correctAnswer: '50',
    points: 2,
    explanation: 'Cost per apple = 30/3 = ₹10. Cost of 5 apples = 5 × 10 = ₹50',
    subject: 'general',
    topic: 'aptitude',
    difficulty: 'easy',
    tags: ['unitary method', 'arithmetic'],
  },
]

// ==================== GENERATE QUESTIONS ====================

function generateQuestionId(index: number): string {
  return `QBQ${String(index).padStart(5, '0')}`
}

function generateBankQuestion(
  template: Omit<BankQuestion, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'usageCount' | 'status'>,
  index: number
): BankQuestion {
  const createdDate = faker.date.past({ years: 1 })
  return {
    ...template,
    id: generateQuestionId(index),
    status: faker.helpers.arrayElement(['active', 'active', 'active', 'draft'] as const),
    usageCount: faker.number.int({ min: 0, max: 50 }),
    createdBy: faker.helpers.arrayElement(['TCH001', 'TCH002', 'TCH003', 'ADMIN01']),
    createdAt: createdDate.toISOString(),
    updatedAt: faker.date.between({ from: createdDate, to: new Date() }).toISOString(),
  }
}

// Combine all questions
const allQuestionTemplates = [
  ...mathQuestions,
  ...scienceQuestions,
  ...englishQuestions,
  ...generalQuestions,
]

export const bankQuestions: BankQuestion[] = allQuestionTemplates.map((q, i) =>
  generateBankQuestion(q, i + 1)
)

// Add more generated questions for variety
function generateRandomQuestion(index: number): BankQuestion {
  const subjects: CourseCategory[] = ['mathematics', 'science', 'english', 'general']
  const subject = faker.helpers.arrayElement(subjects)
  const type: QuizQuestionType = faker.helpers.arrayElement(['mcq', 'true_false', 'short_answer'])
  const difficulty: QuestionDifficulty = faker.helpers.arrayElement(['easy', 'medium', 'hard'])

  const topicsBySubject: Record<string, string[]> = {
    mathematics: ['algebra', 'geometry', 'arithmetic', 'statistics'],
    science: ['physics', 'chemistry', 'biology'],
    english: ['grammar', 'vocabulary', 'literature'],
    general: ['general_knowledge', 'aptitude', 'reasoning'],
  }

  const topic = faker.helpers.arrayElement(topicsBySubject[subject])

  let options: string[] = []
  let correctAnswer = ''

  if (type === 'mcq') {
    options = [
      faker.lorem.words(2),
      faker.lorem.words(2),
      faker.lorem.words(2),
      faker.lorem.words(2),
    ]
    correctAnswer = options[0]
  } else if (type === 'true_false') {
    options = ['True', 'False']
    correctAnswer = faker.helpers.arrayElement(options)
  } else {
    correctAnswer = faker.lorem.word()
  }

  const createdDate = faker.date.past({ years: 1 })

  return {
    id: generateQuestionId(index),
    question: faker.lorem.sentence().replace('.', '?'),
    type,
    options,
    correctAnswer,
    points: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
    explanation: faker.lorem.sentence(),
    subject,
    topic,
    difficulty,
    tags: faker.helpers.arrayElements(['important', 'exam', 'practice', 'review'], { min: 0, max: 2 }),
    status: 'active',
    usageCount: faker.number.int({ min: 0, max: 30 }),
    createdBy: faker.helpers.arrayElement(['TCH001', 'TCH002', 'TCH003']),
    createdAt: createdDate.toISOString(),
    updatedAt: faker.date.between({ from: createdDate, to: new Date() }).toISOString(),
  }
}

// Add 40 more random questions for a total of ~75
for (let i = bankQuestions.length + 1; i <= 75; i++) {
  bankQuestions.push(generateRandomQuestion(i))
}

// ==================== ONLINE EXAMS ====================

export const onlineExams: OnlineExamConfig[] = [
  {
    id: 'OEXM001',
    title: 'Mathematics Unit Test - Chapter 1-3',
    description: 'Online assessment covering algebra basics, linear equations, and polynomials',
    questionIds: bankQuestions
      .filter((q) => q.subject === 'mathematics')
      .slice(0, 10)
      .map((q) => q.id),
    duration: 30,
    passingScore: 40,
    maxAttempts: 2,
    negativeMarkingEnabled: false,
    schedule: {
      startTime: faker.date.soon({ days: 1 }).toISOString(),
      endTime: faker.date.soon({ days: 2 }).toISOString(),
    },
    isScheduled: true,
    security: {
      shuffleQuestions: true,
      shuffleOptions: true,
      preventCopyPaste: true,
      preventRightClick: true,
      detectTabSwitch: true,
      maxTabSwitches: 3,
      fullScreenRequired: false,
      showRemainingTime: true,
      autoSubmitOnTimeUp: true,
    },
    linkedExamId: 'EXM001',
    status: 'scheduled',
    createdBy: 'TCH001',
    createdAt: faker.date.past({ years: 0.5 }).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'OEXM002',
    title: 'Science Practice Test',
    description: 'Practice test covering physics, chemistry, and biology fundamentals',
    questionIds: bankQuestions
      .filter((q) => q.subject === 'science')
      .slice(0, 8)
      .map((q) => q.id),
    duration: 20,
    passingScore: 35,
    maxAttempts: 5,
    negativeMarkingEnabled: false,
    isScheduled: false,
    security: {
      shuffleQuestions: true,
      shuffleOptions: true,
      preventCopyPaste: false,
      preventRightClick: false,
      detectTabSwitch: false,
      fullScreenRequired: false,
      showRemainingTime: true,
      autoSubmitOnTimeUp: true,
    },
    status: 'active',
    createdBy: 'TCH002',
    createdAt: faker.date.past({ years: 0.3 }).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'OEXM003',
    title: 'English Grammar Assessment',
    description: 'Formal assessment of grammar and vocabulary skills',
    questionIds: bankQuestions
      .filter((q) => q.subject === 'english')
      .slice(0, 9)
      .map((q) => q.id),
    duration: 25,
    passingScore: 50,
    maxAttempts: 1,
    negativeMarkingEnabled: true,
    schedule: {
      startTime: faker.date.recent({ days: 7 }).toISOString(),
      endTime: faker.date.recent({ days: 6 }).toISOString(),
    },
    isScheduled: true,
    security: {
      shuffleQuestions: true,
      shuffleOptions: true,
      preventCopyPaste: true,
      preventRightClick: true,
      detectTabSwitch: true,
      maxTabSwitches: 2,
      fullScreenRequired: true,
      showRemainingTime: true,
      autoSubmitOnTimeUp: true,
    },
    linkedExamId: 'EXM003',
    status: 'completed',
    createdBy: 'TCH003',
    createdAt: faker.date.past({ years: 0.4 }).toISOString(),
    updatedAt: faker.date.recent({ days: 6 }).toISOString(),
  },
]

// ==================== ONLINE EXAM ATTEMPTS ====================

export const onlineExamAttempts: OnlineExamAttempt[] = [
  {
    id: 'OATT001',
    examId: 'OEXM003',
    examTitle: 'English Grammar Assessment',
    studentId: 'STD001',
    studentName: 'Rahul Sharma',
    startedAt: faker.date.recent({ days: 7 }).toISOString(),
    submittedAt: faker.date.recent({ days: 7 }).toISOString(),
    timeSpent: 1320, // 22 minutes
    score: 14,
    totalPoints: 18,
    percentage: 77.78,
    passed: true,
    answers: [
      { questionId: 'QBQ00021', answer: 'goes', correct: true, pointsEarned: 1 },
      { questionId: 'QBQ00022', answer: 'True', correct: true, pointsEarned: 1 },
      { questionId: 'QBQ00023', answer: 'Exclamatory', correct: true, pointsEarned: 2 },
    ],
    tabSwitchCount: 1,
    securityViolations: [
      { type: 'tab_switch', timestamp: faker.date.recent({ days: 7 }).toISOString() },
    ],
    status: 'submitted',
  },
  {
    id: 'OATT002',
    examId: 'OEXM003',
    examTitle: 'English Grammar Assessment',
    studentId: 'STD002',
    studentName: 'Priya Patel',
    startedAt: faker.date.recent({ days: 7 }).toISOString(),
    submittedAt: faker.date.recent({ days: 7 }).toISOString(),
    timeSpent: 1500, // 25 minutes (full time)
    score: 16,
    totalPoints: 18,
    percentage: 88.89,
    passed: true,
    answers: [],
    tabSwitchCount: 0,
    securityViolations: [],
    status: 'submitted',
  },
  {
    id: 'OATT003',
    examId: 'OEXM002',
    examTitle: 'Science Practice Test',
    studentId: 'STD001',
    studentName: 'Rahul Sharma',
    startedAt: faker.date.recent({ days: 3 }).toISOString(),
    submittedAt: faker.date.recent({ days: 3 }).toISOString(),
    timeSpent: 900,
    score: 10,
    totalPoints: 14,
    percentage: 71.43,
    passed: true,
    answers: [],
    tabSwitchCount: 0,
    securityViolations: [],
    status: 'submitted',
  },
]

// ==================== STATS ====================

export function getQuestionBankStats(): QuestionBankStats {
  const bySubject: Record<CourseCategory, number> = {
    mathematics: 0,
    science: 0,
    english: 0,
    social_studies: 0,
    computer_science: 0,
    arts: 0,
    physical_education: 0,
    languages: 0,
    general: 0,
  }

  const byDifficulty: Record<QuestionDifficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
  }

  const byType: Record<QuizQuestionType, number> = {
    mcq: 0,
    true_false: 0,
    short_answer: 0,
  }

  const topicCounts: Record<string, number> = {}
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  let recentlyAdded = 0

  bankQuestions.forEach((q) => {
    bySubject[q.subject]++
    byDifficulty[q.difficulty]++
    byType[q.type]++
    topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1

    if (new Date(q.createdAt) > sevenDaysAgo) {
      recentlyAdded++
    }
  })

  const mostUsedTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalQuestions: bankQuestions.length,
    bySubject,
    byDifficulty,
    byType,
    recentlyAdded,
    mostUsedTopics,
  }
}
