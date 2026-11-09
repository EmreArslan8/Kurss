import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonsOf, tl, useStore } from '../../lib/store'
import { Avatar, BrandMark, Icon, Img, KurssMark } from '../../components/ui'
import type { Brand } from '../../data/types'

/** Kurss ana sayfası — öğrenciye hitap eden çatı site. Tüm markaların programlarını listeler. */
export default function Hub() {
  const { state, me } = useStore()
  const [hover, setHover] = useState<string | null>(null)
  useEffect(() => {
    document.title = 'Kurss — meslek kazandıran kısa programlar'
  }, [])

  const programs = state.brands
    .map((b) => {
      const pkgs = state.packages.filter((p) => p.brandId === b.id && p.active)
      const courses = state.courses.filter((c) => c.brandId === b.id)
      const lessons = courses.reduce((n, c) => n + lessonsOf(c).length, 0)
      const from = pkgs.length ? Math.min(...pkgs.map((p) => p.price)) : null
      return { b, courses, lessons, from }
    })
    .sort((x, y) => Number(y.b.active) - Number(x.b.active))

  const quotes = state.brands.flatMap((b) => b.landing.textTestimonials.slice(0, 2).map((t) => ({ ...t, brand: b }))).slice(0, 4)
  const graduates = state.enrollments.length * 113
  const panel = me ? (me.role === 'admin' ? '/yonetim' : me.role === 'teacher' ? '/egitmen' : '/ogrenci') : '/giris'
  const hovered = programs.find((p) => p.b.id === hover)?.b

  return (
    <>
    <div className="home">
      <header className="home-nav">
        <Link to="/" className="row" style={{ gap: 10, fontWeight: 600, textDecoration: 'none', fontSize: 17 }}>
          <KurssMark /> Kurss
        </Link>
        <nav className="row" style={{ gap: 22 }}>
          <a href="#programlar" className="hide-sm">Programlar</a>
          <a href="#nasil" className="hide-sm">Nasıl işliyor</a>
          <Link to={panel} className="btn sm ghost">{me ? 'Hesabım' : 'Giriş yap'}</Link>
        </nav>
      </header>

      <section className="home-hero">
        <p className="label">Defter · Kadraj · Kumbara — tek hesapla</p>
        <h1>
          Diploma değil, <br />
          iş çıkaran bir dosya.
        </h1>
        <div className="home-hero-foot">
          <p>
            Kısa, uygulamalı programlar. Her derste gerçek bir iş yapıyorsun, her dersin sonunda kendini test ediyorsun. Bitirdiğinde elinde gösterebileceğin bir şey oluyor.
          </p>
          <a href="#programlar" className="home-scroll">
            <span>Programlara bak</span>
            <Icon name="arrow" size={18} style={{ rotate: '90deg' }} />
          </a>
        </div>
      </section>

      <section id="programlar" className="home-index">
        <div className="home-index-head">
          <span />
          <span className="label">Programlar</span>
          <span className="label">süre</span>
          <span className="label">ders</span>
          <span className="label" style={{ textAlign: 'right' }}>başlangıç</span>
        </div>
        <div className="home-index-list" onMouseLeave={() => setHover(null)}>
          {programs.map(({ b, courses, lessons, from }, i) => (
            <ProgramRow key={b.id} i={i} brand={b} title={courses[0]?.title ?? b.tagline} lessons={lessons} from={from} onHover={() => setHover(b.id)} />
          ))}
          <div className={`home-peek ${hovered ? 'on' : ''}`} aria-hidden>
            {hovered && <Img key={hovered.id} src={hovered.landing.heroImage} alt={hovered.name} />}
          </div>
        </div>
      </section>

      <section id="nasil" className="home-how">
        <h2>
          Bir ders nasıl geçer?
        </h2>
        <ol>
          <li>
            <span className="n">01</span>
            <b>İzle</b>
            <p>10–15 dakikalık video. Eğitmen konuyu gerçek bir örnek üzerinden anlatır, gereksiz teori yok.</p>
          </li>
          <li>
            <span className="n">02</span>
            <b>Uygula</b>
            <p>Dersin altındaki dosyayı indir: fatura klasörü, Excel şablonu, çekim kartı. Aynı işi sen yap.</p>
          </li>
          <li>
            <span className="n">03</span>
            <b>Kendini test et</b>
            <p>Video bitince 4 soruluk kısa test. Yanlış yaptığın yerde neden yanlış olduğu anlatılır.</p>
          </li>
          <li>
            <span className="n">04</span>
            <b>Takip et</b>
            <p>Nerede kaldığını, hangi testte zorlandığını panelinden görürsün. Telefondan da devam edersin.</p>
          </li>
        </ol>
      </section>

      <section className="home-proof">
        <div className="big">
          <b>{graduates.toLocaleString('tr-TR')}</b>
          <span>kişi bir programı bitirdi.</span>
        </div>
        <div className="home-quotes">
          {quotes.map((q) => (
            <figure key={q.id} style={{ '--accent': q.brand.accent } as React.CSSProperties}>
              <blockquote>“{q.text}”</blockquote>
              <figcaption>
                <Avatar src={q.avatar} name={q.name} size={34} />
                <span>
                  <b>{q.name}</b>
                  <span className="muted">
                    {q.role} · <span style={{ color: q.brand.accent }}>{q.brand.name}</span>
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>

      <footer className="home-foot">
        <div className="home-foot-cta">
          <h2>
            Bugün başla, bu ay bitir.
          </h2>
          <a href="#programlar" className="btn lg">
            Program seç <Icon name="arrow" />
          </a>
        </div>
        <div className="home-foot-meta">
          <span>© 2026 Defter Eğitim Teknolojileri A.Ş.</span>
          <span className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
            <a href="#">KVKK</a>
            <a href="#">Mesafeli satış sözleşmesi</a>
            <a href="#">İletişim</a>
            <Link to="/giris">Eğitmen / yönetici girişi</Link>
          </span>
        </div>
      </footer>
    </>
  )
}

function ProgramRow({ i, brand, title, lessons, from, onHover }: { i: number; brand: Brand; title: string; lessons: number; from: number | null; onHover: () => void }) {
  const weeks = brand.landing.eyebrow.match(/(\d+)\s*hafta/)?.[1]
  const inner = (
    <>
      <span className="idx mono">{String(i + 1).padStart(2, '0')}</span>
      <span className="name">
        <span className="row" style={{ gap: 10 }}>
          <BrandMark brand={brand} size={22} />
          <span className="label" style={{ color: brand.accent }}>{brand.name}</span>
        </span>
        <span className="t">{title}</span>
        <span className="d muted">{brand.tagline}</span>
      </span>
      <span className="mono wk">{weeks ? `${weeks} hafta` : '—'}</span>
      <span className="mono ls">{lessons}</span>
      <span className="price">
        {brand.active && from !== null ? (
          <>
            {tl(from)} <Icon name="arrow" size={18} />
          </>
        ) : (
          <span className="tag">yakında</span>
        )}
      </span>
    </>
  )
  return brand.active ? (
    <Link to={`/${brand.slug}`} className="prow" style={{ '--accent': brand.accent } as React.CSSProperties} onMouseEnter={onHover}>
      {inner}
    </Link>
  ) : (
    <div className="prow off" onMouseEnter={onHover}>
      {inner}
    </div>
  )
}
