import { faker } from '@faker-js/faker'
import type {
  Course,
  CourseModule,
  Lesson,
  LiveClass,
  Enrollment,
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  Instructor,
  LmsStats,
  InstructorStats,
  StudentLmsStats,
  CourseCategory,
  CourseLevel,
  CourseStatus,
  LessonType,
  VideoProvider,
  LiveClassStatus,
  EnrollmentStatus,
  SubmissionStatus,
  QuizQuestionType,
  Certificate,
  CertificateTemplate,
  CertificateType,
} from '@/features/lms/types/lms.types'

// ==================== CONSTANTS ====================

const STUDENT_NAMES = [
  'Aarav Sharma',
  'Priya Patel',
  'Rohit Kumar',
  'Ananya Singh',
  'Vihaan Gupta',
  'Ishita Reddy',
  'Arjun Nair',
  'Diya Mehta',
  'Kabir Joshi',
  'Saanvi Iyer',
  'Aditya Verma',
  'Meera Rao',
  'Reyansh Kapoor',
  'Tara Deshmukh',
  'Vivaan Malhotra',
  'Zara Khan',
  'Om Pandey',
  'Aisha Bhat',
  'Krishna Pillai',
  'Navya Choudhury',
]

const STUDENT_IDS = STUDENT_NAMES.map((_, i) => `STU${String(i + 1).padStart(4, '0')}`)

// ==================== INSTRUCTORS ====================

const INSTRUCTOR_DATA: { name: string; email: string; bio: string; expertise: string[] }[] = [
  {
    name: 'Dr. Ramesh Krishnamurthy',
    email: 'ramesh.k@paperbook.edu',
    bio: 'Ph.D. in Mathematics from IIT Bombay with 18 years of teaching experience. Specializes in CBSE and JEE curriculum with a focus on making complex concepts accessible through visual learning.',
    expertise: ['Calculus', 'Algebra', 'JEE Mathematics', 'CBSE Mathematics'],
  },
  {
    name: 'Prof. Sunita Venkataraman',
    email: 'sunita.v@paperbook.edu',
    bio: 'M.Sc. Physics from IISc Bangalore. Former ISRO scientist turned educator with 15 years of experience in teaching physics for competitive exams. Published 3 textbooks on modern physics.',
    expertise: ['Classical Mechanics', 'Electrodynamics', 'JEE Physics', 'NEET Physics'],
  },
  {
    name: 'Dr. Anil Bhattacharya',
    email: 'anil.b@paperbook.edu',
    bio: 'Ph.D. in Organic Chemistry from Delhi University. 12 years of teaching experience for CBSE and NEET preparation. Known for innovative lab demonstrations and molecular visualization techniques.',
    expertise: ['Organic Chemistry', 'Inorganic Chemistry', 'NEET Chemistry', 'CBSE Chemistry'],
  },
  {
    name: 'Meenakshi Iyer',
    email: 'meenakshi.i@paperbook.edu',
    bio: 'M.A. English Literature from JNU. Award-winning educator with 10 years of experience in creative writing and English language instruction. Cambridge TKT certified.',
    expertise: ['English Literature', 'Creative Writing', 'Grammar', 'CBSE English'],
  },
  {
    name: 'Dr. Suresh Narayanan',
    email: 'suresh.n@paperbook.edu',
    bio: 'Ph.D. in Computer Science from IIT Delhi. Former software architect at Infosys. 8 years of teaching experience focused on practical programming and computational thinking.',
    expertise: ['Python', 'Java', 'Data Structures', 'Web Development', 'Computer Science'],
  },
  {
    name: 'Kavitha Raghavan',
    email: 'kavitha.r@paperbook.edu',
    bio: 'M.Sc. Biology from Madras University. 14 years of experience teaching biology for CBSE and NEET. Expert in genetics, ecology, and human physiology with a passion for field-based learning.',
    expertise: ['Biology', 'Genetics', 'NEET Biology', 'Ecology'],
  },
  {
    name: 'Rajesh Tiwari',
    email: 'rajesh.t@paperbook.edu',
    bio: 'M.A. History and Political Science from Allahabad University. 16 years of experience in CBSE Social Studies. Published author on Indian history for young learners.',
    expertise: ['History', 'Political Science', 'Geography', 'CBSE Social Studies'],
  },
  {
    name: 'Deepa Kulkarni',
    email: 'deepa.k@paperbook.edu',
    bio: 'B.F.A. from Sir J.J. School of Art, Mumbai. 9 years of experience in art education. Specializes in Indian classical art forms, digital art, and creative expression for school students.',
    expertise: ['Drawing', 'Painting', 'Digital Art', 'Art History', 'Crafts'],
  },
]

