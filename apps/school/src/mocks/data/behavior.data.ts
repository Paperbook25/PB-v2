import { faker } from '@faker-js/faker'
import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  DisciplinaryAction,
  ActionType,
  ActionStatus,
  BehaviorPoint,
  PointType,
  PointCategory,
  Detention,
  DetentionStatus,
} from '@/features/behavior/types/behavior.types'
import { Role } from '@/types/common.types'

const incidentCategories: IncidentCategory[] = [
  'tardiness',
  'dress_code',
  'disruptive_behavior',
  'bullying',
  'fighting',
  'property_damage',
  'academic_dishonesty',
  'substance_abuse',
  'verbal_abuse',
  'insubordination',
  'other',
]

const incidentSeverities: IncidentSeverity[] = ['minor', 'moderate', 'major', 'critical']
const incidentStatuses: IncidentStatus[] = ['reported', 'under_review', 'resolved', 'escalated']
const actionTypes: ActionType[] = ['verbal_warning', 'written_warning', 'counseling', 'detention', 'suspension', 'expulsion']
const actionStatuses: ActionStatus[] = ['pending', 'in_progress', 'completed', 'appealed', 'overturned']
const positiveCategories: PointCategory[] = ['academic_excellence', 'helpfulness', 'leadership', 'good_attendance', 'sports', 'arts', 'community_service', 'improvement']
const negativeCategories: PointCategory[] = ['late_arrival', 'uniform_violation', 'homework_missing', 'disruptive', 'other']
const detentionStatuses: DetentionStatus[] = ['scheduled', 'attended', 'missed', 'excused', 'cancelled']

const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const sections = ['A', 'B', 'C']
const locations = ['Classroom', 'Playground', 'Cafeteria', 'Library', 'Corridor', 'Auditorium', 'Lab', 'Sports Ground']

// Generate mock students for referencing
const mockStudents = Array.from({ length: 50 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  class: faker.helpers.arrayElement(classes),
  section: faker.helpers.arrayElement(sections),
}))

const mockTeachers = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
}))

// ===== Incidents =====
function createIncident(status?: IncidentStatus): Incident {
  const student = faker.helpers.arrayElement(mockStudents)
  const reporter = faker.helpers.arrayElement(mockTeachers)
  const finalStatus = status || faker.helpers.arrayElement(incidentStatuses)
  const category = faker.helpers.arrayElement(incidentCategories)
  const severity = faker.helpers.arrayElement(incidentSeverities)
  const incidentDate = faker.date.recent({ days: 60 })

  const incident: Incident = {
    id: faker.string.uuid(),
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    category,
    severity,
    status: finalStatus,
    title: getIncidentTitle(category),
    description: faker.lorem.paragraph(),
    location: faker.helpers.arrayElement(locations),
    incidentDate: incidentDate.toISOString().split('T')[0],
    incidentTime: `${faker.number.int({ min: 8, max: 16 })}:${faker.helpers.arrayElement(['00', '15', '30', '45'])}`,
    witnesses: faker.datatype.boolean() ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.person.fullName()) : undefined,
    reportedBy: reporter.id,
    reportedByName: reporter.name,
    reportedByRole: 'teacher',
    reportedAt: faker.date.between({ from: incidentDate, to: new Date() }).toISOString(),
    updatedAt: faker.date.recent({ days: 7 }).toISOString(),
    actions: [],
    parentNotified: faker.datatype.boolean(),
    parentNotifiedAt: faker.datatype.boolean() ? faker.date.recent({ days: 30 }).toISOString() : undefined,
  }

  if (finalStatus === 'resolved') {
    const resolver = faker.helpers.arrayElement(mockTeachers)
    incident.resolution = {
      resolvedBy: resolver.id,
      resolvedByName: resolver.name,
      resolvedAt: faker.date.recent({ days: 14 }).toISOString(),
      notes: faker.lorem.sentence(),
      outcome: faker.helpers.arrayElement(['warning', 'counseling', 'detention', 'suspension', 'no_action']),
    }
  }

  return incident
}

