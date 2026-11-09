import { useEffect, useState, type CSSProperties } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { Brand, Course, Package, VideoTestimonial } from '../../data/types'
import { lessonsOf, tl, useStore } from '../../lib/store'
import { Avatar, BrandMark, Icon, Img, Rich, Stars, VideoEmbed } from '../../components/ui'

export const brandStyle = (b: Brand) => ({ '--accent': b.accent, '--accent-soft': b.accentSoft }) as CSSProperties

export default function LandingRoute() {
  const { slug } = useParams()
  const { state } = useStore()
  const brand = state.brands.find((b) => b.slug === slug)
  if (!brand) return <Navigate to="/" replace />
  const pkgs = state.packages.filter((p) => p.brandId === brand.id && p.active)
  const courses = state.courses.filter((c) => c.brandId === brand.id)
  return <LandingView brand={brand} packages={pkgs} courses={courses} />
}

export function LandingView({ brand, packages, courses, embedded }: { brand: Brand; packages: Package[]; courses: Course[]; embedded?: boolean }) {
  const { me } = useStore()
  const L = brand.landing
  const [sticky, setSticky] = useState(false)
  const [playing, setPlaying] = useState<VideoTestimonial | null>(null)

  useEffect(() => {
    if (embedded) return
    document.title = `${brand.name} — ${brand.tagline}`
    const on = () => setSticky(window.scrollY > 700)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [brand, embedded])

  const cheapest = [...packages].sort((a, b) => a.price - b.price)[0]
  const lessonCount = (p: Package) => p.courseIds.reduce((n, id) => n + (courses.find((c) => c.id === id) ? lessonsOf(courses.find((c) => c.id === id)!).length : 0), 0)
  let n = 0
  const num = () => `§ 0${++n}`

  return (
    <div className="lp" style={brandStyle(brand)}>
      {!embedded && me?.role === 'admin' && (
        <Link to={`/yonetim/markalar/${brand.id}`} className="lp-edit">
          <Icon name="edit" size={14} /> Bu sayfayı düzenle
        </Link>
      )}

      <div className="lp-wrap">
        <nav className="lp-nav">
          <a className="brand" href="#top">
            <BrandMark brand={brand} />
            {brand.name}
          </a>
          <div className="links">
            <a className="hide-sm" href="#yorumlar">Yorumlar</a>
            <a className="hide-sm" href="#paket">Paketler</a>
            <a className="hide-sm" href="#sss">SSS</a>
            {me?.role === 'student' ? (
              <Link className="btn sm ghost" to="/ogrenci">Derslerim</Link>
            ) : (
              <Link className="btn sm ghost" to="/giris">Giriş</Link>
            )}
          </div>
        </nav>

        <header className="lp-hero" id="top">
          <div>
            <div className="eyebrow label">{L.eyebrow}</div>
            <h1>
              <Rich text={L.headline} />
            </h1>
          </div>
          <div className="note">
            <p>{L.subheadline}</p>
            {L.stats.length > 0 && (
              <div className="stats">
                {L.stats.map((s, i) => (
                  <div key={i}>
                    <b>{s.value}</b>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <a className="btn accent lg" href="#paket">
                {L.ctaLabel} <Icon name="arrow" />
              </a>
              {cheapest && <span className="muted" style={{ fontSize: 13 }}>{tl(cheapest.price)}’den başlayan</span>}
            </div>
          </div>
        </header>

        {L.vslUrl && (
          <div className="lp-vsl">
            <div className="sticker">önce bunu izle</div>
            <div className="frame">
              <VideoEmbed url={L.vslUrl} poster={L.vslPoster} />
            </div>
            <div className="cap">
              <span className="label">VSL</span>
              <span className="muted" style={{ fontSize: 13 }}>{L.vslCaption}</span>
            </div>
          </div>
        )}

        {L.videoTestimonials.length > 0 && (
          <section className="lp-sec" id="yorumlar">
            <div className="lp-head">
              <span className="n">{num()}</span>
              <h2>
                Onlar anlatsın.
              </h2>
              <span className="label">{L.videoTestimonials.length} video</span>
            </div>
            <div className="lp-reels">
              {L.videoTestimonials.map((v) => (
                <button key={v.id} className="reel" onClick={() => setPlaying(v)}>
                  <Img src={v.poster} alt={v.name} />
                  {playing?.id === v.id ? (
                    <video src={v.videoUrl} autoPlay controls playsInline onEnded={() => setPlaying(null)} />
                  ) : (
                    <>
                      <span className="pill">
                        <Icon name="play" size={10} /> izle
                      </span>
                      <span className="meta">
                        <q>{v.quote}</q>
                        <small>
                          {v.name} · {v.role}
                        </small>
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {L.textTestimonials.length > 0 && (
          <section className="lp-sec" id={L.videoTestimonials.length ? undefined : 'yorumlar'}>
            <div className="lp-head">
              <span className="n">{num()}</span>
              <h2>
                Yazdıkları, olduğu gibi.
              </h2>
              <span className="label">düzenlenmemiş</span>
            </div>
            <div className="lp-quotes">
              {L.textTestimonials.map((t) => (
                <figure className="quote" key={t.id}>
                  <Stars n={t.rating} />
                  <p>{t.text}</p>
                  <footer>
                    <Avatar src={t.avatar} name={t.name} size={36} />
                    <span>
                      <b>{t.name}</b>
                      <span className="muted">{t.role}</span>
                    </span>
                  </footer>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="lp-sec" id="paket">
          <div className="lp-head">
            <span className="n">{num()}</span>
            <h2>
              Ne alıyorsun?
            </h2>
            <span className="label">tek seferlik ödeme</span>
          </div>
          <div className="lp-buy">
            <div className="intro">
              <h3>Program içeriği</h3>
              {courses
                .filter((c) => packages.some((p) => p.courseIds.includes(c.id)))
                .map((c) => (
                  <div key={c.id} style={{ marginBottom: 18 }}>
                    <div className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
                      <b style={{ fontWeight: 600 }}>{c.title}</b>
                      <span className="label">{lessonsOf(c).length} ders</span>
                    </div>
                    {c.sections.map((s, i) => (
                      <div key={s.id} className="row" style={{ padding: '7px 0', fontSize: 14, gap: 14, color: 'var(--ink-2)' }}>
                        <span className="mono faint">{String(i + 1).padStart(2, '0')}</span>
                        <span style={{ flex: 1 }}>{s.title}</span>
                        <span className="muted" style={{ fontSize: 12.5 }}>{s.lessons.length} video</span>
                      </div>
                    ))}
                  </div>
                ))}
              <Img src={L.heroImage} alt={brand.name} />
            </div>
            <div className="pkgs">
              {packages.length === 0 && <div className="receipt"><p className="muted">Bu marka için henüz paket tanımlanmadı.</p></div>}
              {packages.map((p) => (
                <div key={p.id} className={`receipt ${p.badge ? 'featured' : ''}`}>
                  <div className="rtop">
                    <span>{brand.name} · paket</span>
                    {p.badge ? <span className="badge">{p.badge}</span> : <span>{lessonCount(p)} ders</span>}
                  </div>
                  <h4>{p.title}</h4>
                  <ul>
                    {p.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  <div className="dash" />
                  <div className="total">
                    <div>
                      {p.oldPrice && <s>{tl(p.oldPrice)}</s>}
                      <div className="price">{tl(p.price)}</div>
                      <span className="muted" style={{ fontSize: 12.5 }}>
                        {p.installments > 1 ? `${p.installments} taksite kadar · ` : ''}KDV dahil
                      </span>
                    </div>
                    {embedded ? (
                      <span className="btn accent">{L.ctaLabel}</span>
                    ) : (
                      <Link className="btn accent" to={`/${brand.slug}/odeme/${p.id}`}>
                        {L.ctaLabel} <Icon name="arrow" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              <div className="guarantee">
                <Icon name="shield" size={20} />
                <span>{L.guarantee}</span>
              </div>
              <div className="row muted" style={{ fontSize: 12.5, gap: 16, flexWrap: 'wrap' }}>
                <span className="row" style={{ gap: 6 }}><Icon name="lock" size={14} /> PayTR güvenli ödeme</span>
                <span className="row" style={{ gap: 6 }}><Icon name="receipt" size={14} /> Otomatik e-Arşiv / e-Fatura</span>
              </div>
            </div>
          </div>
        </section>

        {L.faq.length > 0 && (
          <section className="lp-sec" id="sss">
            <div className="lp-head">
              <span className="n">{num()}</span>
              <h2>
                Sıkça sorulanlar
              </h2>
              <span className="label">{L.faq.length} soru</span>
            </div>
            <div className="faq">
              {L.faq.map((f, i) => (
                <details key={f.id} open={i === 0}>
                  <summary>
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <span>{f.q}</span>
                    <span className="pm">+</span>
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <div className="big">
            <Rich text={L.headline} />
          </div>
          <div style={{ marginTop: 28 }}>
            <a className="btn lg" href="#paket">
              {L.ctaLabel} <Icon name="arrow" />
            </a>
          </div>
          <div className="meta">
            <span>
              © 2026 {brand.name} · {brand.invoiceTitle} · VKN {brand.taxNo}
            </span>
            <span>Mesafeli satış sözleşmesi · KVKK · İade koşulları</span>
          </div>
        </div>
      </footer>

      {!embedded && cheapest && (
        <div className={`lp-sticky ${sticky ? 'on' : ''}`}>
          <span style={{ fontSize: 13 }}>
            {cheapest.title}
            <br />
            <b>{tl(cheapest.price)}</b>
          </span>
          <a className="btn" href="#paket">{L.ctaLabel}</a>
        </div>
      )}
    </div>
  )
}