export const instructors: Instructor[] = INSTRUCTOR_DATA.map((data, index) => ({
  id: `INST${String(index + 1).padStart(4, '0')}`,
  name: data.name,
  email: data.email,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(/\s+/g, '')}`,
  bio: data.bio,
  expertise: data.expertise,
  coursesCount: 0, // will be computed after courses are created
  rating: parseFloat((faker.number.float({ min: 3.8, max: 4.9 }) ).toFixed(1)),
}))

// ==================== COURSES ====================

interface CourseTemplate {
  title: string
  description: string
  category: CourseCategory
  level: CourseLevel
  instructorIndex: number
  price: number
  duration: number
  tags: string[]
  status: CourseStatus
}

const COURSE_TEMPLATES: CourseTemplate[] = [
  {
    title: 'CBSE Mathematics Class 10 - Complete Course',
    description: 'Comprehensive coverage of the entire CBSE Class 10 Mathematics syllabus including Real Numbers, Polynomials, Coordinate Geometry, Trigonometry, Statistics, and Probability. Includes solved examples, practice problems, and previous year question papers.',
    category: 'mathematics',
    level: 'intermediate',
    instructorIndex: 0,
    price: 2999,
    duration: 45,
    tags: ['CBSE', 'Class 10', 'Board Exam', 'Mathematics'],
    status: 'published',
  },
  {
    title: 'JEE Main Mathematics - Calculus Masterclass',
    description: 'In-depth calculus course designed for JEE Main preparation. Covers Limits, Continuity, Differentiability, Application of Derivatives, Definite and Indefinite Integrals, and Differential Equations with extensive problem-solving sessions.',
    category: 'mathematics',
    level: 'advanced',
    instructorIndex: 0,
    price: 4999,
    duration: 60,
    tags: ['JEE Main', 'Calculus', 'Competitive Exam'],
    status: 'published',
  },
  {
    title: 'JEE Advanced Physics - Mechanics & Waves',
    description: 'Advanced physics course covering Kinematics, Newton\'s Laws, Work-Energy Theorem, Rotational Mechanics, Fluid Dynamics, and Wave Motion. Problem-solving approach with 500+ practice questions aligned with JEE Advanced pattern.',
    category: 'science',
    level: 'advanced',
    instructorIndex: 1,
    price: 4499,
    duration: 55,
    tags: ['JEE Advanced', 'Physics', 'Mechanics', 'Waves'],
    status: 'published',
  },
  {
    title: 'CBSE Physics Class 12 - Board Preparation',
    description: 'Complete Class 12 Physics preparation covering Electrostatics, Current Electricity, Magnetism, Optics, Modern Physics, and Semiconductor Electronics. Includes NCERT solutions and previous year board paper analysis.',
    category: 'science',
    level: 'intermediate',
    instructorIndex: 1,
    price: 2499,
    duration: 40,
    tags: ['CBSE', 'Class 12', 'Board Exam', 'Physics'],
    status: 'published',
  },
  {
    title: 'NEET Biology - Human Physiology',
    description: 'Focused course on Human Physiology for NEET preparation covering Digestion, Breathing, Body Fluids, Excretion, Locomotion, Neural Control, and Chemical Coordination. NCERT-based with NEET-level MCQs.',
    category: 'science',
    level: 'advanced',
    instructorIndex: 5,
    price: 3499,
    duration: 35,
    tags: ['NEET', 'Biology', 'Human Physiology'],
    status: 'published',
  },
  {
    title: 'NEET Chemistry - Organic Chemistry Fundamentals',
    description: 'Master organic chemistry for NEET with this course covering IUPAC nomenclature, reaction mechanisms, hydrocarbons, haloalkanes, alcohols, aldehydes, ketones, and biomolecules. Extensive MCQ practice included.',
    category: 'science',
    level: 'advanced',
    instructorIndex: 2,
    price: 3999,
    duration: 50,
    tags: ['NEET', 'Chemistry', 'Organic Chemistry'],
    status: 'published',
  },
  {
    title: 'English Literature - CBSE Class 10 First Flight & Footprints',
    description: 'Detailed analysis of all chapters from First Flight and Footprints Without Feet textbooks. Includes character analysis, theme exploration, writing skills, grammar exercises, and board exam preparation tips.',
    category: 'english',
    level: 'intermediate',
    instructorIndex: 3,
    price: 1999,
    duration: 30,
    tags: ['CBSE', 'Class 10', 'English Literature', 'Board Exam'],
    status: 'published',
  },
  {
    title: 'Creative Writing Workshop for Students',
    description: 'Learn the art of creative writing including essay composition, story writing, poetry, letter writing, and report writing. Develop a strong voice and improve your expression skills for both academics and beyond.',
    category: 'english',
    level: 'beginner',
    instructorIndex: 3,
    price: 1499,
    duration: 20,
    tags: ['Creative Writing', 'Essay', 'Poetry', 'Language Skills'],
    status: 'published',
  },
  {
    title: 'Python Programming for School Students',
    description: 'Introduction to programming using Python. Covers basics of programming, data types, loops, functions, file handling, and basic data structures. Perfect for CBSE Class 11-12 Computer Science curriculum.',
    category: 'computer_science',
    level: 'beginner',
    instructorIndex: 4,
    price: 2499,
    duration: 35,
    tags: ['Python', 'Programming', 'CBSE', 'Computer Science'],
    status: 'published',
  },
  {
    title: 'Web Development Basics - HTML, CSS & JavaScript',
    description: 'Hands-on course teaching web development fundamentals. Build real projects while learning HTML5, CSS3, and JavaScript. Includes responsive design concepts and a capstone project to build a complete website.',
    category: 'computer_science',
    level: 'beginner',
    instructorIndex: 4,
    price: 1999,
    duration: 25,
    tags: ['Web Development', 'HTML', 'CSS', 'JavaScript'],
    status: 'published',
  },
  {
    title: 'Indian History - Ancient to Modern (CBSE Social Studies)',
    description: 'Comprehensive history course covering Ancient Indian civilizations, Medieval period, Mughal Empire, British colonialism, Freedom struggle, and Post-independence India. Aligned with CBSE Social Studies curriculum.',
    category: 'social_studies',
    level: 'intermediate',
    instructorIndex: 6,
    price: 1799,
    duration: 30,
    tags: ['History', 'CBSE', 'Social Studies', 'Indian History'],
    status: 'published',
  },
  {
    title: 'Art & Craft for Young Learners',
    description: 'Fun and engaging art course for students in Classes 1-5. Learn drawing, painting, origami, clay modeling, and mixed media art. Develop creativity and fine motor skills through guided projects.',
    category: 'arts',
    level: 'beginner',
    instructorIndex: 7,
    price: 999,
    duration: 15,
    tags: ['Art', 'Craft', 'Drawing', 'Creative'],
    status: 'published',
  },
  {
    title: 'CBSE Mathematics Class 12 - Preparation Guide',
    description: 'Upcoming course covering Relations & Functions, Matrices, Determinants, Integrals, Vectors, 3D Geometry, and Linear Programming for CBSE Class 12. Perfect for board exam preparation.',
    category: 'mathematics',
    level: 'advanced',
    instructorIndex: 0,
    price: 3499,
    duration: 50,
    tags: ['CBSE', 'Class 12', 'Mathematics', 'Board Exam'],
    status: 'draft',
  },
  {
    title: 'Introduction to Robotics and IoT',
    description: 'Explore the world of robotics and Internet of Things. Learn about sensors, actuators, Arduino programming, and build simple IoT projects. Great for students interested in STEM.',
    category: 'computer_science',
    level: 'intermediate',
    instructorIndex: 4,
    price: 2999,
    duration: 30,
    tags: ['Robotics', 'IoT', 'Arduino', 'STEM'],
    status: 'draft',
  },
  {
    title: 'CBSE Science Class 9 - Foundation Course',
    description: 'This course was offered in the previous academic year. Covers Matter, Atoms & Molecules, Cell Biology, Motion, Force, Work & Energy, and Natural Resources for Class 9 CBSE students.',
    category: 'science',
    level: 'beginner',
    instructorIndex: 2,
    price: 1999,
    duration: 30,
    tags: ['CBSE', 'Class 9', 'Science', 'Foundation'],
    status: 'archived',
  },
]

export const courses: Course[] = COURSE_TEMPLATES.map((template, index) => {
  const instructor = instructors[template.instructorIndex]
  const courseId = `CRS${String(index + 1).padStart(4, '0')}`
  const enrollCount = template.status === 'published'
    ? faker.number.int({ min: 15, max: 80 })
    : template.status === 'archived'
      ? faker.number.int({ min: 30, max: 60 })
      : 0

  return {
    id: courseId,
    title: template.title,
    description: template.description,
    thumbnail: `https://api.dicebear.com/7.x/shapes/svg?seed=${courseId}`,
    category: template.category,
    level: template.level,
    instructorId: instructor.id,
    instructorName: instructor.name,
    price: template.price,
    status: template.status,
    duration: template.duration,
    enrollmentCount: enrollCount,
    rating: template.status === 'published'
      ? parseFloat(faker.number.float({ min: 3.5, max: 4.9 }).toFixed(1))
      : 0,
    tags: template.tags,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  }
})

// Update instructor course counts
instructors.forEach((inst) => {
  inst.coursesCount = courses.filter(
    (c) => c.instructorId === inst.id && c.status !== 'draft'
  ).length
})

// ==================== MODULES ====================

interface ModuleTemplate {
  title: string
  description: string
  duration: number
}