function getIncidentTitle(category: IncidentCategory): string {
  const titles: Record<IncidentCategory, string[]> = {
    tardiness: ['Late to class', 'Chronic tardiness', 'Late arrival without permission'],
    dress_code: ['Uniform violation', 'Improper attire', 'Missing ID card'],
    disruptive_behavior: ['Disrupting class', 'Talking during lesson', 'Making noise'],
    bullying: ['Bullying incident', 'Harassment', 'Intimidation'],
    fighting: ['Physical altercation', 'Fighting in school', 'Aggressive behavior'],
    property_damage: ['School property damage', 'Vandalism', 'Damaged equipment'],
    academic_dishonesty: ['Cheating on exam', 'Plagiarism', 'Copying homework'],
    substance_abuse: ['Prohibited substance', 'Smoking on campus', 'Alcohol possession'],
    verbal_abuse: ['Using inappropriate language', 'Verbal harassment', 'Disrespectful speech'],
    insubordination: ['Refusing instructions', 'Defiance', 'Leaving class without permission'],
    other: ['Behavioral issue', 'Conduct violation', 'Misconduct'],
  }
  return faker.helpers.arrayElement(titles[category])
}

export const incidents: Incident[] = [
  ...Array.from({ length: 30 }, () => createIncident('resolved')),
  ...Array.from({ length: 15 }, () => createIncident('reported')),
  ...Array.from({ length: 10 }, () => createIncident('under_review')),
  ...Array.from({ length: 5 }, () => createIncident('escalated')),
]

// ===== Disciplinary Actions =====
function createAction(status?: ActionStatus): DisciplinaryAction {
  const student = faker.helpers.arrayElement(mockStudents)
  const issuer = faker.helpers.arrayElement(mockTeachers)
  const type = faker.helpers.arrayElement(actionTypes)
  const finalStatus = status || faker.helpers.arrayElement(actionStatuses)
  const startDate = faker.date.recent({ days: 60 })

  const action: DisciplinaryAction = {
    id: faker.string.uuid(),
    incidentId: faker.helpers.arrayElement(incidents).id,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    type,
    status: finalStatus,
    description: getActionDescription(type),
    startDate: startDate.toISOString().split('T')[0],
    endDate: ['suspension', 'detention'].includes(type)
      ? faker.date.soon({ days: 7, refDate: startDate }).toISOString().split('T')[0]
      : undefined,
    durationDays: type === 'suspension' ? faker.number.int({ min: 1, max: 5 }) : undefined,
    issuedBy: issuer.id,
    issuedByName: issuer.name,
    issuedAt: startDate.toISOString(),
    completedAt: finalStatus === 'completed' ? faker.date.recent({ days: 14 }).toISOString() : undefined,
    notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    parentAcknowledged: faker.datatype.boolean(),
    parentAcknowledgedAt: faker.datatype.boolean() ? faker.date.recent({ days: 7 }).toISOString() : undefined,
  }

  if (finalStatus === 'appealed' && faker.datatype.boolean()) {
    action.appeal = {
      id: faker.string.uuid(),
      submittedBy: faker.string.uuid(),
      submittedByName: faker.person.fullName(),
      submittedAt: faker.date.recent({ days: 7 }).toISOString(),
      reason: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
    }
    if (action.appeal.status !== 'pending') {
      const reviewer = faker.helpers.arrayElement(mockTeachers)
      action.appeal.reviewedBy = reviewer.id
      action.appeal.reviewedByName = reviewer.name
      action.appeal.reviewedAt = faker.date.recent({ days: 3 }).toISOString()
      action.appeal.reviewNotes = faker.lorem.sentence()
    }
  }

  return action
}

function getActionDescription(type: ActionType): string {
  const descriptions: Record<ActionType, string[]> = {
    verbal_warning: ['Verbal counseling regarding behavior', 'Warned about conduct'],
    written_warning: ['Formal written warning issued', 'Written notice of misconduct'],
    counseling: ['Scheduled counseling session', 'Meeting with school counselor'],
    detention: ['After-school detention assigned', 'Lunch detention'],
    suspension: ['Suspended from classes', 'In-school suspension'],
    expulsion: ['Recommended for expulsion', 'Expulsion proceedings initiated'],
  }
  return faker.helpers.arrayElement(descriptions[type])
}

export const actions: DisciplinaryAction[] = [
  ...Array.from({ length: 40 }, () => createAction('completed')),
  ...Array.from({ length: 15 }, () => createAction('pending')),
  ...Array.from({ length: 10 }, () => createAction('in_progress')),
  ...Array.from({ length: 5 }, () => createAction('appealed')),
]

// Link some actions to incidents
incidents.forEach((incident, i) => {
  if (i < 20 && actions[i]) {
    incident.actions = [actions[i]]
    actions[i].incidentId = incident.id
  }
})

