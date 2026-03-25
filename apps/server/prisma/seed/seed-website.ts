/**
 * Website Content Seed — Creates a complete standard school website template
 * with all pages and sections populated with realistic dummy content.
 *
 * Run: npx tsx prisma/seed/seed-website.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get org
  const settings = await prisma.websiteSettings.findFirst()
  if (!settings) {
    console.error('No WebsiteSettings found. Run the main seed first.')
    process.exit(1)
  }
  const orgId = settings.organizationId!

  // Update settings
  await prisma.websiteSettings.update({
    where: { id: settings.id },
    data: {
      template: 'school-modern',
      institutionType: 'school',
      metaTitle: 'Greenwood International School — Nurturing Future Leaders',
      metaDescription: 'Greenwood International School offers world-class CBSE education from Nursery to Class 12 with smart classrooms, sports facilities, and a focus on holistic development.',
    },
  })
  console.log('[Seed] Updated website settings')

  // Delete existing pages + sections
  await prisma.websiteSection.deleteMany({ where: { organizationId: orgId } })
  await prisma.websitePage.deleteMany({ where: { organizationId: orgId } })
  console.log('[Seed] Cleared existing pages')

  // ==================== PAGE DEFINITIONS ====================

  const pages = [
    {
      slug: 'home',
      title: 'Home',
      sortOrder: 1,
      isPublished: true,
      metaTitle: 'Greenwood International School — Nurturing Future Leaders Since 1995',
      metaDescription: 'CBSE affiliated co-educational school offering Nursery to Class 12 with modern infrastructure, experienced faculty, and 98% board pass rate.',
      sections: [
        {
          type: 'hero',
          title: 'Welcome to Greenwood International School',
          sortOrder: 1,
          content: {
            headline: 'Nurturing Future Leaders Since 1995',
            subtitle: 'CBSE Affiliated | Nursery to Class 12 | Co-Educational | Smart Campus',
            backgroundImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600',
            ctaText: 'Apply for Admission',
            ctaLink: '/apply',
            secondaryCtaText: 'Virtual Campus Tour',
            secondaryCtaLink: '/s/campus',
            videoUrl: '',
            overlayColor: '#000000',
            overlayOpacity: 40,
            buttonStyle: 'solid',
          },
        },
        {
          type: 'stats',
          title: 'Our Legacy in Numbers',
          sortOrder: 2,
          content: {
            items: [
              { label: 'Years of Excellence', value: '29+', icon: 'calendar' },
              { label: 'Students Enrolled', value: '3,500+', icon: 'users' },
              { label: 'Board Pass Rate', value: '98.5%', icon: 'trending-up' },
              { label: 'Qualified Faculty', value: '180+', icon: 'award' },
              { label: 'Campus Area', value: '12 Acres', icon: 'map' },
              { label: 'Awards Won', value: '45+', icon: 'trophy' },
            ],
          },
        },
        {
          type: 'about',
          title: 'About Our School',
          sortOrder: 3,
          content: {
            body: 'Greenwood International School was founded in 1995 with a vision to provide world-class education that nurtures every child\'s potential. Spread across a lush 12-acre campus, we offer a stimulating learning environment that blends academic rigor with holistic development.\n\nOur mission is to create confident, compassionate, and capable global citizens. We follow the CBSE curriculum enriched with activity-based learning, STEM education, and value-based programs that prepare students for the challenges of the 21st century.',
            image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
            mission: 'To provide inclusive, innovative, and inspiring education that empowers every learner to achieve their fullest potential.',
            vision: 'To be a leading institution of academic excellence and character building, recognized globally for nurturing future leaders.',
            foundedYear: 1995,
            values: ['Academic Excellence', 'Integrity', 'Innovation', 'Inclusivity', 'Global Citizenship'],
            timeline: [
              { year: '1995', event: 'School founded with 120 students and 15 teachers' },
              { year: '2003', event: 'CBSE affiliation granted, expanded to Class 12' },
              { year: '2010', event: 'New science block with 8 advanced laboratories' },
              { year: '2015', event: 'Smart classroom initiative — 100% digital classrooms' },
              { year: '2020', event: 'Ranked among Top 50 Schools in the state' },
              { year: '2024', event: 'AI-enabled learning center and robotics lab launched' },
            ],
          },
        },
        {
          type: 'accreditation',
          title: 'Accreditation & Affiliations',
          sortOrder: 4,
          content: {
            description: 'Greenwood International School is recognized by leading educational bodies and maintains the highest standards of academic quality.',
            badges: [
              { name: 'CBSE Affiliated', logo: '', certNumber: 'CBSE/AFF/2100456', verificationUrl: 'https://cbse.gov.in', validUntil: '2028-03-31' },
              { name: 'ISO 9001:2015 Certified', logo: '', certNumber: 'ISO-EDU-2023-7891', verificationUrl: '', validUntil: '2026-12-31' },
              { name: 'Microsoft Showcase School', logo: '', certNumber: 'MS-SHOW-2024', verificationUrl: '', validUntil: '2026-06-30' },
              { name: 'Green School Certification', logo: '', certNumber: 'GSC-2024-1234', verificationUrl: '', validUntil: '2027-01-01' },
            ],
          },
        },
        {
          type: 'courses',
          title: 'Academic Programs',
          sortOrder: 5,
          content: {
            description: 'We offer a comprehensive curriculum from Nursery to Class 12, designed to build strong foundations and prepare students for competitive examinations and global careers.',
            items: [
              { name: 'Pre-Primary (Nursery - KG)', description: 'Play-based learning with phonics, numeracy, art, and physical development in a safe, nurturing environment.', duration: '3 years', eligibility: 'Age 3-5 years', image: '', fees: '₹45,000/year', category: 'Foundation' },
              { name: 'Primary (Class 1-5)', description: 'Activity-based CBSE curriculum with emphasis on language, mathematics, EVS, and creative arts.', duration: '5 years', eligibility: 'Age 6-10 years', image: '', fees: '₹65,000/year', category: 'Primary' },
              { name: 'Middle School (Class 6-8)', description: 'Subject-specialized teaching with science labs, computer education, and second language options (Hindi/Sanskrit/French).', duration: '3 years', eligibility: 'Completed Class 5', image: '', fees: '₹78,000/year', category: 'Middle' },
              { name: 'Secondary (Class 9-10)', description: 'Rigorous CBSE board preparation with elective subjects, career counseling, and competitive exam coaching.', duration: '2 years', eligibility: 'Completed Class 8', image: '', fees: '₹92,000/year', category: 'Secondary' },
              { name: 'Science Stream (Class 11-12)', description: 'Physics, Chemistry, Mathematics/Biology with JEE/NEET preparation support and advanced lab facilities.', duration: '2 years', eligibility: 'Class 10 pass with 60%+ in Science/Math', image: '', fees: '₹1,10,000/year', category: 'Senior Secondary' },
              { name: 'Commerce Stream (Class 11-12)', description: 'Accountancy, Business Studies, Economics with CA/CS foundation and entrepreneurship modules.', duration: '2 years', eligibility: 'Class 10 pass with 55%+ in Math', image: '', fees: '₹1,05,000/year', category: 'Senior Secondary' },
            ],
            layout: 'grid',
            showFees: true,
          },
        },
        {
          type: 'infrastructure',
          title: 'Campus & Facilities',
          sortOrder: 6,
          content: {
            description: 'Our 12-acre campus is equipped with state-of-the-art facilities designed to support holistic development.',
            facilities: [
              { name: 'Smart Classrooms', description: '60+ classrooms with interactive whiteboards, projectors, and digital learning tools.', image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400', icon: 'monitor' },
              { name: 'Science Laboratories', description: '8 fully-equipped labs for Physics, Chemistry, Biology, and Computer Science.', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', icon: 'flask-conical' },
              { name: 'Library & Media Center', description: '25,000+ books, digital catalog, e-library access, and dedicated reading zones.', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400', icon: 'book-open' },
              { name: 'Sports Complex', description: 'Olympic-size pool, basketball/tennis courts, cricket ground, and indoor sports hall.', image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8a0907?w=400', icon: 'trophy' },
              { name: 'Auditorium', description: '800-seat air-conditioned auditorium with professional sound and lighting systems.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', icon: 'mic' },
              { name: 'Robotics & AI Lab', description: 'Dedicated STEM lab with 3D printers, robotics kits, coding stations, and AI tools.', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400', icon: 'cpu' },
              { name: 'Art & Music Studios', description: 'Dedicated spaces for visual arts, western and Indian classical music, and dance.', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400', icon: 'palette' },
              { name: 'Cafeteria', description: 'Hygienic, nutritionist-approved meals served daily. Capacity for 400 students.', image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400', icon: 'utensils' },
            ],
            layout: 'grid',
          },
        },
        {
          type: 'results',
          title: 'Academic Results & Achievements',
          sortOrder: 7,
          content: {
            description: 'Our students consistently achieve outstanding results in CBSE board examinations and national-level competitions.',
            highlights: [
              { label: 'Class 12 Pass Rate', value: '98.5%', year: '2025' },
              { label: 'Class 10 Pass Rate', value: '99.2%', year: '2025' },
              { label: 'Students Scoring 90%+', value: '145', year: '2025' },
              { label: 'JEE/NEET Selections', value: '38', year: '2025' },
              { label: 'KVPY/Olympiad Medals', value: '12', year: '2025' },
            ],
            toppers: [
              { name: 'Ananya Sharma', score: '99.2%', photo: '', exam: 'CBSE Class 12', rank: 'School Topper', year: '2025' },
              { name: 'Rohan Mehta', score: '98.8%', photo: '', exam: 'CBSE Class 12', rank: '2nd Rank', year: '2025' },
              { name: 'Priya Krishnan', score: '98.6%', photo: '', exam: 'CBSE Class 10', rank: 'School Topper', year: '2025' },
              { name: 'Arjun Reddy', score: 'AIR 342', photo: '', exam: 'JEE Advanced', rank: 'IIT Selection', year: '2025' },
              { name: 'Sneha Patel', score: 'AIR 1,205', photo: '', exam: 'NEET', rank: 'AIIMS Selection', year: '2025' },
              { name: 'Karthik Iyer', score: 'Gold Medal', photo: '', exam: 'International Math Olympiad', rank: 'National Level', year: '2024' },
            ],
            showYearFilter: true,
          },
        },
        {
          type: 'testimonials',
          title: 'What Parents & Students Say',
          sortOrder: 8,
          content: {
            items: [
              { name: 'Mrs. Sunita Agarwal', role: 'Parent of Class 8 student', quote: 'Greenwood has transformed my daughter\'s confidence. The teachers go above and beyond to ensure every child gets individual attention. The smart classrooms and lab facilities are truly world-class.', avatar: '', rating: 5, relationship: 'parent', batch: '2023', isVerified: true },
              { name: 'Aditya Kumar', role: 'Class 12 Alumni, Batch of 2024', quote: 'The foundation I built at Greenwood helped me crack JEE Advanced. The faculty\'s dedication and the competitive environment prepared me for IIT like no coaching center could.', avatar: '', rating: 5, relationship: 'alumni', batch: '2024', isVerified: true },
              { name: 'Mr. Rajesh Nair', role: 'Parent of Class 5 & 9 students', quote: 'Both my children love coming to school. The balance between academics and extracurricular activities is perfect. The annual sports day and cultural fest are highlights every year.', avatar: '', rating: 5, relationship: 'parent', batch: '2022', isVerified: true },
              { name: 'Meera Joshi', role: 'Class 10 Student', quote: 'The robotics lab and coding classes are my favorite! I won the state-level robotics championship thanks to our amazing CS teacher. Greenwood truly encourages innovation.', avatar: '', rating: 5, relationship: 'student', batch: '2025', isVerified: true },
            ],
            showRatings: true,
            filterByRelationship: false,
          },
        },
        {
          type: 'faculty',
          title: 'Our Faculty',
          sortOrder: 9,
          content: {
            description: 'Our team of 180+ highly qualified educators brings a wealth of experience and passion for teaching. 85% of our faculty hold post-graduate degrees, and many are published researchers and subject matter experts.',
            showAll: false,
            featured: [],
          },
        },
        {
          type: 'admissions',
          title: 'Admissions Open 2025-26',
          sortOrder: 10,
          content: {
            body: 'Applications are now open for Nursery to Class 11 for the academic year 2025-26. Limited seats available — apply early to secure your child\'s future at Greenwood.',
            ctaText: 'Apply Online Now',
            ctaLink: '/apply',
            showApplicationForm: false,
            eligibilityCriteria: 'Age-appropriate admissions for each grade. Transfer students welcome with TC from previous school.',
            admissionDates: { startDate: '2025-01-15', endDate: '2025-04-30' },
            documentsRequired: ['Birth Certificate', 'Previous School TC', 'Report Card (last 2 years)', 'Passport-size Photos (4)', 'Aadhaar Card (parent & child)', 'Address Proof'],
            entranceExamInfo: 'Written assessment for Class 2 and above. Interaction session for Nursery/KG.',
            feeRange: '₹45,000 - ₹1,10,000 per year (varies by grade)',
            applicationSteps: [
              { step: 1, title: 'Online Application', description: 'Fill the online form and upload required documents' },
              { step: 2, title: 'Assessment', description: 'Written test / interaction based on grade applied for' },
              { step: 3, title: 'Parent Interview', description: 'Brief interaction with the admissions committee' },
              { step: 4, title: 'Admission Confirmation', description: 'Pay fees and collect the welcome kit' },
            ],
          },
        },
        {
          type: 'events',
          title: 'Upcoming Events',
          sortOrder: 11,
          content: {
            showCount: 4,
            showPast: false,
            items: [
              { title: 'Annual Sports Day', description: 'Inter-house athletics, swimming, and team sports championships.', image: '', location: 'School Sports Complex', startDate: '2025-11-15', endDate: '2025-11-16', registrationUrl: '', category: 'Sports', isFeatured: true },
              { title: 'Science Exhibition', description: 'Student projects showcasing innovation in physics, chemistry, biology, and technology.', image: '', location: 'School Auditorium', startDate: '2025-10-20', endDate: '2025-10-20', registrationUrl: '', category: 'Academic', isFeatured: false },
              { title: 'Cultural Fest — Greenwood Utsav', description: '3-day cultural extravaganza with music, dance, drama, and art exhibitions.', image: '', location: 'School Campus', startDate: '2025-12-05', endDate: '2025-12-07', registrationUrl: '', category: 'Cultural', isFeatured: true },
              { title: 'Parent-Teacher Meeting', description: 'Mid-term progress discussion for Classes 1-12.', image: '', location: 'Respective Classrooms', startDate: '2025-10-10', endDate: '2025-10-10', registrationUrl: '', category: 'Academic', isFeatured: false },
            ],
            showCategories: true,
            featuredFirst: true,
          },
        },
        {
          type: 'gallery',
          title: 'Campus Gallery',
          sortOrder: 12,
          content: {
            images: [
              { url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600', caption: 'Main School Building', alt: 'Greenwood International School main building', category: 'Campus' },
              { url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600', caption: 'Library Reading Hall', alt: 'Students in the library', category: 'Facilities' },
              { url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600', caption: 'Science Laboratory', alt: 'Chemistry lab experiments', category: 'Facilities' },
              { url: 'https://images.unsplash.com/photo-1461896836934-bd45ba8a0907?w=600', caption: 'Sports Complex', alt: 'School sports ground', category: 'Sports' },
              { url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600', caption: 'Art Studio', alt: 'Students in art class', category: 'Arts' },
              { url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600', caption: 'Robotics Lab', alt: 'Robotics and AI lab', category: 'STEM' },
            ],
            layout: 'grid',
            categories: ['Campus', 'Facilities', 'Sports', 'Arts', 'STEM'],
            showCategoryFilter: true,
          },
        },
        {
          type: 'contact',
          title: 'Contact Us',
          sortOrder: 13,
          content: {
            showMap: true,
            showForm: true,
            mapEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5!2d77.5!3d12.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
            additionalInfo: 'We are located on the Bangalore-Mysore Highway, easily accessible from all parts of the city. School buses cover 25+ routes across the metropolitan area.',
            address: { street: '123 Education Boulevard, Kengeri', city: 'Bangalore', state: 'Karnataka', pincode: '560060' },
            phones: [
              { label: 'Main Office', number: '+91 80 2345 6789' },
              { label: 'Admissions', number: '+91 80 2345 6790' },
              { label: 'Principal Office', number: '+91 80 2345 6791' },
            ],
            emails: [
              { label: 'General Enquiry', address: 'info@greenwoodschool.edu.in' },
              { label: 'Admissions', address: 'admissions@greenwoodschool.edu.in' },
            ],
            whatsappNumber: '+919876543210',
            officeHours: 'Monday - Friday: 8:00 AM - 4:00 PM | Saturday: 8:00 AM - 1:00 PM',
          },
        },
      ],
    },
    {
      slug: 'about',
      title: 'About Us',
      sortOrder: 2,
      isPublished: true,
      metaTitle: 'About Greenwood International School — Our History, Mission & Vision',
      metaDescription: 'Learn about Greenwood International School\'s 29-year legacy of academic excellence, our leadership team, and our commitment to holistic education.',
      sections: [
        {
          type: 'leadership',
          title: 'Our Leadership',
          sortOrder: 1,
          content: {
            description: 'Greenwood International School is led by a team of visionary educators and administrators committed to excellence.',
            leaders: [
              { name: 'Dr. Ramesh Krishnamurthy', designation: 'Chairman & Founder', photo: '', message: 'When I founded Greenwood in 1995, my dream was to create a school where every child feels valued and inspired. Today, seeing our alumni excel across the globe, I know that dream is alive. Education is not just about marks — it\'s about building character, fostering curiosity, and preparing young minds for a rapidly changing world.', qualifications: 'Ph.D. Education (Cambridge), M.Ed (Delhi University), 35+ years in education' },
              { name: 'Mrs. Lakshmi Venkatesh', designation: 'Principal', photo: '', message: 'At Greenwood, we believe every child has unique potential. Our role as educators is to provide the right environment, resources, and mentorship to help them discover and develop their talents. I\'m proud of our faculty\'s dedication and our students\' achievements both inside and outside the classroom.', qualifications: 'M.A. English (JNU), B.Ed, 22 years of teaching and administrative experience' },
              { name: 'Mr. Arun Sharma', designation: 'Vice Principal — Academics', photo: '', message: '', qualifications: 'M.Sc Physics (IIT Bombay), B.Ed, National Award for Teaching Excellence 2019' },
              { name: 'Mrs. Priya Desai', designation: 'Vice Principal — Student Affairs', photo: '', message: '', qualifications: 'M.A. Psychology (TISS), Certified Counselor, 18 years in student welfare' },
            ],
            layout: 'featured',
          },
        },
        {
          type: 'student_life',
          title: 'Student Life & Activities',
          sortOrder: 2,
          content: {
            description: 'Beyond academics, Greenwood offers a vibrant campus life with 20+ clubs, sports teams, and cultural activities.',
            activities: [
              { name: 'Robotics Club', description: 'Build robots, compete nationally, learn AI and coding. State champions 3 years running.', image: '', category: 'clubs' },
              { name: 'Debate & MUN', description: 'Weekly debates, inter-school MUN conferences, public speaking workshops.', image: '', category: 'clubs' },
              { name: 'Cricket Academy', description: 'Professional coaching with BCCI-certified coaches. Inter-school and district-level tournaments.', image: '', category: 'sports' },
              { name: 'Swimming', description: 'Olympic-size pool with certified instructors. Competitive swim team.', image: '', category: 'sports' },
              { name: 'Annual Cultural Fest', description: 'Greenwood Utsav — 3-day festival with music, dance, drama, and art exhibitions.', image: '', category: 'cultural' },
              { name: 'Classical Dance', description: 'Bharatanatyam and Kathak classes with certified instructors. Annual Arangetram.', image: '', category: 'cultural' },
              { name: 'Science Olympiad', description: 'Preparation and participation in NSO, IMO, and IEO competitions.', image: '', category: 'competitions' },
              { name: 'Community Service', description: 'Tree planting, orphanage visits, old-age home support, and eco-warrior programs.', image: '', category: 'community' },
            ],
            layout: 'grid',
          },
        },
        {
          type: 'safety',
          title: 'Safety & Security',
          sortOrder: 3,
          content: {
            description: 'The safety and well-being of every child is our highest priority. We maintain comprehensive security measures across our campus.',
            features: [
              { title: '200+ CCTV Cameras', description: 'Complete campus surveillance with 24/7 monitoring and 90-day recording retention.', icon: 'camera' },
              { title: 'Biometric Entry', description: 'Automated attendance and controlled entry/exit with parent notification.', icon: 'fingerprint' },
              { title: 'On-Campus Medical Center', description: 'Full-time nurse and visiting pediatrician. First-aid kits in every block.', icon: 'heart-pulse' },
              { title: 'Counseling Services', description: '3 full-time counselors for academic stress, behavioral support, and career guidance.', icon: 'brain' },
              { title: 'Fire Safety', description: 'Fire extinguishers, smoke detectors, regular fire drills, and trained emergency response team.', icon: 'flame' },
              { title: 'Anti-Bullying Program', description: 'Zero-tolerance policy with peer support groups and anonymous reporting system.', icon: 'shield' },
            ],
            emergencyContacts: [
              { role: 'Security Desk', name: 'Mr. Ravi Kumar', phone: '+91 80 2345 6789 ext 100' },
              { role: 'Medical Center', name: 'Dr. Anjali Rao', phone: '+91 80 2345 6789 ext 200' },
              { role: 'Principal Hotline', name: 'Mrs. Lakshmi Venkatesh', phone: '+91 98765 00001' },
            ],
          },
        },
      ],
    },
    {
      slug: 'admissions',
      title: 'Admissions',
      sortOrder: 3,
      isPublished: true,
      metaTitle: 'Admissions Open 2025-26 — Greenwood International School',
      metaDescription: 'Apply now for Nursery to Class 11. Limited seats available. Online application, assessment, and hassle-free admission process.',
      sections: [
        {
          type: 'admissions',
          title: 'Admission Process 2025-26',
          sortOrder: 1,
          content: {
            body: 'Join the Greenwood family! We welcome applications from students across all grades. Our transparent and supportive admission process ensures a smooth experience for parents and students alike.',
            ctaText: 'Start Your Application',
            ctaLink: '/apply',
            showApplicationForm: true,
            eligibilityCriteria: 'Age-appropriate admissions as per CBSE guidelines. Transfer students accepted with valid Transfer Certificate.',
            admissionDates: { startDate: '2025-01-15', endDate: '2025-04-30' },
            documentsRequired: ['Birth Certificate (original + copy)', 'Transfer Certificate from previous school', 'Report Card of last 2 academic years', '4 Passport-size photographs', 'Aadhaar Card of student and parents', 'Address Proof (utility bill / bank statement)', 'Medical fitness certificate'],
            entranceExamInfo: 'Nursery-KG: Informal interaction with the child and parents.\nClass 1-5: Written assessment in English, Math, and EVS.\nClass 6-10: Written assessment in English, Math, Science, and Social Science.\nClass 11: Based on Class 10 board results and subject-specific aptitude.',
            feeRange: '₹45,000 - ₹1,10,000 per year depending on grade',
            applicationSteps: [
              { step: 1, title: 'Submit Online Application', description: 'Fill the form below with student and parent details. Upload required documents.' },
              { step: 2, title: 'Assessment / Interaction', description: 'Attend the scheduled written test or parent-child interaction based on the grade.' },
              { step: 3, title: 'Result & Offer', description: 'Receive the admission decision within 7 working days via email and SMS.' },
              { step: 4, title: 'Fee Payment & Enrollment', description: 'Pay the admission fee online or at the school office. Collect the welcome kit and uniform.' },
            ],
          },
        },
        {
          type: 'fee_structure',
          title: 'Fee Structure 2025-26',
          sortOrder: 2,
          content: {
            description: 'Transparent and competitive fee structure with flexible payment options.',
            rows: [
              { category: 'Pre-Primary (Nursery - KG)', tuitionFee: '₹35,000', otherFees: '₹10,000', totalFee: '₹45,000', installments: '3 installments available' },
              { category: 'Primary (Class 1-5)', tuitionFee: '₹50,000', otherFees: '₹15,000', totalFee: '₹65,000', installments: '3 installments available' },
              { category: 'Middle School (Class 6-8)', tuitionFee: '₹58,000', otherFees: '₹20,000', totalFee: '₹78,000', installments: 'Quarterly installments' },
              { category: 'Secondary (Class 9-10)', tuitionFee: '₹70,000', otherFees: '₹22,000', totalFee: '₹92,000', installments: 'Quarterly installments' },
              { category: 'Senior Secondary — Science', tuitionFee: '₹85,000', otherFees: '₹25,000', totalFee: '₹1,10,000', installments: 'Quarterly installments' },
              { category: 'Senior Secondary — Commerce', tuitionFee: '₹80,000', otherFees: '₹25,000', totalFee: '₹1,05,000', installments: 'Quarterly installments' },
            ],
            scholarshipInfo: 'Merit scholarships available for Class 9-12 students scoring 90%+ in board exams. Sports scholarships for national-level athletes. Sibling discount of 10% on tuition fees.',
            paymentModes: ['Online Payment (Net Banking/UPI)', 'Bank Transfer (NEFT/RTGS)', 'Cheque / DD', 'Cash at School Office'],
            disclaimerText: 'Fees are subject to annual revision. Transport and hostel fees are additional. All fees are non-refundable once the academic year begins.',
          },
        },
        {
          type: 'faq',
          title: 'Frequently Asked Questions',
          sortOrder: 3,
          content: {
            description: '',
            items: [
              { question: 'What is the admission process for Nursery?', answer: 'For Nursery admission, we conduct a brief interaction session with the child and parents. There is no written test. The interaction assesses the child\'s readiness for school. Parents need to submit the online application form and attend the scheduled interaction.', category: 'Admissions' },
              { question: 'Is there an entrance exam for higher classes?', answer: 'Yes, students applying for Class 2 and above must take a written assessment. The test covers English, Mathematics, and grade-appropriate subjects. Results are shared within 7 working days.', category: 'Admissions' },
              { question: 'What are the school timings?', answer: 'Pre-Primary: 8:30 AM - 12:30 PM\nPrimary (Class 1-5): 8:00 AM - 2:30 PM\nMiddle & Senior: 7:30 AM - 3:00 PM\nSaturday: Half-day (8:00 AM - 12:00 PM) for Classes 9-12 only.', category: 'General' },
              { question: 'Do you provide transport facilities?', answer: 'Yes, we have a fleet of 35 GPS-tracked buses covering 25+ routes across Bangalore. All buses have CCTV, a female attendant, and a first-aid kit. Transport fees range from ₹18,000 to ₹30,000 per year depending on the route.', category: 'Transport' },
              { question: 'Are scholarships available?', answer: 'Yes! We offer merit scholarships (up to 50% fee waiver) for students scoring 90%+ in board exams, sports scholarships for national-level athletes, and need-based financial aid. Applications are reviewed by the scholarship committee annually.', category: 'Fees' },
              { question: 'What curriculum does the school follow?', answer: 'We follow the CBSE (Central Board of Secondary Education) curriculum. Our teaching methodology integrates activity-based learning, STEM education, and experiential learning alongside the standard CBSE syllabus.', category: 'Academics' },
              { question: 'What extracurricular activities are available?', answer: 'We offer 20+ clubs and activities including Robotics, Debate/MUN, Music, Dance, Art, Cricket, Swimming, Basketball, Athletics, Drama, Photography, Eco Club, and more. Every student participates in at least one activity.', category: 'Activities' },
              { question: 'How can I track my child\'s progress?', answer: 'Parents receive regular progress reports, can attend Parent-Teacher Meetings (held 3 times a year), and have access to our ERP portal for real-time attendance, grades, and communication with teachers.', category: 'General' },
            ],
            showCategories: true,
          },
        },
        {
          type: 'downloads',
          title: 'Download Resources',
          sortOrder: 4,
          content: {
            description: 'Download our brochures, forms, and academic resources.',
            items: [
              { title: 'School Prospectus 2025-26', description: 'Complete guide to Greenwood International School — academics, facilities, fee structure, and more.', fileUrl: '#', fileType: 'pdf', fileSize: '4.2 MB', category: 'Admissions' },
              { title: 'Admission Application Form', description: 'Printable admission application form for offline submission.', fileUrl: '#', fileType: 'pdf', fileSize: '320 KB', category: 'Admissions' },
              { title: 'Academic Calendar 2025-26', description: 'Term dates, holidays, exam schedules, and event calendar.', fileUrl: '#', fileType: 'pdf', fileSize: '1.1 MB', category: 'Academics' },
              { title: 'Fee Structure Document', description: 'Detailed fee breakdown by grade with payment schedule.', fileUrl: '#', fileType: 'pdf', fileSize: '280 KB', category: 'Fees' },
              { title: 'Transport Route Map', description: 'Bus routes, pickup points, and timings for all 25 routes.', fileUrl: '#', fileType: 'pdf', fileSize: '2.5 MB', category: 'Transport' },
              { title: 'Uniform Guidelines', description: 'Uniform specifications, vendor list, and dress code policy.', fileUrl: '#', fileType: 'pdf', fileSize: '450 KB', category: 'General' },
            ],
            showCategories: true,
          },
        },
      ],
    },
    {
      slug: 'campus',
      title: 'Campus & Facilities',
      sortOrder: 4,
      isPublished: true,
      metaTitle: 'Campus Tour — Greenwood International School Facilities',
      metaDescription: 'Explore our 12-acre campus with smart classrooms, science labs, sports complex, robotics lab, library, and more.',
      sections: [
        {
          type: 'virtual_tour',
          title: 'Virtual Campus Tour',
          sortOrder: 1,
          content: {
            description: 'Take a virtual tour of our campus from the comfort of your home.',
            items: [
              { title: 'School Overview', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', description: 'A complete walkthrough of our 12-acre campus.' },
              { title: 'Science Block', type: 'video', url: '', thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', description: 'Tour our 8 science laboratories.' },
              { title: 'Sports Complex', type: 'video', url: '', thumbnail: 'https://images.unsplash.com/photo-1461896836934-bd45ba8a0907?w=400', description: 'Olympic pool, courts, and indoor hall.' },
              { title: 'Library & STEM Lab', type: 'video', url: '', thumbnail: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400', description: '25,000 books and our AI/Robotics lab.' },
            ],
            primaryVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
        },
        {
          type: 'transport',
          title: 'School Transport',
          sortOrder: 2,
          content: {
            description: 'Safe and reliable transport service covering all major areas of Bangalore.',
            routes: [
              { name: 'Route 1 — Whitefield', areas: ['Whitefield', 'ITPL', 'Marathahalli', 'Kundalahalli'], timing: '6:45 AM pickup / 3:30 PM drop', vehicleType: 'AC Bus' },
              { name: 'Route 2 — Koramangala', areas: ['Koramangala', 'HSR Layout', 'BTM Layout', 'JP Nagar'], timing: '6:30 AM pickup / 3:45 PM drop', vehicleType: 'AC Bus' },
              { name: 'Route 3 — Jayanagar', areas: ['Jayanagar', 'Basavanagudi', 'Banashankari', 'Kumaraswamy Layout'], timing: '6:45 AM pickup / 3:30 PM drop', vehicleType: 'Non-AC Bus' },
              { name: 'Route 4 — Electronic City', areas: ['Electronic City', 'Bommanahalli', 'Silk Board', 'Madiwala'], timing: '6:15 AM pickup / 4:00 PM drop', vehicleType: 'AC Bus' },
            ],
            features: ['GPS Tracking on All Buses', 'CCTV Cameras', 'Female Attendant on Every Bus', 'First-Aid Kit', 'Speed Governor (40 kmph)', 'RFID-based Boarding', 'Parent SMS Alerts'],
            contactNumber: '+91 80 2345 6789 ext 300',
          },
        },
      ],
    },
    {
      slug: 'news',
      title: 'News & Updates',
      sortOrder: 5,
      isPublished: true,
      metaTitle: 'News & Updates — Greenwood International School',
      metaDescription: 'Latest news, announcements, and achievements from Greenwood International School.',
      sections: [
        {
          type: 'news',
          title: 'Latest News',
          sortOrder: 1,
          content: {
            items: [
              { title: 'Greenwood Students Win National Robotics Championship', body: 'Our senior team secured first place at the National Robotics Challenge 2025 held in Delhi, competing against 200+ schools from across the country.', date: '2025-03-15', image: '' },
              { title: 'CBSE Board Results 2025 — 98.5% Pass Rate', body: 'Congratulations to our Class 12 batch! 145 students scored above 90%, with school topper Ananya Sharma achieving 99.2%.', date: '2025-05-20', image: '' },
              { title: 'New AI & Robotics Lab Inaugurated', body: 'The state-of-the-art AI lab featuring 3D printers, drone programming stations, and ML workstations was inaugurated by the Education Minister.', date: '2025-02-10', image: '' },
              { title: 'Greenwood Utsav 2025 — A Grand Success', body: 'Over 3,000 parents and guests attended the 3-day cultural extravaganza featuring music, dance, drama, and art from 1,200 student performers.', date: '2025-12-08', image: '' },
              { title: 'International Exchange Program with UK School', body: 'Greenwood partners with Harrow School UK for student and teacher exchange. 15 students will visit London in March 2026.', date: '2025-09-01', image: '' },
            ],
          },
        },
        {
          type: 'cta_banner',
          title: '',
          sortOrder: 2,
          content: {
            headline: 'Ready to Join Greenwood?',
            subtitle: 'Admissions are open for 2025-26. Limited seats — apply today!',
            ctaText: 'Apply Now',
            ctaLink: '/apply',
            secondaryCtaText: 'Schedule a Visit',
            secondaryCtaLink: '/s/campus',
            backgroundImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600',
            backgroundColor: '#1e3a5f',
            style: 'full',
          },
        },
      ],
    },
  ]

  // ==================== CREATE PAGES & SECTIONS ====================

  for (const pageData of pages) {
    const page = await prisma.websitePage.create({
      data: {
        organizationId: orgId,
        slug: pageData.slug,
        title: pageData.title,
        sortOrder: pageData.sortOrder,
        isPublished: pageData.isPublished,
        metaTitle: pageData.metaTitle,
        metaDescription: pageData.metaDescription,
      },
    })
    console.log(`[Seed] Created page: ${pageData.title} (${pageData.sections.length} sections)`)

    for (const sec of pageData.sections) {
      await prisma.websiteSection.create({
        data: {
          organizationId: orgId,
          pageId: page.id,
          type: sec.type,
          title: sec.title,
          content: sec.content as any,
          sortOrder: sec.sortOrder,
          isVisible: true,
        },
      })
    }
  }

  console.log(`\\n[Seed] Done! Created ${pages.length} pages with ${pages.reduce((s, p) => s + p.sections.length, 0)} sections.`)
  console.log('[Seed] Visit http://localhost:5173/school-website to manage')
  console.log('[Seed] Visit http://localhost:5173/s/home for the public website')

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