const COURSE_MODULE_TEMPLATES: Record<string, ModuleTemplate[]> = {
  CRS0001: [
    { title: 'Real Numbers', description: 'Euclid\'s Division Lemma, Fundamental Theorem of Arithmetic, Irrational Numbers, Rational Numbers', duration: 180 },
    { title: 'Polynomials', description: 'Zeros of a Polynomial, Relationship between Zeros and Coefficients, Division Algorithm', duration: 150 },
    { title: 'Pair of Linear Equations in Two Variables', description: 'Graphical Method, Substitution Method, Elimination Method, Cross-Multiplication Method', duration: 200 },
    { title: 'Quadratic Equations', description: 'Standard Form, Factorisation Method, Completing the Square, Quadratic Formula, Nature of Roots', duration: 180 },
    { title: 'Trigonometry', description: 'Trigonometric Ratios, Trigonometric Identities, Heights and Distances', duration: 220 },
  ],
  CRS0002: [
    { title: 'Limits and Continuity', description: 'Concept of Limits, Limit Theorems, Continuity, Types of Discontinuity', duration: 240 },
    { title: 'Differentiation', description: 'First Principles, Chain Rule, Product & Quotient Rule, Implicit Differentiation, Parametric Differentiation', duration: 300 },
    { title: 'Application of Derivatives', description: 'Rate of Change, Increasing/Decreasing Functions, Maxima & Minima, Tangents & Normals', duration: 250 },
    { title: 'Indefinite Integrals', description: 'Integration as Inverse of Differentiation, Methods of Integration, Partial Fractions, Integration by Parts', duration: 280 },
    { title: 'Definite Integrals & Differential Equations', description: 'Properties of Definite Integrals, Area Under Curves, Order and Degree of DEs, Solution Methods', duration: 300 },
  ],
  CRS0003: [
    { title: 'Kinematics', description: 'Motion in 1D and 2D, Projectile Motion, Relative Motion, Circular Motion', duration: 200 },
    { title: 'Newton\'s Laws of Motion', description: 'First Law, Second Law, Third Law, Free Body Diagrams, Friction, Pseudo Forces', duration: 220 },
    { title: 'Work, Energy and Power', description: 'Work-Energy Theorem, Conservative Forces, Potential Energy, Collisions', duration: 180 },
    { title: 'Rotational Mechanics', description: 'Moment of Inertia, Torque, Angular Momentum, Rolling Motion, Equilibrium', duration: 250 },
    { title: 'Wave Motion', description: 'Transverse and Longitudinal Waves, Superposition, Standing Waves, Doppler Effect, Sound Waves', duration: 200 },
  ],
  CRS0004: [
    { title: 'Electrostatics', description: 'Coulomb\'s Law, Electric Field, Electric Potential, Capacitance, Gauss\'s Law', duration: 200 },
    { title: 'Current Electricity', description: 'Ohm\'s Law, Kirchhoff\'s Laws, Wheatstone Bridge, Meter Bridge, Potentiometer', duration: 180 },
    { title: 'Magnetic Effects of Current', description: 'Biot-Savart Law, Ampere\'s Law, Force on Moving Charge, Solenoid, Toroid', duration: 190 },
    { title: 'Optics', description: 'Reflection, Refraction, Lens Maker\'s Formula, Wave Optics, Interference, Diffraction', duration: 220 },
  ],
  CRS0005: [
    { title: 'Digestion and Absorption', description: 'Alimentary Canal, Digestive Glands, Digestion Process, Absorption of Nutrients, Disorders', duration: 150 },
    { title: 'Breathing and Exchange of Gases', description: 'Respiratory Organs, Mechanism of Breathing, Gas Exchange, Transport of Gases, Respiratory Disorders', duration: 140 },
    { title: 'Body Fluids and Circulation', description: 'Blood Composition, Blood Groups, Coagulation, Heart, Cardiac Cycle, ECG, Blood Disorders', duration: 180 },
    { title: 'Excretory Products and Their Elimination', description: 'Kidney Structure, Urine Formation, Osmoregulation, Dialysis, Kidney Disorders', duration: 150 },
    { title: 'Neural Control and Coordination', description: 'Nervous System, Neuron Structure, Synaptic Transmission, Brain, Reflex Arc, Sense Organs', duration: 170 },
  ],
  CRS0006: [
    { title: 'IUPAC Nomenclature & Basics', description: 'Naming Conventions, Functional Groups, Isomerism, Electronic Effects, Reaction Mechanisms Intro', duration: 200 },
    { title: 'Hydrocarbons', description: 'Alkanes, Alkenes, Alkynes, Aromatic Hydrocarbons, Electrophilic Substitution Reactions', duration: 220 },
    { title: 'Haloalkanes and Haloarenes', description: 'Preparation, Properties, SN1 and SN2 Reactions, Elimination Reactions, Polyhalogen Compounds', duration: 180 },
    { title: 'Alcohols, Phenols and Ethers', description: 'Preparation, Properties, Reactions, Acidity Comparison, Industrial Applications', duration: 190 },
    { title: 'Aldehydes, Ketones and Carboxylic Acids', description: 'Nucleophilic Addition, Oxidation, Reduction, Hell-Volhard-Zelinsky Reaction, Named Reactions', duration: 210 },
  ],
  CRS0007: [
    { title: 'First Flight - Prose', description: 'A Letter to God, Nelson Mandela, Two Stories about Flying, From the Diary of Anne Frank, Glimpses of India', duration: 180 },
    { title: 'First Flight - Poetry', description: 'Dust of Snow, Fire and Ice, A Tiger in the Zoo, Amanda, Animals, The Ball Poem', duration: 120 },
    { title: 'Footprints Without Feet', description: 'A Triumph of Surgery, The Thief\'s Story, The Midnight Visitor, A Question of Trust, Footprints Without Feet', duration: 150 },
    { title: 'Writing Skills', description: 'Letter Writing, Article Writing, Story Writing, Analytical Paragraph, Descriptive Writing', duration: 100 },
  ],
  CRS0008: [
    { title: 'Foundations of Creative Writing', description: 'Finding Your Voice, Observation Skills, Journal Writing, Free Writing Exercises', duration: 90 },
    { title: 'Story Writing', description: 'Plot Structure, Character Development, Setting, Dialogue, Conflict and Resolution', duration: 120 },
    { title: 'Poetry and Expression', description: 'Forms of Poetry, Rhyme and Rhythm, Imagery, Metaphor, Writing Your Own Poems', duration: 100 },
  ],
  CRS0009: [
    { title: 'Python Basics', description: 'Installation, Variables, Data Types, Operators, Input/Output, Type Conversion', duration: 150 },
    { title: 'Control Flow & Functions', description: 'If-Else, Loops, Break/Continue, Functions, Arguments, Return Values, Scope', duration: 180 },
    { title: 'Data Structures', description: 'Lists, Tuples, Dictionaries, Sets, String Operations, List Comprehensions', duration: 200 },
    { title: 'File Handling & Libraries', description: 'File Read/Write, CSV Files, Exception Handling, Introduction to NumPy and Matplotlib', duration: 160 },
  ],
  CRS0010: [
    { title: 'HTML5 Fundamentals', description: 'HTML Structure, Tags, Forms, Tables, Semantic Elements, Multimedia', duration: 120 },
    { title: 'CSS3 Styling', description: 'Selectors, Box Model, Flexbox, Grid, Animations, Responsive Design, Media Queries', duration: 150 },
    { title: 'JavaScript Essentials', description: 'Variables, Functions, DOM Manipulation, Events, Fetch API, Local Storage', duration: 180 },
  ],
  CRS0011: [
    { title: 'Ancient India', description: 'Indus Valley Civilization, Vedic Period, Mauryan Empire, Gupta Dynasty, Art and Architecture', duration: 150 },
    { title: 'Medieval India', description: 'Delhi Sultanate, Mughal Empire, Bhakti and Sufi Movements, Vijayanagara Empire, Maratha Empire', duration: 180 },
    { title: 'Modern India', description: 'British East India Company, 1857 Revolt, Freedom Movement, Partition, Post-Independence India', duration: 200 },
    { title: 'Indian Constitution and Governance', description: 'Making of the Constitution, Fundamental Rights, Directive Principles, Parliament, Judiciary', duration: 140 },
  ],
  CRS0012: [
    { title: 'Drawing Fundamentals', description: 'Lines, Shapes, Shading, Perspective, Proportions, Still Life Drawing', duration: 90 },
    { title: 'Colors and Painting', description: 'Color Theory, Watercolors, Poster Colors, Landscape Painting, Abstract Art', duration: 100 },
    { title: 'Craft Projects', description: 'Paper Crafts, Origami, Clay Modeling, Recycled Art, Festive Decorations', duration: 80 },
  ],
}