// ===== Behavior Points =====
function createBehaviorPoint(): BehaviorPoint {
  const student = faker.helpers.arrayElement(mockStudents)
  const teacher = faker.helpers.arrayElement(mockTeachers)
  const isPositive = faker.datatype.boolean()

  return {
    id: faker.string.uuid(),
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    type: isPositive ? 'positive' : 'negative',
    category: isPositive
      ? faker.helpers.arrayElement(positiveCategories)
      : faker.helpers.arrayElement(negativeCategories),
    points: isPositive
      ? faker.number.int({ min: 1, max: 10 })
      : faker.number.int({ min: -10, max: -1 }),
    description: isPositive
      ? faker.helpers.arrayElement([
          'Excellent participation in class',
          'Helped a classmate with studies',
          'Outstanding sports performance',
          'Led team project successfully',
          'Perfect attendance this month',
          'Volunteered for school event',
          'Improved test scores significantly',
        ])
      : faker.helpers.arrayElement([
          'Late to class without excuse',
          'Missing homework submission',
          'Uniform not according to rules',
          'Disrupted class activity',
          'Unexcused absence',
        ]),
    awardedBy: teacher.id,
    awardedByName: teacher.name,
    awardedAt: faker.date.recent({ days: 90 }).toISOString(),
  }
}

export const behaviorPoints: BehaviorPoint[] = Array.from({ length: 200 }, createBehaviorPoint)

// ===== Detentions =====
function createDetention(status?: DetentionStatus): Detention {
  const student = faker.helpers.arrayElement(mockStudents)
  const supervisor = faker.helpers.arrayElement(mockTeachers)
  const creator = faker.helpers.arrayElement(mockTeachers)
  const finalStatus = status || faker.helpers.arrayElement(detentionStatuses)
  const date = faker.date.soon({ days: 14 })

  return {
    id: faker.string.uuid(),
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    actionId: faker.datatype.boolean() ? faker.helpers.arrayElement(actions).id : undefined,
    incidentId: faker.datatype.boolean() ? faker.helpers.arrayElement(incidents).id : undefined,
    reason: faker.helpers.arrayElement([
      'Late arrival to school',
      'Incomplete homework',
      'Disruptive behavior in class',
      'Uniform violation',
      'Disciplinary action follow-up',
    ]),
    date: date.toISOString().split('T')[0],
    startTime: faker.helpers.arrayElement(['14:00', '15:00', '15:30']),
    endTime: faker.helpers.arrayElement(['15:00', '16:00', '16:30']),
    location: faker.helpers.arrayElement(['Room 101', 'Room 105', 'Library', 'Study Hall']),
    supervisorId: supervisor.id,
    supervisorName: supervisor.name,
    status: finalStatus,
    notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    createdBy: creator.id,
    createdAt: faker.date.recent({ days: 7 }).toISOString(),
    updatedAt: faker.date.recent({ days: 3 }).toISOString(),
  }
}

export const detentions: Detention[] = [
  ...Array.from({ length: 10 }, () => createDetention('scheduled')),
  ...Array.from({ length: 30 }, () => createDetention('attended')),
  ...Array.from({ length: 5 }, () => createDetention('missed')),
  ...Array.from({ length: 3 }, () => createDetention('excused')),
  ...Array.from({ length: 2 }, () => createDetention('cancelled')),
]

// Helper to get student behavior summary
export function getStudentBehaviorSummary(studentId: string) {
  const studentPoints = behaviorPoints.filter((p) => p.studentId === studentId)
  const studentIncidents = incidents.filter((i) => i.studentId === studentId)
  const studentActions = actions.filter((a) => a.studentId === studentId)

  const totalPositive = studentPoints
    .filter((p) => p.type === 'positive')
    .reduce((sum, p) => sum + p.points, 0)
  const totalNegative = Math.abs(
    studentPoints.filter((p) => p.type === 'negative').reduce((sum, p) => sum + p.points, 0)
  )

  const student = mockStudents.find((s) => s.id === studentId) || {
    name: 'Unknown',
    class: 'Unknown',
    section: 'A',
  }

  return {
    studentId,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    totalPositivePoints: totalPositive,
    totalNegativePoints: totalNegative,
    netPoints: totalPositive - totalNegative,
    incidentCount: studentIncidents.length,
    lastIncident: studentIncidents.length > 0
      ? studentIncidents.sort(
          (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
        )[0].reportedAt
      : undefined,
    activeActions: studentActions.filter((a) => ['pending', 'in_progress'].includes(a.status)).length,
    behaviorTrend: totalPositive > totalNegative * 2 ? 'improving' as const
      : totalNegative > totalPositive * 2 ? 'declining' as const
      : 'stable' as const,
  }
}
