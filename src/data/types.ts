export type Role = 'admin' | 'teacher' | 'student'

export interface VideoTestimonial {
  id: string
  name: string
  role: string
  poster: string
  videoUrl: string
  quote: string
}

export interface TextTestimonial {
  id: string
  name: string
  role: string
  avatar: string
  text: string
  rating: number
}

export interface FaqItem {
  id: string
  q: string
  a: string
}

export interface LandingContent {
  eyebrow: string
  headline: string
  /** *yıldız içindeki* kelimeler italik/vurgulu gösterilir */
  subheadline: string
  vslUrl: string
  vslPoster: string
  vslCaption: string
  heroImage: string
  videoTestimonials: VideoTestimonial[]
  textTestimonials: TextTestimonial[]
  faq: FaqItem[]
  ctaLabel: string
  guarantee: string
  stats: { value: string; label: string }[]
}

export interface Brand {
  id: string
  slug: string
  name: string
  domain: string
  accent: string
  accentSoft: string
  monogram: string
  tagline: string
  active: boolean
  invoiceTitle: string
  taxNo: string
  landing: LandingContent
}

export interface Doc {
  id: string
  name: string
  kind: 'pdf' | 'xlsx' | 'docx' | 'zip'
  size: string
}

export interface Question {
  id: string
  text: string
  options: string[]
  answer: number
  explanation: string
  approved: boolean
  edited?: boolean
}

export type AiStatus = 'none' | 'running' | 'review' | 'approved'

export interface LessonAi {
  status: AiStatus
  generatedAt?: string
  approvedAt?: string
  tokens?: number
  cost?: number
  questions: Question[]
}

export interface Lesson {
  id: string
  title: string
  duration: number
  videoUrl: string
  summary: string
  docs: Doc[]
  ai: LessonAi
}

export interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  brandId: string
  teacherId: string
  title: string
  cover: string
  description: string
  level: string
  sections: Section[]
}

export interface Package {
  id: string
  brandId: string
  title: string
  price: number
  oldPrice?: number
  installments: number
  courseIds: string[]
  features: string[]
  badge?: string
  active: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar: string
  phone?: string
  createdAt: string
  brandIds: string[]
}

export interface Invoice {
  no: string
  type: 'e-Arşiv' | 'e-Fatura'
  status: 'kesildi' | 'kuyrukta' | 'iptal'
  issuedAt: string
}

export interface Order {
  id: string
  brandId: string
  packageId: string
  userId: string
  amount: number
  status: 'odendi' | 'basarisiz' | 'iade'
  createdAt: string
  paytrRef: string
  installment: number
  buyer: { name: string; email: string; phone: string; idNo?: string; company?: string; taxNo?: string; city: string }
  invoice?: Invoice
}

export interface Enrollment {
  userId: string
  courseId: string
  orderId: string
  createdAt: string
}

export interface LessonProgress {
  completed: boolean
  completedAt?: string
  quizScore?: number
  quizTotal?: number
  watched?: number
}

export interface AppState {
  version: number
  currentUserId: string | null
  brands: Brand[]
  courses: Course[]
  packages: Package[]
  users: User[]
  orders: Order[]
  enrollments: Enrollment[]
  progress: Record<string, Record<string, LessonProgress>>
  aiLedger: { lessonId: string; at: string; tokens: number; cost: number }[]
}