let moduleIdCounter = 1

export const modules: CourseModule[] = []

// Generate modules for published and archived courses
courses.forEach((course) => {
  if (course.status === 'draft') return

  const templates = COURSE_MODULE_TEMPLATES[course.id]
  if (!templates) return

  templates.forEach((template, order) => {
    modules.push({
      id: `MOD${String(moduleIdCounter++).padStart(4, '0')}`,
      courseId: course.id,
      title: template.title,
      description: template.description,
      order: order + 1,
      duration: template.duration,
    })
  })
})

// ==================== LESSONS ====================

const VIDEO_URLS_YOUTUBE = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=HnWJFRnGE40',
  'https://www.youtube.com/watch?v=rfscVS0vtbw',
  'https://www.youtube.com/watch?v=kqtD5dpn9C8',
  'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
  'https://www.youtube.com/watch?v=pTB0EiLXUC8',
  'https://www.youtube.com/watch?v=eIrMbAQSU34',
  'https://www.youtube.com/watch?v=8jLOx1hD3_o',
]

const VIDEO_URLS_VIMEO = [
  'https://vimeo.com/148751763',
  'https://vimeo.com/347119375',
  'https://vimeo.com/293926801',
  'https://vimeo.com/539479839',
  'https://vimeo.com/194276412',
]

const DOCUMENT_URLS = [
  '/uploads/lms/notes/chapter-notes.pdf',
  '/uploads/lms/notes/formula-sheet.pdf',
  '/uploads/lms/notes/practice-problems.pdf',
  '/uploads/lms/notes/summary-guide.pdf',
  '/uploads/lms/notes/reference-material.pdf',
  '/uploads/lms/notes/worksheet.pdf',
]

function generateLessonTitle(moduleTitle: string, type: LessonType, order: number): string {
  switch (type) {
    case 'video':
      return `${moduleTitle} - Video Lecture ${order}`
    case 'document':
      return `${moduleTitle} - Study Notes ${order}`
    case 'quiz':
      return `${moduleTitle} - Practice Quiz`
    case 'assignment':
      return `${moduleTitle} - Assignment`
    case 'live_class':
      return `${moduleTitle} - Live Doubt Session`
  }
}

function getLessonContentUrl(type: LessonType): { url: string; provider?: VideoProvider } {
  switch (type) {
    case 'video': {
      const isYouTube = faker.datatype.boolean(0.7)
      return {
        url: isYouTube
          ? faker.helpers.arrayElement(VIDEO_URLS_YOUTUBE)
          : faker.helpers.arrayElement(VIDEO_URLS_VIMEO),
        provider: isYouTube ? 'youtube' : 'vimeo',
      }
    }
    case 'document':
      return { url: faker.helpers.arrayElement(DOCUMENT_URLS) }
    case 'live_class':
      return { url: `https://meet.paperbook.edu/${faker.string.alphanumeric(10)}` }
    case 'quiz':
      return { url: '' }
    case 'assignment':
      return { url: '' }
  }
}

function getLessonDuration(type: LessonType): number {
  switch (type) {
    case 'video':
      return faker.number.int({ min: 15, max: 45 })
    case 'document':
      return faker.number.int({ min: 10, max: 20 })
    case 'quiz':
      return faker.number.int({ min: 15, max: 30 })
    case 'assignment':
      return faker.number.int({ min: 30, max: 60 })
    case 'live_class':
      return faker.number.int({ min: 45, max: 90 })
  }
}

let lessonIdCounter = 1

export const lessons: Lesson[] = []

modules.forEach((module) => {
  const lessonCount = faker.number.int({ min: 3, max: 8 })

  // Ensure a good mix: first lesson is always a video, include at least one document
  const lessonTypes: LessonType[] = ['video']
  for (let i = 1; i < lessonCount; i++) {
    if (i === 1) {
      lessonTypes.push('video')
    } else if (i === lessonCount - 1) {
      // Last lesson is often a quiz or assignment
      lessonTypes.push(faker.helpers.arrayElement(['quiz', 'assignment']))
    } else {
      lessonTypes.push(
        faker.helpers.weightedArrayElement([
          { value: 'video' as LessonType, weight: 40 },
          { value: 'document' as LessonType, weight: 25 },
          { value: 'quiz' as LessonType, weight: 15 },
          { value: 'assignment' as LessonType, weight: 10 },
          { value: 'live_class' as LessonType, weight: 10 },
        ])
      )
    }
  }

  lessonTypes.forEach((type, order) => {
    const content = getLessonContentUrl(type)
    lessons.push({
      id: `LES${String(lessonIdCounter++).padStart(4, '0')}`,
      moduleId: module.id,
      courseId: module.courseId,
      title: generateLessonTitle(module.title, type, order + 1),
      type,
      order: order + 1,
      duration: getLessonDuration(type),
      contentUrl: content.url,
      videoProvider: content.provider,
      isFree: order === 0 && faker.datatype.boolean(0.4), // First lessons sometimes free
    })
  })
})

// ==================== LIVE CLASSES ====================

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

function createLiveClass(index: number): LiveClass {
  const publishedCourses = courses.filter((c) => c.status === 'published')
  const course = faker.helpers.arrayElement(publishedCourses)
  const instructor = instructors.find((i) => i.id === course.instructorId)!

  let status: LiveClassStatus
  let scheduledAt: Date
  let attendanceCount: number
  let recordingUrl: string | undefined

  if (index < 4) {
    // Today's classes
    status = faker.helpers.arrayElement(['scheduled', 'scheduled', 'completed'] as LiveClassStatus[])
    const hour = faker.number.int({ min: 8, max: 17 })
    scheduledAt = new Date(today)
    scheduledAt.setHours(hour, faker.helpers.arrayElement([0, 30]), 0)
    attendanceCount = status === 'completed' ? faker.number.int({ min: 10, max: 45 }) : 0
    recordingUrl = status === 'completed' ? `https://recordings.paperbook.edu/rec-${faker.string.alphanumeric(8)}` : undefined
  } else if (index < 12) {
    // Completed past classes
    status = 'completed'
    scheduledAt = faker.date.recent({ days: 14 })
    attendanceCount = faker.number.int({ min: 15, max: 50 })
    recordingUrl = `https://recordings.paperbook.edu/rec-${faker.string.alphanumeric(8)}`
  } else if (index < 17) {
    // Upcoming scheduled classes
    status = 'scheduled'
    scheduledAt = faker.date.soon({ days: 14 })
    attendanceCount = 0
    recordingUrl = undefined
  } else {
    // Cancelled classes
    status = 'cancelled'
    scheduledAt = faker.date.recent({ days: 7 })
    attendanceCount = 0
    recordingUrl = undefined
  }

  const meetingId = faker.string.numeric(10)

  return {
    id: `LC${String(index + 1).padStart(4, '0')}`,
    courseId: course.id,
    courseName: course.title,
    title: `${faker.helpers.arrayElement(['Doubt Clearing Session', 'Revision Class', 'Problem Solving Session', 'Concept Discussion', 'Interactive Lecture', 'Q&A Session'])} - ${course.title.split(' - ')[0]}`,
    instructorId: instructor.id,
    instructorName: instructor.name,
    scheduledAt: scheduledAt.toISOString(),
    duration: faker.helpers.arrayElement([30, 45, 60, 90]),
    meetingLink: `https://meet.paperbook.edu/${faker.string.alphanumeric(12)}`,
    meetingId,
    meetingPassword: faker.string.alphanumeric(6),
    status,
    attendanceCount,
    recordingUrl,
  }
}

