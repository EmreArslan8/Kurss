import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Course, Lesson, Question } from '../../data/types'
import { approvedQuestions, fmtDate, lessonsOf, mmss, useStore } from '../../lib/store'
import { PageHead } from '../../components/Shell'
import { BrandMark, Icon, Img, VideoEmbed } from '../../components/ui'
import { brandStyle } from '../public/Landing'

function useMyCourses() {
  const { state, me } = useStore()
  const ids = state.enrollments.filter((e) => e.userId === me?.id).map((e) => e.courseId)
  const courses = state.courses.filter((c) => ids.includes(c.id))
  const prog = (me && state.progress[me.id]) || {}
  const pct = (c: Course) => {
    const ls = lessonsOf(c)
    return ls.length ? Math.round((ls.filter((l) => prog[l.id]?.completed).length / ls.length) * 100) : 0
  }
  const next = (c: Course) => lessonsOf(c).find((l) => !prog[l.id]?.completed) ?? lessonsOf(c)[0]
  return { courses, prog, pct, next }
}

export function StudentHome() {
  const { state, me } = useStore()
  const { courses, prog, pct, next } = useMyCourses()
  const started = courses.filter((c) => pct(c) > 0 && pct(c) < 100).sort((a, b) => pct(b) - pct(a))
  const current = started[0] ?? courses[0]
  const quizzes = Object.values(prog).filter((p) => p.quizTotal)
  const avg = quizzes.length ? Math.round((quizzes.reduce((a, p) => a + (p.quizScore ?? 0) / (p.quizTotal ?? 1), 0) / quizzes.length) * 100) : null
  const doneCount = Object.values(prog).filter((p) => p.completed).length

  return (
    <>
      <PageHead kicker={new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())} title={<>Merhaba {me!.name.split(' ')[0]}, kaldığın yerden.</>} />

      {current && (
        <Link to={`/ogrenci/kurs/${current.id}/${next(current).id}`} className="continue" style={brandStyle(state.brands.find((b) => b.id === current.brandId)!)}>
          <Img src={current.cover} alt={current.title} />
          <div className="body">
            <span className="label">Devam et · {state.brands.find((b) => b.id === current.brandId)?.name}</span>
            <h3>{next(current).title}</h3>
            <span style={{ opacity: 0.75, fontSize: 14 }}>
              {current.title} · {mmss(next(current).duration)} dk
            </span>
            <div className="progress"><i style={{ width: `${pct(current)}%`, background: 'var(--paper)' }} /></div>
            <span className="row" style={{ gap: 8, fontSize: 14 }}>
              <Icon name="play" size={14} /> Derse dön
            </span>
          </div>
        </Link>
      )}

      <div className="kpis" style={{ marginTop: 20 }}>
        <div><span className="label">Eğitim</span><b>{courses.length}</b><small>aktif kayıt</small></div>
        <div><span className="label">Tamamlanan</span><b>{doneCount}</b><small>ders</small></div>
        <div><span className="label">Test ortalaması</span><b>{avg === null ? '—' : `%${avg}`}</b><small>{quizzes.length} test</small></div>
        <div><span className="label">Seri</span><b>3</b><small>gün üst üste</small></div>
      </div>

      <section className="psec">
        <header><h2 className="serif">Eğitimlerim</h2></header>
        {courses.length === 0 && <div className="card empty">Henüz bir eğitime kaydın yok.</div>}
        <div className="courses">
          {courses.map((c) => {
            const b = state.brands.find((x) => x.id === c.brandId)!
            const p = pct(c)
            return (
              <Link key={c.id} to={`/ogrenci/kurs/${c.id}`} className="ccard" style={brandStyle(b)}>
                <Img src={c.cover} alt={c.title} />
                <div className="body">
                  <span className="row" style={{ gap: 8 }}>
                    <BrandMark brand={b} size={20} />
                    <span className="label">{b.name}</span>
                  </span>
                  <h3>{c.title}</h3>
                  <div className="progress"><i style={{ width: `${p}%` }} /></div>
                  <div className="row muted" style={{ justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{lessonsOf(c).length} ders · {c.sections.length} bölüm</span>
                    <b style={{ color: 'var(--ink)' }}>%{p}</b>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}

export function StudentOrders() {
  const { state, me } = useStore()
  const orders = state.orders.filter((o) => o.userId === me?.id)
  return (
    <>
      <PageHead kicker="Hesap" title="Siparişler & faturalar" />
      <div className="card tablewrap">
        <table className="table">
          <thead><tr><th>Sipariş</th><th>Paket</th><th>Tarih</th><th>Fatura</th><th className="num">Tutar</th></tr></thead>
          <tbody>
            {orders.map((o) => {
              const p = state.packages.find((x) => x.id === o.packageId)
              return (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td>{p?.title}</td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td>{o.invoice ? <span className="tag ok"><Icon name="down" size={12} /> {o.invoice.no}</span> : '—'}</td>
                  <td className="num">{new Intl.NumberFormat('tr-TR').format(o.amount)} ₺</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function CoursePlayer() {
  const { courseId, lessonId } = useParams()
  const { state, me, completeLesson } = useStore()
  const nav = useNavigate()
  const course = state.courses.find((c) => c.id === courseId)
  const enrolled = state.enrollments.some((e) => e.userId === me?.id && e.courseId === courseId)
  const lessons = course ? lessonsOf(course) : []
  const prog = (me && state.progress[me.id]) || {}
  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons.find((l) => !prog[l.id]?.completed) ?? lessons[0]
  const [showQuiz, setShowQuiz] = useState(false)
  const [watchedPct, setWatchedPct] = useState(0)

  useEffect(() => {
    setShowQuiz(false)
    setWatchedPct(0)
    window.scrollTo({ top: 0 })
  }, [lesson?.id])

  if (!course || !enrolled) return <Navigate to="/ogrenci" replace />
  if (!lesson) return null
  const brand = state.brands.find((b) => b.id === course.brandId)!
  const idx = lessons.indexOf(lesson)
  const nextLesson = lessons[idx + 1]
  const qs = approvedQuestions(lesson)
  const done = !!prog[lesson.id]?.completed
  const pct = Math.round((lessons.filter((l) => prog[l.id]?.completed).length / lessons.length) * 100)
  const section = course.sections.find((s) => s.lessons.includes(lesson))!

  const finishVideo = () => {
    if (qs.length) setShowQuiz(true)
    else completeLesson(lesson.id)
  }

  return (
    <div className="player" style={brandStyle(brand)}>
      <div className="player-main">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' }}>
          <Link to="/ogrenci" className="row muted" style={{ gap: 6, textDecoration: 'none', fontSize: 14 }}>
            <Icon name="back" size={15} /> Eğitimlerim
          </Link>
          <span className="row" style={{ gap: 8 }}>
            <BrandMark brand={brand} size={20} />
            <span className="label">{course.title}</span>
          </span>
        </div>

        <VideoEmbed
          key={lesson.id}
          url={lesson.videoUrl}
          poster={course.cover}
          onEnded={finishVideo}
          onTime={(t, d) => d && setWatchedPct(Math.round((t / d) * 100))}
        />

        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20, gap: 20, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span className="label">{section.title} · ders {idx + 1}/{lessons.length}</span>
            <h1 className="serif" style={{ fontSize: 'clamp(30px,3.4vw,44px)', lineHeight: 1.02, marginTop: 6 }}>{lesson.title}</h1>
            <p className="muted" style={{ marginTop: 10, maxWidth: 640 }}>{lesson.summary}</p>
          </div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {done ? (
              <span className="tag ok"><Icon name="check" size={13} /> tamamlandı{prog[lesson.id]?.quizTotal ? ` · test ${prog[lesson.id]!.quizScore}/${prog[lesson.id]!.quizTotal}` : ''}</span>
            ) : (
              <button className="btn accent" onClick={finishVideo}>
                {qs.length ? <>Teste geç <Icon name="arrow" /></> : <>Tamamlandı olarak işaretle <Icon name="check" /></>}
              </button>
            )}
            {nextLesson && (
              <button className="btn ghost" onClick={() => nav(`/ogrenci/kurs/${course.id}/${nextLesson.id}`)}>
                Sonraki <Icon name="chev" />
              </button>
            )}
          </div>
        </div>
        {watchedPct > 0 && !done && <div className="mono muted" style={{ marginTop: 8 }}>izlendi %{watchedPct}</div>}

        {lesson.docs.length > 0 && (
          <section className="psec">
            <header><h2 className="serif" style={{ fontSize: 22 }}>Ders dokümanları</h2><span className="label">{lesson.docs.length} dosya</span></header>
            <div className="docs">
              {lesson.docs.map((d) => (
                <a key={d.id} className="doc" href="#" onClick={(e) => e.preventDefault()}>
                  <span className={`ext ${d.kind}`}>{d.kind}</span>
                  <span style={{ flex: 1 }}>{d.name}</span>
                  <span className="mono faint">{d.size}</span>
                  <Icon name="down" />
                </a>
              ))}
            </div>
          </section>
        )}

        {(showQuiz || (done && qs.length > 0)) && qs.length > 0 && (
          <section className="psec">
            <Quiz
              key={lesson.id + String(done)}
              questions={qs}
              reviewOnly={done && !showQuiz}
              onFinish={(score) => {
                completeLesson(lesson.id, { score, total: qs.length })
              }}
              onNext={nextLesson ? () => nav(`/ogrenci/kurs/${course.id}/${nextLesson.id}`) : undefined}
              onRetry={() => setShowQuiz(true)}
            />
          </section>
        )}
        {!qs.length && (
          <p className="mono faint" style={{ marginTop: 28 }}>Bu ders için eğitmen onaylı test henüz yayında değil.</p>
        )}
      </div>

      <aside className="player-side outline">
        <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid var(--line-2)', display: 'grid', gap: 10 }}>
          <b style={{ fontWeight: 600 }}>{course.title}</b>
          <div className="progress"><i style={{ width: `${pct}%` }} /></div>
          <span className="mono muted">%{pct} tamamlandı</span>
        </div>
        {course.sections.map((s, si) => (
          <div className="sec" key={s.id}>
            <header>
              <span className="label">{String(si + 1).padStart(2, '0')} · {s.title}</span>
            </header>
            {s.lessons.map((l) => {
              const p = prog[l.id]
              return (
                <Link key={l.id} to={`/ogrenci/kurs/${course.id}/${l.id}`} className={l.id === lesson.id ? 'on' : ''}>
                  <span className={`tick ${p?.completed ? 'done' : ''}`}>{p?.completed && <Icon name="check" size={11} stroke={3} />}</span>
                  <span>
                    {l.title}
                    {approvedQuestions(l).length > 0 && <span className="mono faint" style={{ display: 'block', fontSize: 11 }}>+ {approvedQuestions(l).length} soruluk test</span>}
                  </span>
                  <span className="mono faint">{mmss(l.duration)}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </aside>
    </div>
  )
}

function Quiz({
  questions,
  onFinish,
  onNext,
  onRetry,
  reviewOnly,
}: {
  questions: Question[]
  onFinish: (score: number) => void
  onNext?: () => void
  onRetry: () => void
  reviewOnly?: boolean
}) {
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [finished, setFinished] = useState(!!reviewOnly)
  const q = questions[i]
  const picked = answers[i]
  const score = useMemo(() => answers.filter((a, k) => a === questions[k].answer).length, [answers, questions])
  const keys = 'ABCDE'

  if (finished) {
    return (
      <div className="quiz">
        <div className="quiz-head">
          <span className="label">Pekiştirme testi</span>
          <span className="mono">{reviewOnly ? 'tamamlandı' : `${score}/${questions.length} doğru`}</span>
        </div>
        <div className="quiz-body">
          <div className="quiz-q">
            {reviewOnly ? 'Bu dersin testini tamamladın.' : score === questions.length ? 'Kusursuz. Bir sonraki derse hazırsın.' : score >= questions.length / 2 ? 'İyi gidiyor. Kaçırdıklarına bir göz at.' : 'Bu konuyu bir kez daha izlemek iyi olabilir.'}
          </div>
          {!reviewOnly && (
            <div style={{ display: 'grid', gap: 8 }}>
              {questions.map((x, k) => (
                <div key={x.id} className="row" style={{ alignItems: 'flex-start', fontSize: 14 }}>
                  <span className={`tag ${answers[k] === x.answer ? 'ok' : 'bad'}`}>{answers[k] === x.answer ? 'doğru' : 'yanlış'}</span>
                  <span>{x.text} <span className="muted">— {x.options[x.answer]}</span></span>
                </div>
              ))}
            </div>
          )}
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {onNext && <button className="btn accent" onClick={onNext}>Sonraki ders <Icon name="arrow" /></button>}
            <button className="btn ghost" onClick={() => { setAnswers(questions.map(() => null)); setI(0); setFinished(false); onRetry() }}>Testi tekrar çöz</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz">
      <div className="quiz-head">
        <span className="label">Pekiştirme testi · soru {i + 1}/{questions.length}</span>
        <span className="qdots">
          {questions.map((x, k) => (
            <i key={x.id} className={k === i ? 'cur' : answers[k] === null ? '' : answers[k] === x.answer ? 'ok' : 'no'} />
          ))}
        </span>
      </div>
      <div className="quiz-body">
        <div className="quiz-q">{q.text}</div>
        <div className="opts">
          {q.options.map((o, k) => {
            const state = picked === null ? '' : k === q.answer ? 'right' : k === picked ? 'wrong' : ''
            return (
              <button key={k} className={`opt ${state}`} disabled={picked !== null} onClick={() => setAnswers(answers.map((a, j) => (j === i ? k : a)))}>
                <span className="k">{keys[k]}</span>
                <span>{o}</span>
                {state === 'right' && <Icon name="check" />}
                {state === 'wrong' && <Icon name="x" />}
              </button>
            )
          })}
        </div>
        {picked !== null && <div className="explain">{q.explanation}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          {picked !== null &&
            (i < questions.length - 1 ? (
              <button className="btn" onClick={() => setI(i + 1)}>Sonraki soru <Icon name="arrow" /></button>
            ) : (
              <button
                className="btn accent"
                onClick={() => {
                  setFinished(true)
                  onFinish(score)
                }}
              >
                Sonucu gör <Icon name="arrow" />
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

export type { Lesson }
