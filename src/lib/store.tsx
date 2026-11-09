import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AppState, Brand, Course, Lesson, Order, Package, Question, User } from '../data/types'
import { seed, SEED_VERSION } from '../data/seed'
import { generateQuestions, topicOf } from './ai'

const KEY = 'kurss:state'

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as AppState
      if (s.version === SEED_VERSION) return s
    }
  } catch {
    /* boş */
  }
  return seed()
}

type Mutator = (draft: AppState) => void

interface Ctx {
  state: AppState
  me: User | null
  update: (fn: Mutator) => void
  login: (userId: string | null) => void
  reset: () => void
  // domain aksiyonları
  findLesson: (lessonId: string) => { course: Course; lesson: Lesson } | null
  runAi: (lessonId: string) => Promise<void>
  checkout: (input: CheckoutInput) => Promise<Order>
  completeLesson: (lessonId: string, quiz?: { score: number; total: number }) => void
}

export interface CheckoutInput {
  brand: Brand
  pkg: Package
  installment: number
  buyer: Order['buyer']
  cardOk: boolean
}

const StoreCtx = createContext<Ctx | null>(null)

const clone = <T,>(x: T): T => (typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x)))
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)
  const ref = useRef(state)
  ref.current = state

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* depolama kapalı olabilir */
    }
  }, [state])

  const update = useCallback((fn: Mutator) => {
    setState((prev) => {
      const next = clone(prev)
      fn(next)
      return next
    })
  }, [])

  const findLessonIn = (s: AppState, lessonId: string) => {
    for (const course of s.courses)
      for (const sec of course.sections)
        for (const lesson of sec.lessons) if (lesson.id === lessonId) return { course, lesson }
    return null
  }

  const runAi = useCallback(
    async (lessonId: string) => {
      const found = findLessonIn(ref.current, lessonId)
      if (!found) return
      // Aynı video için ikinci kez çalıştırma engeli (maliyet kontrolü)
      if (found.lesson.ai.status !== 'none') return
      update((d) => {
        findLessonIn(d, lessonId)!.lesson.ai.status = 'running'
      })
      await wait(3600)
      update((d) => {
        const f = findLessonIn(d, lessonId)!
        const brand = d.brands.find((b) => b.id === f.course.brandId)!
        const r = generateQuestions(f.lesson, topicOf(brand.slug))
        const at = new Date().toISOString()
        f.lesson.ai = { status: 'review', generatedAt: at, tokens: r.tokens, cost: r.cost, questions: r.questions }
        d.aiLedger.push({ lessonId, at, tokens: r.tokens, cost: r.cost })
      })
    },
    [update],
  )

  const checkout = useCallback(
    async (input: CheckoutInput): Promise<Order> => {
      await wait(1800)
      const s = ref.current
      let user = s.users.find((u) => u.email.toLowerCase() === input.buyer.email.toLowerCase())
      const now = new Date().toISOString()
      const id = `SP-${(26200 + s.orders.length).toString()}`
      const order: Order = {
        id,
        brandId: input.brand.id,
        packageId: input.pkg.id,
        userId: user?.id ?? `u_${Date.now().toString(36)}`,
        amount: input.pkg.price,
        status: input.cardOk ? 'odendi' : 'basarisiz',
        createdAt: now,
        paytrRef: `PT${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
        installment: input.installment,
        buyer: input.buyer,
      }
      if (input.cardOk) {
        const prefix = input.brand.slug.slice(0, 3).toUpperCase()
        const count = s.orders.filter((o) => o.invoice).length + 1100
        order.invoice = {
          no: `${prefix}2026${count.toString().padStart(9, '0')}`,
          type: input.buyer.taxNo ? 'e-Fatura' : 'e-Arşiv',
          status: 'kesildi',
          issuedAt: now,
        }
      }
      update((d) => {
        if (!user) {
          user = {
            id: order.userId,
            name: input.buyer.name,
            email: input.buyer.email,
            phone: input.buyer.phone,
            role: 'student',
            avatar: '',
            createdAt: now,
            brandIds: [input.brand.id],
          }
          d.users.push(user)
        } else {
          const u = d.users.find((x) => x.id === user!.id)!
          if (!u.brandIds.includes(input.brand.id)) u.brandIds.push(input.brand.id)
        }
        d.orders.unshift(order)
        if (input.cardOk) {
          input.pkg.courseIds.forEach((courseId) => {
            if (!d.enrollments.some((e) => e.userId === order.userId && e.courseId === courseId))
              d.enrollments.push({ userId: order.userId, courseId, orderId: order.id, createdAt: now })
          })
          d.currentUserId = order.userId
        }
      })
      return order
    },
    [update],
  )

  const completeLesson = useCallback(
    (lessonId: string, quiz?: { score: number; total: number }) => {
      const uid = ref.current.currentUserId
      if (!uid) return
      update((d) => {
        d.progress[uid] ??= {}
        const prev = d.progress[uid][lessonId] ?? { completed: false }
        d.progress[uid][lessonId] = {
          ...prev,
          completed: true,
          completedAt: prev.completedAt ?? new Date().toISOString(),
          ...(quiz ? { quizScore: quiz.score, quizTotal: quiz.total } : {}),
        }
      })
    },
    [update],
  )

  const value = useMemo<Ctx>(
    () => ({
      state,
      me: state.users.find((u) => u.id === state.currentUserId) ?? null,
      update,
      login: (userId) => update((d) => void (d.currentUserId = userId)),
      reset: () => {
        const s = seed()
        s.currentUserId = ref.current.currentUserId
        setState(s)
      },
      findLesson: (id) => findLessonIn(state, id),
      runAi,
      checkout,
      completeLesson,
    }),
    [state, update, runAi, checkout, completeLesson],
  )

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('StoreProvider eksik')
  return c
}

/* ------------ yardımcılar ------------ */

export const tl = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n)

export const fmtDate = (iso: string, withTime = false) =>
  new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : { year: 'numeric' }),
  }).format(new Date(iso))

export const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`

export const lessonsOf = (c: Course) => c.sections.flatMap((s) => s.lessons)

export const approvedQuestions = (l: Lesson): Question[] =>
  l.ai.status === 'approved' ? l.ai.questions.filter((q) => q.approved) : []

export const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