export const liveClasses: LiveClass[] = Array.from({ length: 20 }, (_, i) => createLiveClass(i))

// ==================== ENROLLMENTS ====================

function createEnrollment(index: number): Enrollment {
  const publishedCourses = courses.filter((c) => c.status === 'published' || c.status === 'archived')
  const course = faker.helpers.arrayElement(publishedCourses)
  const studentIndex = index % STUDENT_NAMES.length
  const studentName = STUDENT_NAMES[studentIndex]
  const studentId = STUDENT_IDS[studentIndex]

  const courseLessons = lessons.filter((l) => l.courseId === course.id)
  const totalLessons = courseLessons.length

  let status: EnrollmentStatus
  let progress: number
  let lessonsCompleted: number

  if (index < 35) {
    // Active enrollments
    status = 'active'
    progress = faker.number.int({ min: 5, max: 90 })
    lessonsCompleted = Math.round((progress / 100) * totalLessons)
  } else if (index < 50) {
    // Completed enrollments
    status = 'completed'
    progress = 100
    lessonsCompleted = totalLessons
  } else {
    // Dropped enrollments
    status = 'dropped'
    progress = faker.number.int({ min: 2, max: 30 })
    lessonsCompleted = Math.round((progress / 100) * totalLessons)
  }

  return {
    id: `ENR${String(index + 1).padStart(4, '0')}`,
    courseId: course.id,
    courseName: course.title,
    studentId,
    studentName,
    enrolledAt: faker.date.past({ years: 1 }).toISOString(),
    status,
    progress,
    lessonsCompleted,
    totalLessons: totalLessons || faker.number.int({ min: 15, max: 30 }),
  }
}

export const enrollments: Enrollment[] = Array.from({ length: 60 }, (_, i) => createEnrollment(i))

// ==================== ASSIGNMENTS ====================

function createAssignment(index: number): Assignment {
  const assignmentLessons = lessons.filter((l) => l.type === 'assignment')
  const lesson = index < assignmentLessons.length
    ? assignmentLessons[index]
    : faker.helpers.arrayElement(assignmentLessons)
  const course = courses.find((c) => c.id === lesson.courseId)!

  const isPastDue = index < 7
  const dueDate = isPastDue
    ? faker.date.recent({ days: 14 })
    : faker.date.soon({ days: 21 })

  return {
    id: `ASG${String(index + 1).padStart(4, '0')}`,
    lessonId: lesson.id,
    courseId: course.id,
    courseName: course.title,
    title: faker.helpers.arrayElement([
      `${course.title.split(' - ')[0]} - Practice Problems Set ${index + 1}`,
      `${lesson.title.replace(' - Assignment', '')} Worksheet`,
      `Homework: ${lesson.title.replace(' - Assignment', '')}`,
      `Assignment ${index + 1}: ${course.category.replace('_', ' ')} Problems`,
    ]),
    instructions: faker.helpers.arrayElement([
      'Solve all the problems. Show complete working for each question. Upload your solutions as a PDF.',
      'Answer all questions with proper explanations. Diagrams should be neat and labeled. Submit before the deadline.',
      'Complete the given worksheet. Reference material is provided in the study notes. Partial credit will be given for working.',
      'This assignment tests your understanding of the concepts covered in this module. Answer all questions in detail.',
      'Attempt all questions. For numerical problems, show step-by-step solutions. For theory questions, provide concise but complete answers.',
    ]),
    maxScore: faker.helpers.arrayElement([25, 50, 100]),
    dueDate: dueDate.toISOString(),
    submissionCount: isPastDue ? faker.number.int({ min: 5, max: 20 }) : faker.number.int({ min: 0, max: 10 }),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  }
}

export const assignments: Assignment[] = Array.from({ length: 15 }, (_, i) => createAssignment(i))

// ==================== SUBMISSIONS ====================

function createSubmission(index: number): AssignmentSubmission {
  const assignment = assignments[index % assignments.length]
  const studentIndex = index % STUDENT_NAMES.length

  const isGraded = index < 15
  const isSubmitted = index < 25

  let status: SubmissionStatus
  let score: number | null
  let feedback: string

  if (isGraded) {
    status = 'graded'
    score = faker.number.int({ min: Math.floor(assignment.maxScore * 0.3), max: assignment.maxScore })
    feedback = faker.helpers.arrayElement([
      'Good work! Your understanding of the concepts is clear. Minor errors in calculations.',
      'Excellent effort. All working is shown clearly. Well done!',
      'Average performance. Please revise the concepts from the video lectures.',
      'Need improvement. Please review the study material and try the practice problems again.',
      'Very good attempt. A few conceptual errors but overall a solid submission.',
      'Outstanding work! Perfect understanding of all concepts. Keep it up!',
      'Satisfactory. You need to focus more on the application-based questions.',
    ])
  } else if (isSubmitted) {
    status = 'submitted'
    score = null
    feedback = ''
  } else {
    status = 'not_submitted'
    score = null
    feedback = ''
  }

  return {
    id: `SUB${String(index + 1).padStart(4, '0')}`,
    assignmentId: assignment.id,
    studentId: STUDENT_IDS[studentIndex],
    studentName: STUDENT_NAMES[studentIndex],
    submittedAt: status !== 'not_submitted'
      ? faker.date.recent({ days: 7 }).toISOString()
      : '',
    submissionText: status !== 'not_submitted'
      ? faker.helpers.arrayElement([
          'Please find my solutions attached. I have solved all the questions with complete working.',
          'Attached is my completed assignment. I had difficulty with question 5 but attempted it.',
          'Here are my answers. I have referenced the class notes for the theory questions.',
          'Submitting my work. I have double-checked all calculations.',
          'My solutions are attached. I used the formulas discussed in the video lecture.',
        ])
      : '',
    attachmentUrl: status !== 'not_submitted'
      ? `/uploads/lms/submissions/${STUDENT_IDS[studentIndex]}/assignment-${assignment.id}.pdf`
      : undefined,
    score,
    feedback,
    status,
  }
}

export const submissions: AssignmentSubmission[] = Array.from({ length: 30 }, (_, i) => createSubmission(i))

// ==================== QUIZZES ====================

