import { Link, useNavigate } from 'react-router-dom'
import { tl, useStore } from '../../lib/store'
import { Avatar, BrandMark, Icon, Img, KurssMark } from '../../components/ui'
import type { Role } from '../../data/types'

const home: Record<Role, string> = { admin: '/yonetim', teacher: '/egitmen', student: '/ogrenci' }
const roleName: Record<Role, string> = { admin: 'Yönetici', teacher: 'Eğitmen', student: 'Öğrenci' }

export default function Hub() {
  const { state, login, reset } = useStore()
  const nav = useNavigate()
  const go = (userId: string, role: Role) => {
    login(userId)
    nav(home[role])
  }
  const demoUsers = ['u_admin', 'u_t1', 'u_t2', 'u_s1'].map((id) => state.users.find((u) => u.id === id)!).filter(Boolean)
  const paid = state.orders.filter((o) => o.status === 'odendi')

  return (
    <div className="hub">
      <header className="hub-top">
        <span className="row" style={{ gap: 10, fontWeight: 600 }}>
          <KurssMark /> Kurss
        </span>
        <span className="label">MVP · demo verisi</span>
      </header>

      <section className="hub-hero">
        <h1 className="serif">
          Bir altyapı, <em>istediğin kadar</em> eğitim markası.
        </h1>
        <div className="hub-hero-side">
          <p>
            Domain ekle, satış sayfasını panelden yaz, paketini fiyatla. Eğitmen videosunu yükler, yapay zekâ soruları <b>bir kez</b> çıkarır, eğitmen onaylar; tüm
            öğrenciler aynı içeriği görür.
          </p>
          <div className="hub-kpis">
            <div><b>{state.brands.length}</b><span>marka</span></div>
            <div><b>{state.courses.length}</b><span>eğitim</span></div>
            <div><b>{tl(paid.reduce((a, o) => a + o.amount, 0))}</b><span>demo ciro</span></div>
          </div>
        </div>
      </section>

      <section className="hub-sec">
        <div className="hub-label">
          <span className="label">01 — Markalar</span>
          <span className="muted" style={{ fontSize: 13 }}>Her biri ayrı domain, ayrı satış sayfası, ayrı fiyat</span>
        </div>
        <div className="hub-brands">
          {state.brands.map((b) => (
            <Link key={b.id} to={`/${b.slug}`} className="hub-brand" style={{ '--accent': b.accent } as React.CSSProperties}>
              <Img src={b.landing.vslPoster} alt={b.name} />
              <div className="body">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="row" style={{ gap: 10 }}>
                    <BrandMark brand={b} size={28} />
                    <b style={{ fontSize: 18 }}>{b.name}</b>
                  </span>
                  {b.active ? <span className="tag ok"><span className="dot" /> yayında</span> : <span className="tag">taslak</span>}
                </div>
                <p className="muted">{b.tagline}</p>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="mono faint">{b.domain}</span>
                  <span className="row go" style={{ gap: 6, fontSize: 13 }}>satış sayfası <Icon name="arrow" size={14} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="hub-sec">
        <div className="hub-label">
          <span className="label">02 — Paneller</span>
          <span className="muted" style={{ fontSize: 13 }}>Demo hesaplarla tek tıkla giriş</span>
        </div>
        <div className="hub-people">
          {demoUsers.map((u) => (
            <button key={u.id} className="hub-person" onClick={() => go(u.id, u.role)}>
              <Avatar src={u.avatar} name={u.name} size={52} />
              <span style={{ flex: 1, textAlign: 'left' }}>
                <span className="label">{roleName[u.role]}</span>
                <b>{u.name}</b>
                <span className="muted" style={{ fontSize: 13 }}>
                  {u.role === 'admin' && 'Tüm markalar, satış, fatura, landing editörü'}
                  {u.role === 'teacher' && `${state.brands.filter((b) => u.brandIds.includes(b.id)).map((b) => b.name).join(', ')} · ders yükleme, AI soru onayı`}
                  {u.role === 'student' && '2 markadan 3 eğitim, ilerleme ve testler'}
                </span>
              </span>
              <Icon name="arrow" size={18} />
            </button>
          ))}
        </div>
      </section>

      <footer className="hub-foot">
        <span className="mono faint">Veriler tarayıcıda saklanır (localStorage).</span>
        <button className="linkbtn" onClick={() => confirm('Tüm demo verisi başlangıç haline dönsün mü?') && reset()}>
          Demo verisini sıfırla
        </button>
      </footer>
    </div>
  )
}
