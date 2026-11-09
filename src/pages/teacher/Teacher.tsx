import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Doc, Lesson, Question } from '../../data/types'
import { fmtDate, lessonsOf, mmss, uid, useStore } from '../../lib/store'
import { PageHead } from '../../components/Shell'
import { BrandMark, Icon, Img, useToast, VideoEmbed } from '../../components/ui'
import { video } from '../../data/media'

const aiTag = (l: Lesson) =>
  ({
    none: <span className="tag">soru yok</span>,
    running: <span className="tag warn"><span className="spin" style={{ width: 10, height: 10 }} /> analiz</span>,
    review: <span className="tag warn"><span className="dot" /> onay bekliyor</span>,
    approved: <span className="tag ok"><Icon name="check" size={12} /> {l.ai.questions.filter((q) => q.approved).length} soru yayında</span>,
  })[l.ai.status]

export function useTeacherCourses() {
  const { state, me } = useStore()
  return state.courses.filter((c) => c.teacherId === me?.id)
}

export function TeacherHome() {
  const { state, me } = useStore()
  const courses = useTeacherCourses()
  const all = courses.flatMap((c) => lessonsOf(c).map((l) => ({ c, l })))
  const pending = all.filter((x) => x.l.ai.status === 'review')
  const none = all.filter((x) => x.l.ai.status === 'none')
  const students = new Set(state.enrollments.filter((e) => courses.some((c) => c.id === e.courseId)).map((e) => e.userId)).size

  return (
    <>
      <PageHead kicker="Eğitmen paneli" title={<>Merhaba {me!.name.split(' ')[0]}.</>} />
      <div className="kpis">
        <div><span className="label">Eğitim</span><b>{courses.length}</b><small>{all.length} ders</small></div>
        <div><span className="label">Öğrenci</span><b>{students}</b><small>kayıtlı</small></div>
        <div><span className="label">Onay bekleyen</span><b>{pending.length}</b><small>AI soru seti</small></div>
        <div><span className="label">Testsiz ders</span><b>{none.length}</b><small>analiz edilmedi</small></div>
      </div>

      {pending.length > 0 && (
        <section className="psec">
          <header><h2 className="serif">Onayını bekleyenler</h2><span className="label">öğrenciler onaydan sonra görür</span></header>
          <div className="card">
            {pending.map(({ c, l }) => (
              <Link key={l.id} to={`/egitmen/kurs/${c.id}/${l.id}`} className="lessonrow">
                <Icon name="spark" />
                <span><b style={{ fontWeight: 500 }}>{l.title}</b> <span className="muted">· {c.title}</span></span>
                <span className="mono faint">{l.ai.questions.length} soru</span>
                <Icon name="chev" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="psec">
        <header><h2 className="serif">Eğitimlerim</h2></header>
        <div className="courses">
          {courses.map((c) => {
            const b = state.brands.find((x) => x.id === c.brandId)!
            const ls = lessonsOf(c)
            const ok = ls.filter((l) => l.ai.status === 'approved').length
            return (
              <Link key={c.id} to={`/egitmen/kurs/${c.id}`} className="ccard" style={{ '--accent': b.accent } as React.CSSProperties}>
                <Img src={c.cover} alt={c.title} />
                <div className="body">
                  <span className="row" style={{ gap: 8 }}><BrandMark brand={b} size={20} /><span className="label">{b.name}</span></span>
                  <h3>{c.title}</h3>
                  <div className="progress"><i style={{ width: `${(ok / ls.length) * 100}%` }} /></div>
                  <span className="muted" style={{ fontSize: 13 }}>{ok}/{ls.length} dersin testi yayında</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}

export function CourseEditor() {
  const { courseId, lessonId } = useParams()
  const { state, me, update } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const isAdmin = useLocation().pathname.startsWith('/yonetim')
  const base = isAdmin ? '/yonetim/egitimler' : '/egitmen/kurs'
  const course = state.courses.find((c) => c.id === courseId)
  if (!course || (me?.role === 'teacher' && course.teacherId !== me.id)) return <Navigate to={isAdmin ? '/yonetim/egitimler' : '/egitmen'} replace />
  const lesson = lessonId ? lessonsOf(course).find((l) => l.id === lessonId) : undefined
  const brand = state.brands.find((b) => b.id === course.brandId)!

  const addSection = () =>
    update((d) => {
      d.courses.find((c) => c.id === course.id)!.sections.push({ id: uid('s'), title: 'Yeni bölüm', lessons: [] })
    })

  const addLesson = (sectionId: string) => {
    const id = uid('l')
    update((d) => {
      d.courses
        .find((c) => c.id === course.id)!
        .sections.find((s) => s.id === sectionId)!
        .lessons.push({ id, title: 'Adsız ders', duration: 0, videoUrl: '', summary: '', docs: [], ai: { status: 'none', questions: [] } })
    })
    nav(`${base}/${course.id}/${id}`)
  }

  return (
    <>
      <PageHead
        kicker={
          <span className="row" style={{ gap: 8 }}>
            <Link to={isAdmin ? '/yonetim/egitimler' : '/egitmen'} style={{ textDecoration: 'none' }}>Eğitimler</Link> / <BrandMark brand={brand} size={16} /> {brand.name}
          </span>
        }
        title={course.title}
      >
        <button className="btn ghost" onClick={addSection}><Icon name="plus" /> Bölüm ekle</button>
      </PageHead>

      <div className="split" style={{ gridTemplateColumns: 'minmax(300px, 400px) 1fr' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {course.sections.map((s, si) => (
            <div key={s.id} style={{ borderTop: si ? '1px solid var(--line)' : 0 }}>
              <div className="row" style={{ padding: '12px 14px 6px', justifyContent: 'space-between' }}>
                <input
                  className="input"
                  style={{ border: 0, background: 'transparent', padding: 0, fontWeight: 600 }}
                  value={s.title}
                  onChange={(e) => update((d) => void (d.courses.find((c) => c.id === course.id)!.sections[si].title = e.target.value))}
                />
                <span className="label">{String(si + 1).padStart(2, '0')}</span>
              </div>
              {s.lessons.map((l) => (
                <Link key={l.id} to={`${base}/${course.id}/${l.id}`} className="lessonrow" style={{ background: l.id === lessonId ? 'var(--accent-soft)' : undefined, gridTemplateColumns: '1fr auto' }}>
                  <span style={{ fontSize: 14 }}>
                    {l.title}
                    <span className="mono faint" style={{ display: 'block', fontSize: 11 }}>{l.videoUrl ? mmss(l.duration) : 'video yok'} · {l.docs.length} doküman</span>
                  </span>
                  {aiTag(l)}
                </Link>
              ))}
              <button className="linkbtn" style={{ padding: '8px 14px 14px', fontSize: 13 }} onClick={() => addLesson(s.id)}>+ ders ekle</button>
            </div>
          ))}
        </div>

        <div>{lesson ? <LessonEditor key={lesson.id} courseId={course.id} lesson={lesson} toast={toast.show} /> : <div className="card empty">Düzenlemek için soldan bir ders seç.</div>}</div>
      </div>
      {toast.node}
    </>
  )
}

function LessonEditor({ courseId, lesson, toast }: { courseId: string; lesson: Lesson; toast: (m: string) => void }) {
  const { update, runAi, state } = useStore()
  const [uploading, setUploading] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)

  const patch = (fn: (l: Lesson) => void) =>
    update((d) => {
      for (const s of d.courses.find((c) => c.id === courseId)!.sections) {
        const l = s.lessons.find((x) => x.id === lesson.id)
        if (l) fn(l)
      }
    })

  const fakeUpload = (name: string) => {
    setUploading(0)
    let p = 0
    const t = setInterval(() => {
      p += 7 + Math.random() * 12
      if (p >= 100) {
        clearInterval(t)
        setUploading(null)
        patch((l) => {
          l.videoUrl = video.a
          l.duration = 600 + Math.round(Math.random() * 600)
          if (l.title === 'Adsız ders') l.title = name.replace(/\.[^.]+$/, '')
        })
        toast('Video yüklendi ve işlendi (HLS)')
      } else setUploading(Math.round(p))
    }, 180)
  }

  const addDoc = (file: File) => {
    const ext = (file.name.split('.').pop() ?? 'pdf').toLowerCase()
    const kind: Doc['kind'] = ext === 'xlsx' || ext === 'xls' ? 'xlsx' : ext === 'zip' ? 'zip' : ext === 'docx' ? 'docx' : 'pdf'
    const size = file.size > 1e6 ? `${(file.size / 1e6).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(file.size / 1e3))} KB`
    patch((l) => l.docs.push({ id: uid('d'), name: file.name, kind, size }))
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="blk">
        <div className="blk-head"><b>Video</b>{lesson.videoUrl && <span className="mono faint">{mmss(lesson.duration)}</span>}</div>
        {lesson.videoUrl ? (
          <div style={{ borderRadius: 12, overflow: 'hidden' }}>
            <VideoEmbed key={lesson.videoUrl} url={lesson.videoUrl} />
          </div>
        ) : (
          <label className="dropzone">
            {uploading === null ? (
              <>
                <Icon name="upload" size={22} />
                <b style={{ color: 'var(--ink)' }}>Video dosyasını seç ya da sürükle</b>
                <span style={{ fontSize: 13 }}>MP4 / MOV · 4 GB’a kadar</span>
              </>
            ) : (
              <>
                <b style={{ color: 'var(--ink)' }}>Yükleniyor… %{uploading}</b>
                <div className="progress" style={{ width: '60%' }}><i style={{ width: `${uploading}%` }} /></div>
              </>
            )}
            <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => e.target.files?.[0] && fakeUpload(e.target.files[0].name)} />
          </label>
        )}
        {!lesson.videoUrl && uploading === null && (
          <button className="linkbtn" style={{ fontSize: 13, justifySelf: 'start' }} onClick={() => fakeUpload('Örnek ders.mp4')}>
            ya da örnek video ile dene
          </button>
        )}
        <label className="field"><span>Ders başlığı</span><input className="input" value={lesson.title} onChange={(e) => patch((l) => void (l.title = e.target.value))} /></label>
        <label className="field"><span>Kısa açıklama</span><textarea className="textarea" value={lesson.summary} onChange={(e) => patch((l) => void (l.summary = e.target.value))} /></label>
      </div>

      <div className="blk">
        <div className="blk-head">
          <b>Dokümanlar</b>
          <button className="btn sm ghost" onClick={() => docRef.current?.click()}><Icon name="plus" size={14} /> Dosya ekle</button>
          <input ref={docRef} type="file" hidden accept=".pdf,.xlsx,.xls,.docx,.zip" onChange={(e) => e.target.files?.[0] && addDoc(e.target.files[0])} />
        </div>
        {lesson.docs.length === 0 && <span className="muted" style={{ fontSize: 14 }}>PDF, Excel, Word ya da ZIP ekleyebilirsin. Öğrenci dersin altında görür.</span>}
        <div className="docs">
          {lesson.docs.map((d) => (
            <div key={d.id} className="doc">
              <span className={`ext ${d.kind}`}>{d.kind}</span>
              <span style={{ flex: 1 }}>{d.name}</span>
              <span className="mono faint">{d.size}</span>
              <button className="iconbtn" onClick={() => patch((l) => void (l.docs = l.docs.filter((x) => x.id !== d.id)))} title="Kaldır"><Icon name="trash" size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <AiPanel courseId={courseId} lesson={lesson} patch={patch} runAi={() => runAi(lesson.id)} toast={toast} students={state.enrollments.filter((e) => e.courseId === courseId).length} />
    </div>
  )
}

function AiPanel({
  lesson,
  patch,
  runAi,
  toast,
  students,
}: {
  courseId: string
  lesson: Lesson
  patch: (fn: (l: Lesson) => void) => void
  runAi: () => void
  toast: (m: string) => void
  students: number
}) {
  const ai = lesson.ai
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (ai.status !== 'running') return
    setStep(0)
    const t = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 900)
    return () => clearInterval(t)
  }, [ai.status])

  const setQ = (qid: string, fn: (q: Question) => void) =>
    patch((l) => {
      const q = l.ai.questions.find((x) => x.id === qid)
      if (q) fn(q)
    })

  const approvedCount = ai.questions.filter((q) => q.approved).length

  return (
    <div className="ai-panel">
      <header>
        <span className="row" style={{ gap: 10 }}>
          <Icon name="spark" size={18} />
          <b style={{ fontWeight: 600 }}>Yapay zekâ ile test</b>
        </span>
        {ai.generatedAt && (
          <span className="mono faint">
            üretildi {fmtDate(ai.generatedAt, true)} · {ai.tokens?.toLocaleString('tr-TR')} token · ≈{ai.cost?.toFixed(2)} ₺
          </span>
        )}
      </header>

      {ai.status === 'none' && (
        <div style={{ padding: 18, display: 'grid', gap: 14 }}>
          <p style={{ fontSize: 14.5 }}>
            Video bir kez analiz edilir (transkript → konu çıkarımı → soru üretimi). Sorular onayından sonra kaydedilir ve <b>tüm öğrencilere aynı set</b> gösterilir. Öğrenci başına
            yeniden yapay zekâ çalıştırılmaz.
          </p>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn" disabled={!lesson.videoUrl} onClick={runAi}><Icon name="spark" /> Videoyu analiz et ve soru üret</button>
            {!lesson.videoUrl && <span className="muted" style={{ fontSize: 13 }}>Önce video yükle.</span>}
          </div>
        </div>
      )}

      {ai.status === 'running' && (
        <div className="ai-steps">
          {['Ses transkripte çevriliyor', 'Ana kavramlar çıkarılıyor', 'Çoktan seçmeli sorular yazılıyor', 'Açıklamalar ekleniyor'].map((s, i) => (
            <div key={s} className={i < step ? 'done' : i === step ? 'on' : ''}>
              {i < step ? <Icon name="check" size={15} /> : i === step ? <span className="spin" /> : <span style={{ width: 15 }} />}
              {s}
            </div>
          ))}
        </div>
      )}

      {(ai.status === 'review' || ai.status === 'approved') && (
        <>
          <div style={{ padding: '12px 18px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', background: ai.status === 'approved' ? 'var(--ok-soft)' : 'var(--warn-soft)' }}>
            {ai.status === 'approved' ? (
              <span style={{ fontSize: 14, color: 'var(--ok)' }}>
                <b>Yayında.</b> {approvedCount} soru {students} öğrenciye aynı şekilde sunuluyor. Ek yapay zekâ maliyeti: 0 ₺
              </span>
            ) : (
              <span style={{ fontSize: 14, color: 'var(--warn)' }}>
                <b>Taslak.</b> Soruları incele, düzenle; onayladıkların öğrencilere açılır.
              </span>
            )}
          </div>
          {ai.questions.map((q, qi) => (
            <div key={q.id} className={`qedit ${q.approved ? 'approved' : ''}`}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="label">Soru {qi + 1}{q.edited ? ' · düzenlendi' : ''}</span>
                <span className="row" style={{ gap: 6 }}>
                  <label className="check" style={{ fontSize: 13 }}>
                    <input type="checkbox" checked={q.approved} onChange={(e) => setQ(q.id, (x) => void (x.approved = e.target.checked))} /> onayla
                  </label>
                  <button className="iconbtn" title="Sil" onClick={() => patch((l) => void (l.ai.questions = l.ai.questions.filter((x) => x.id !== q.id)))}>
                    <Icon name="trash" size={14} />
                  </button>
                </span>
              </div>
              <textarea className="textarea" style={{ minHeight: 56 }} value={q.text} onChange={(e) => setQ(q.id, (x) => { x.text = e.target.value; x.edited = true })} />
              {q.options.map((o, oi) => (
                <div className="optrow" key={oi}>
                  <input type="radio" name={`ans-${q.id}`} title="Doğru cevap" checked={q.answer === oi} onChange={() => setQ(q.id, (x) => { x.answer = oi; x.edited = true })} />
                  <input className="input" value={o} onChange={(e) => setQ(q.id, (x) => { x.options[oi] = e.target.value; x.edited = true })} style={{ borderColor: q.answer === oi ? 'var(--ok)' : undefined }} />
                </div>
              ))}
              <label className="field"><span>Açıklama (yanlış cevapta gösterilir)</span>
                <input className="input" value={q.explanation} onChange={(e) => setQ(q.id, (x) => { x.explanation = e.target.value; x.edited = true })} />
              </label>
            </div>
          ))}
          <div className="qedit" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <button
              className="btn ghost sm"
              onClick={() =>
                patch((l) =>
                  void l.ai.questions.push({ id: uid('q'), text: 'Yeni soru', options: ['A seçeneği', 'B seçeneği', 'C seçeneği', 'D seçeneği'], answer: 0, explanation: '', approved: false, edited: true }),
                )
              }
            >
              <Icon name="plus" size={14} /> Elle soru ekle
            </button>
            <div className="row">
              {ai.status === 'review' && (
                <button className="btn ghost sm" onClick={() => patch((l) => l.ai.questions.forEach((q) => (q.approved = true)))}>Tümünü işaretle</button>
              )}
              <button
                className="btn sm"
                disabled={approvedCount === 0}
                onClick={() => {
                  patch((l) => {
                    l.ai.status = 'approved'
                    l.ai.approvedAt = new Date().toISOString()
                  })
                  toast(`${approvedCount} soru yayına alındı`)
                }}
              >
                <Icon name="check" size={14} /> {ai.status === 'approved' ? 'Değişiklikleri yayınla' : `${approvedCount} soruyu yayınla`}
              </button>
            </div>
          </div>
          <div className="mono faint" style={{ padding: '10px 18px 14px', fontSize: 11.5 }}>
            Bu video için üretim tamamlandı; tekrar analiz edilmez. Soruları düzenlemek ücretsizdir.
          </div>
        </>
      )}
    </div>
  )
}