function generateMCQQuestion(topic: string, index: number): QuizQuestion {
  const questions: Record<string, { q: string; options: string[]; correct: string; explanation: string }[]> = {
    mathematics: [
      { q: 'What is the HCF of 12 and 18?', options: ['3', '6', '9', '12'], correct: '6', explanation: 'HCF(12, 18) = 6 by prime factorization: 12 = 2x2x3, 18 = 2x3x3, common = 2x3 = 6' },
      { q: 'The derivative of x^3 is:', options: ['x^2', '2x^2', '3x^2', '3x^3'], correct: '3x^2', explanation: 'Using the power rule: d/dx(x^n) = nx^(n-1), so d/dx(x^3) = 3x^2' },
      { q: 'What is the value of sin(90 degrees)?', options: ['0', '0.5', '1', 'undefined'], correct: '1', explanation: 'sin(90) = 1 is a standard trigonometric value' },
      { q: 'The sum of angles in a triangle is:', options: ['90 degrees', '180 degrees', '270 degrees', '360 degrees'], correct: '180 degrees', explanation: 'The angle sum property states that the sum of interior angles of a triangle is always 180 degrees' },
      { q: 'Which of the following is irrational?', options: ['22/7', '0.333...', 'sqrt(2)', '1.5'], correct: 'sqrt(2)', explanation: 'sqrt(2) cannot be expressed as a ratio of two integers, making it irrational' },
      { q: 'The integral of 2x dx is:', options: ['x', 'x^2', 'x^2 + C', '2x^2 + C'], correct: 'x^2 + C', explanation: 'Integration of 2x: integral(2x dx) = 2 * x^2/2 + C = x^2 + C' },
      { q: 'What is the discriminant of 2x^2 + 3x - 5 = 0?', options: ['49', '-31', '9', '25'], correct: '49', explanation: 'D = b^2 - 4ac = 9 - 4(2)(-5) = 9 + 40 = 49' },
      { q: 'log(100) base 10 equals:', options: ['1', '2', '10', '100'], correct: '2', explanation: 'log_10(100) = log_10(10^2) = 2' },
      { q: 'The mean of first 10 natural numbers is:', options: ['5', '5.5', '6', '10'], correct: '5.5', explanation: 'Mean = (1+2+...+10)/10 = 55/10 = 5.5' },
      { q: 'If f(x) = 3x + 2, what is f(4)?', options: ['12', '14', '10', '16'], correct: '14', explanation: 'f(4) = 3(4) + 2 = 12 + 2 = 14' },
    ],
    science: [
      { q: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correct: 'Newton', explanation: 'The SI unit of force is Newton (N), named after Sir Isaac Newton' },
      { q: 'Which organelle is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], correct: 'Mitochondria', explanation: 'Mitochondria produce ATP through cellular respiration, earning them the title "powerhouse of the cell"' },
      { q: 'The chemical formula of water is:', options: ['H2O2', 'HO2', 'H2O', 'OH2'], correct: 'H2O', explanation: 'Water consists of 2 hydrogen atoms and 1 oxygen atom: H2O' },
      { q: 'Acceleration due to gravity on Earth is approximately:', options: ['9.8 m/s^2', '8.9 m/s^2', '10.2 m/s^2', '7.8 m/s^2'], correct: '9.8 m/s^2', explanation: 'The standard value of g on Earth is 9.8 m/s^2' },
      { q: 'The pH of pure water at 25C is:', options: ['0', '5', '7', '14'], correct: '7', explanation: 'Pure water is neutral with a pH of exactly 7 at 25 degrees Celsius' },
      { q: 'Which gas is most abundant in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Argon'], correct: 'Nitrogen', explanation: 'Nitrogen makes up approximately 78% of Earth\'s atmosphere' },
      { q: 'Photosynthesis occurs in:', options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Ribosome'], correct: 'Chloroplast', explanation: 'Chloroplasts contain chlorophyll and are the site of photosynthesis in plant cells' },
      { q: 'What is the atomic number of Carbon?', options: ['4', '6', '8', '12'], correct: '6', explanation: 'Carbon has 6 protons in its nucleus, giving it an atomic number of 6' },
      { q: 'The speed of light in vacuum is approximately:', options: ['3 x 10^6 m/s', '3 x 10^8 m/s', '3 x 10^10 m/s', '3 x 10^12 m/s'], correct: '3 x 10^8 m/s', explanation: 'The speed of light in vacuum is approximately 3 x 10^8 m/s or 300,000 km/s' },
      { q: 'Which vitamin is produced by sunlight?', options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], correct: 'Vitamin D', explanation: 'Vitamin D is synthesized in the skin when exposed to ultraviolet B (UVB) radiation from sunlight' },
    ],
    english: [
      { q: 'Who is the author of "First Flight" poem "Dust of Snow"?', options: ['Robert Frost', 'William Blake', 'John Keats', 'Walt Whitman'], correct: 'Robert Frost', explanation: '"Dust of Snow" is a short poem by American poet Robert Frost' },
      { q: 'A word that has the opposite meaning is called:', options: ['Synonym', 'Antonym', 'Homonym', 'Acronym'], correct: 'Antonym', explanation: 'An antonym is a word that has the opposite meaning of another word' },
      { q: 'The passive voice of "She writes a letter" is:', options: ['A letter is written by her', 'A letter was written by her', 'A letter has been written', 'A letter is being written'], correct: 'A letter is written by her', explanation: 'In passive voice, the object becomes the subject: "A letter is written by her"' },
      { q: 'Which figure of speech is used in "The wind howled"?', options: ['Simile', 'Metaphor', 'Personification', 'Alliteration'], correct: 'Personification', explanation: 'Attributing human qualities (howling) to wind is personification' },
      { q: '"Footprints Without Feet" is about:', options: ['A detective', 'An invisible man', 'A thief', 'A scientist'], correct: 'An invisible man', explanation: 'The story is about Griffin, a scientist who discovers how to make himself invisible' },
      { q: 'Which tense: "I have been studying for 3 hours"?', options: ['Present Perfect', 'Present Perfect Continuous', 'Past Perfect', 'Past Continuous'], correct: 'Present Perfect Continuous', explanation: 'Present Perfect Continuous uses "have/has + been + verb-ing" to show ongoing action from past to present' },
      { q: 'The word "benevolent" means:', options: ['Kind', 'Angry', 'Sad', 'Brave'], correct: 'Kind', explanation: 'Benevolent means well-meaning, kindly, and charitable' },
      { q: 'A sonnet has how many lines?', options: ['10', '12', '14', '16'], correct: '14', explanation: 'A sonnet is a 14-line poem, typically in iambic pentameter' },
    ],
    general: [
      { q: 'What is the capital of India?', options: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'], correct: 'New Delhi', explanation: 'New Delhi is the capital of India and the seat of the central government' },
      { q: 'Who wrote the Indian national anthem?', options: ['Bankim Chandra', 'Rabindranath Tagore', 'Subhash Bose', 'Mahatma Gandhi'], correct: 'Rabindranath Tagore', explanation: 'Jana Gana Mana was composed by Rabindranath Tagore in Bengali' },
      { q: 'Which river is the longest in India?', options: ['Yamuna', 'Godavari', 'Ganga', 'Brahmaputra'], correct: 'Ganga', explanation: 'The Ganga (Ganges) is the longest river in India at approximately 2,525 km' },
      { q: 'The Great Wall is located in:', options: ['Japan', 'China', 'India', 'Mongolia'], correct: 'China', explanation: 'The Great Wall of China stretches across northern China' },
      { q: 'How many states does India have?', options: ['26', '28', '29', '30'], correct: '28', explanation: 'India currently has 28 states and 8 union territories' },
      { q: 'Which planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], correct: 'Mercury', explanation: 'Mercury is the closest planet to the Sun in our solar system' },
    ],
  }

  const category = ['mathematics', 'science', 'english', 'general'].includes(topic) ? topic : 'general'
  const pool = questions[category] || questions['general']
  const qData = pool[index % pool.length]

  return {
    id: `QQ${faker.string.alphanumeric(8).toUpperCase()}`,
    question: qData.q,
    type: 'mcq',
    options: qData.options,
    correctAnswer: qData.correct,
    points: faker.helpers.arrayElement([1, 2, 2, 5]),
    explanation: qData.explanation,
  }
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tfQuestions = [
    { q: 'The square root of a negative number is always imaginary.', correct: 'True', explanation: 'In the real number system, the square root of a negative number is not defined; in the complex number system, it is imaginary.' },
    { q: 'Zero is a natural number.', correct: 'False', explanation: 'Natural numbers start from 1 (1, 2, 3, ...). Zero is a whole number but not a natural number.' },
    { q: 'The speed of sound is greater than the speed of light.', correct: 'False', explanation: 'The speed of light (~3x10^8 m/s) is much greater than the speed of sound (~343 m/s in air).' },
    { q: 'DNA stands for Deoxyribonucleic Acid.', correct: 'True', explanation: 'DNA is the abbreviation for Deoxyribonucleic Acid, the molecule that carries genetic information.' },
    { q: 'Shakespeare wrote "Paradise Lost".', correct: 'False', explanation: '"Paradise Lost" was written by John Milton, not William Shakespeare.' },
    { q: 'The Ganges originates from the Gangotri glacier.', correct: 'True', explanation: 'The Ganga river originates from the Gangotri glacier at Gaumukh in the Himalayas.' },
    { q: 'Ohm\'s Law states V = IR.', correct: 'True', explanation: 'Ohm\'s Law relates voltage (V), current (I), and resistance (R) as V = IR.' },
    { q: 'Photosynthesis produces oxygen.', correct: 'True', explanation: 'During photosynthesis, plants convert CO2 and H2O into glucose and O2 using sunlight.' },
  ]

  const qData = faker.helpers.arrayElement(tfQuestions)
  return {
    id: `QQ${faker.string.alphanumeric(8).toUpperCase()}`,
    question: qData.q,
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: qData.correct,
    points: 1,
    explanation: qData.explanation,
  }
}

function generateShortAnswerQuestion(topic: string): QuizQuestion {
  const shortQuestions: Record<string, { q: string; correct: string; explanation: string }[]> = {
    mathematics: [
      { q: 'What is the value of pi rounded to 2 decimal places?', correct: '3.14', explanation: 'Pi (pi) is approximately 3.14159..., rounded to 2 decimal places it is 3.14' },
      { q: 'What is the factorial of 5?', correct: '120', explanation: '5! = 5 x 4 x 3 x 2 x 1 = 120' },
    ],
    science: [
      { q: 'What is the chemical symbol for Gold?', correct: 'Au', explanation: 'Gold\'s chemical symbol Au comes from the Latin word "Aurum"' },
      { q: 'What is the unit of electrical resistance?', correct: 'Ohm', explanation: 'The SI unit of electrical resistance is Ohm, symbolized by the Greek letter omega' },
    ],
    english: [
      { q: 'What is the plural of "child"?', correct: 'children', explanation: '"Child" has an irregular plural form: "children"' },
      { q: 'Complete the proverb: "A stitch in time saves ___"', correct: 'nine', explanation: 'The full proverb is "A stitch in time saves nine"' },
    ],
    general: [
      { q: 'What is the currency of Japan?', correct: 'Yen', explanation: 'The Japanese Yen (JPY) is the official currency of Japan' },
      { q: 'How many continents are there?', correct: '7', explanation: 'There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia/Oceania' },
    ],
  }

  const category = Object.keys(shortQuestions).includes(topic) ? topic : 'general'
  const qData = faker.helpers.arrayElement(shortQuestions[category])

  return {
    id: `QQ${faker.string.alphanumeric(8).toUpperCase()}`,
    question: qData.q,
    type: 'short_answer',
    options: [],
    correctAnswer: qData.correct,
    points: faker.helpers.arrayElement([2, 3, 5]),
    explanation: qData.explanation,
  }
}

function generateQuizQuestions(topic: string, count: number): QuizQuestion[] {
  const questions: QuizQuestion[] = []

  for (let i = 0; i < count; i++) {
    if (i < Math.ceil(count * 0.6)) {
      // ~60% MCQ
      questions.push(generateMCQQuestion(topic, i))
    } else if (i < Math.ceil(count * 0.8)) {
      // ~20% True/False
      questions.push(generateTrueFalseQuestion())
    } else {
      // ~20% Short Answer
      questions.push(generateShortAnswerQuestion(topic))
    }
  }

  return questions
}

const QUIZ_TEMPLATES: { courseIndex: number; title: string; topic: string }[] = [
  { courseIndex: 0, title: 'Real Numbers - Chapter Test', topic: 'mathematics' },
  { courseIndex: 0, title: 'Trigonometry Quick Quiz', topic: 'mathematics' },
  { courseIndex: 1, title: 'Limits & Continuity Assessment', topic: 'mathematics' },
  { courseIndex: 2, title: 'Kinematics Checkpoint', topic: 'science' },
  { courseIndex: 3, title: 'Electrostatics Mastery Quiz', topic: 'science' },
  { courseIndex: 4, title: 'Human Physiology - Module Test', topic: 'science' },
  { courseIndex: 6, title: 'English Literature Comprehension Test', topic: 'english' },
  { courseIndex: 8, title: 'Python Basics Assessment', topic: 'general' },
]

export const quizzes: Quiz[] = QUIZ_TEMPLATES.map((template, index) => {
  const course = courses[template.courseIndex]
  const quizLessons = lessons.filter((l) => l.courseId === course.id && l.type === 'quiz')
  const lessonId = quizLessons.length > 0
    ? faker.helpers.arrayElement(quizLessons).id
    : lessons.find((l) => l.courseId === course.id)?.id || ''

  const questionCount = faker.number.int({ min: 5, max: 10 })
  const questions = generateQuizQuestions(template.topic, questionCount)
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  return {
    id: `QZ${String(index + 1).padStart(4, '0')}`,
    lessonId,
    courseId: course.id,
    courseName: course.title,
    title: template.title,
    description: `This quiz tests your understanding of ${template.title.toLowerCase().replace(' - ', ': ')}. Answer all questions carefully. You can attempt this quiz up to 3 times.`,
    duration: faker.helpers.arrayElement([15, 20, 30, 45]),
    passingScore: faker.helpers.arrayElement([40, 50, 60]),
    maxAttempts: faker.helpers.arrayElement([2, 3, 3, 5]),
    questions,
    totalPoints,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  }
})

// ==================== QUIZ ATTEMPTS ====================

function createQuizAttempt(index: number): QuizAttempt {
  const quiz = quizzes[index % quizzes.length]
  const studentIndex = index % STUDENT_NAMES.length

  // Generate answers for each question
  const answers = quiz.questions.map((q) => {
    const isCorrect = faker.datatype.boolean(0.65) // 65% chance of getting it right
    let answer: string

    if (isCorrect) {
      answer = q.correctAnswer
    } else {
      if (q.type === 'mcq') {
        const wrongOptions = q.options.filter((o) => o !== q.correctAnswer)
        answer = faker.helpers.arrayElement(wrongOptions)
      } else if (q.type === 'true_false') {
        answer = q.correctAnswer === 'True' ? 'False' : 'True'
      } else {
        answer = faker.lorem.word()
      }
    }

    return {
      questionId: q.id,
      answer,
      correct: isCorrect,
    }
  })

  const correctCount = answers.filter((a) => a.correct).length
  const score = quiz.questions.reduce((sum, q, i) => sum + (answers[i].correct ? q.points : 0), 0)
  const percentage = Math.round((score / quiz.totalPoints) * 100)

  return {
    id: `QA${String(index + 1).padStart(4, '0')}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    studentId: STUDENT_IDS[studentIndex],
    studentName: STUDENT_NAMES[studentIndex],
    score,
    totalPoints: quiz.totalPoints,
    percentage,
    passed: percentage >= quiz.passingScore,
    answers,
    submittedAt: faker.date.recent({ days: 30 }).toISOString(),
  }
}

export const quizAttempts: QuizAttempt[] = Array.from({ length: 20 }, (_, i) => createQuizAttempt(i))

// ==================== HELPER FUNCTIONS ====================

export function getLmsStats(): LmsStats {
  const publishedCourses = courses.filter((c) => c.status === 'published')
  const activeEnrollments = enrollments.filter((e) => e.status === 'active')
  const uniqueStudentIds = new Set(enrollments.map((e) => e.studentId))

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const liveClassesToday = liveClasses.filter((lc) => {
    const scheduled = new Date(lc.scheduledAt)
    return scheduled >= todayStart && scheduled <= todayEnd && lc.status !== 'cancelled'
  }).length

  const completedEnrollments = enrollments.filter((e) => e.status === 'completed')
  const avgCompletionRate = activeEnrollments.length > 0
    ? Math.round(
        activeEnrollments.reduce((sum, e) => sum + e.progress, 0) / activeEnrollments.length
      )
    : 0

  const totalRevenue = enrollments
    .filter((e) => e.status !== 'dropped')
    .reduce((sum, e) => {
      const course = courses.find((c) => c.id === e.courseId)
      return sum + (course?.price || 0)
    }, 0)

  return {
    totalCourses: courses.length,
    publishedCourses: publishedCourses.length,
    totalStudents: uniqueStudentIds.size,
    activeEnrollments: activeEnrollments.length,
    liveClassesToday,
    avgCompletionRate,
    totalInstructors: instructors.length,
    totalRevenue,
  }
}

export function getInstructorStats(instructorId: string): InstructorStats {
  const instructorCourses = courses.filter(
    (c) => c.instructorId === instructorId && c.status !== 'draft'
  )
  const courseIds = instructorCourses.map((c) => c.id)

  const instructorEnrollments = enrollments.filter((e) => courseIds.includes(e.courseId))
  const uniqueStudents = new Set(instructorEnrollments.map((e) => e.studentId))

  const avgRating = instructorCourses.length > 0
    ? parseFloat(
        (
          instructorCourses.reduce((sum, c) => sum + c.rating, 0) / instructorCourses.length
        ).toFixed(1)
      )
    : 0

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const oneWeekFromNow = new Date()
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)

  const liveClassesThisWeek = liveClasses.filter((lc) => {
    const scheduled = new Date(lc.scheduledAt)
    return (
      lc.instructorId === instructorId &&
      scheduled >= oneWeekAgo &&
      scheduled <= oneWeekFromNow &&
      lc.status !== 'cancelled'
    )
  }).length

  const instructorAssignments = assignments.filter((a) => courseIds.includes(a.courseId))
  const assignmentIds = instructorAssignments.map((a) => a.id)
  const pendingGrading = submissions.filter(
    (s) => assignmentIds.includes(s.assignmentId) && s.status === 'submitted'
  ).length

  return {
    totalCourses: instructorCourses.length,
    totalStudents: uniqueStudents.size,
    avgRating,
    liveClassesThisWeek,
    pendingGrading,
  }
}

export function getStudentStats(studentId: string): StudentLmsStats {
  const studentEnrollments = enrollments.filter((e) => e.studentId === studentId)
  const activeEnrollments = studentEnrollments.filter((e) => e.status === 'active')
  const completedEnrollments = studentEnrollments.filter((e) => e.status === 'completed')

  const avgProgress = activeEnrollments.length > 0
    ? Math.round(
        activeEnrollments.reduce((sum, e) => sum + e.progress, 0) / activeEnrollments.length
      )
    : 0

  const enrolledCourseIds = studentEnrollments.map((e) => e.courseId)
  const now = new Date()

  const upcomingLiveClasses = liveClasses.filter(
    (lc) =>
      enrolledCourseIds.includes(lc.courseId) &&
      new Date(lc.scheduledAt) > now &&
      lc.status === 'scheduled'
  ).length

  const studentAssignmentSubmissions = submissions.filter((s) => s.studentId === studentId)
  const allCourseAssignments = assignments.filter((a) => enrolledCourseIds.includes(a.courseId))
  const submittedIds = new Set(studentAssignmentSubmissions.map((s) => s.assignmentId))
  const pendingAssignments = allCourseAssignments.filter(
    (a) => !submittedIds.has(a.id) && new Date(a.dueDate) > now
  ).length

  const quizzesTaken = quizAttempts.filter((qa) => qa.studentId === studentId).length

  return {
    enrolledCourses: studentEnrollments.length,
    completedCourses: completedEnrollments.length,
    avgProgress,
    upcomingLiveClasses,
    pendingAssignments,
    quizzesTaken,
  }
}

// ==================== CERTIFICATE TEMPLATES ====================

export const certificateTemplates: CertificateTemplate[] = [
  {
    id: 'TMPL0001',
    name: 'Classic Completion',
    type: 'completion',
    backgroundColor: '#ffffff',
    borderColor: '#1e40af',
    logoUrl: '/images/paperbook-logo.png',
    signatureUrl: '/images/principal-signature.png',
    isDefault: true,
  },
  {
    id: 'TMPL0002',
    name: 'Achievement Gold',
    type: 'achievement',
    backgroundColor: '#fffbeb',
    borderColor: '#b45309',
    logoUrl: '/images/paperbook-logo.png',
    signatureUrl: '/images/principal-signature.png',
    isDefault: true,
  },
  {
    id: 'TMPL0003',
    name: 'Excellence Platinum',
    type: 'excellence',
    backgroundColor: '#f8fafc',
    borderColor: '#475569',
    logoUrl: '/images/paperbook-logo.png',
    signatureUrl: '/images/principal-signature.png',
    isDefault: true,
  },
  {
    id: 'TMPL0004',
    name: 'Modern Blue',
    type: 'completion',
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    logoUrl: '/images/paperbook-logo.png',
    signatureUrl: '/images/principal-signature.png',
    isDefault: false,
  },
]

// ==================== CERTIFICATES ====================

function generateCertificateNumber(): string {
  const year = new Date().getFullYear()
  const random = faker.string.alphanumeric(8).toUpperCase()
  return `CERT-${year}-${random}`
}

function getCertificateType(enrollment: Enrollment): CertificateType {
  const avgScore = faker.number.int({ min: 60, max: 100 })
  if (avgScore >= 90) return 'excellence'
  if (avgScore >= 75) return 'achievement'
  return 'completion'
}

function getGradeFromType(type: CertificateType): string | undefined {
  switch (type) {
    case 'excellence': return 'A+'
    case 'achievement': return 'A'
    case 'completion': return 'B'
  }
}

// Generate certificates for completed enrollments
export const certificates: Certificate[] = enrollments
  .filter((e) => e.status === 'completed')
  .map((enrollment, index) => {
    const course = courses.find((c) => c.id === enrollment.courseId)
    const instructor = instructors.find((i) => i.id === course?.instructorId)
    const type = getCertificateType(enrollment)
    const certNumber = generateCertificateNumber()

    return {
      id: `CERT${String(index + 1).padStart(4, '0')}`,
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      courseName: enrollment.courseName,
      studentId: enrollment.studentId,
      studentName: enrollment.studentName,
      instructorName: instructor?.name || 'Course Instructor',
      type,
      issueDate: faker.date.recent({ days: 60 }).toISOString(),
      certificateNumber: certNumber,
      completionPercentage: 100,
      grade: getGradeFromType(type),
      hoursCompleted: course?.duration || 30,
      skills: course?.tags || [],
      verificationUrl: `https://verify.paperbook.edu/cert/${certNumber}`,
    }
  })
