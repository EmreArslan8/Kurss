import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Order, Role } from '../../data/types'
import { fmtDate, lessonsOf, tl, uid, useStore } from '../../lib/store'
import { PageHead } from '../../components/Shell'
import { Avatar, BrandMark, Icon, Img, Section, useToast } from '../../components/ui'
import { seed } from '../../data/seed'

function BrandFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { state } = useStore()
  return (
    <div className="filters">
      <button className={`chip ${value === 'all' ? 'on' : ''}`} onClick={() => onChange('all')}>Tüm markalar</button>
      {state.brands.map((b) => (
        <button key={b.id} className={`chip ${value === b.id ? 'on' : ''}`} onClick={() => onChange(b.id)}>
          <span className="sw" style={{ background: b.accent }} /> {b.name}
        </button>
      ))}
    </div>
  )
}

const statusTag = (o: Order) =>
  o.status === 'odendi' ? <span className="tag ok">ödendi</span> : o.status === 'iade' ? <span className="tag">iade</span> : <span className="tag bad">başarısız</span>

export function AdminDashboard() {
  const { state } = useStore()
  const [brand, setBrand] = useState('all')
  const orders = state.orders.filter((o) => brand === 'all' || o.brandId === brand)
  const paid = orders.filter((o) => o.status === 'odendi')
  const now = new Date('2026-11-09T23:59:00').getTime()
  const inDays = (o: Order, a: number, b: number) => {
    const d = (now - new Date(o.createdAt).getTime()) / 864e5
    return d >= a && d < b
  }
  const rev30 = paid.filter((o) => inDays(o, 0, 30)).reduce((a, o) => a + o.amount, 0)
  const revPrev = paid.filter((o) => inDays(o, 30, 60)).reduce((a, o) => a + o.amount, 0)
  const delta = revPrev ? Math.round(((rev30 - revPrev) / revPrev) * 100) : 0
  const conv = orders.length ? Math.round((paid.length / orders.length) * 100) : 0
  const students = new Set(paid.map((o) => o.userId)).size

  const series = useMemo(() => {
    const out: { day: string; byBrand: Record<string, number>; total: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const dayOrders = paid.filter((o) => inDays(o, i, i + 1))
      const byBrand: Record<string, number> = {}
      dayOrders.forEach((o) => (byBrand[o.brandId] = (byBrand[o.brandId] ?? 0) + o.amount))
      const d = new Date(now - i * 864e5)
      out.push({ day: `${d.getDate()}.${d.getMonth() + 1}`, byBrand, total: dayOrders.reduce((a, o) => a + o.amount, 0) })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid.length, brand])
  const max = Math.max(...series.map((s) => s.total), 1)
  const aiCost = state.aiLedger.reduce((a, x) => a + x.cost, 0)

  return (
    <>
      <PageHead kicker="Yönetim" title={<>Genel bakış <em>· son 30 gün</em></>}>
        <BrandFilter value={brand} onChange={setBrand} />
      </PageHead>

      <div className="kpis">
        <div><span className="label">Ciro</span><b>{tl(rev30)}</b><span className="delta" style={{ color: delta < 0 ? 'var(--bad)' : undefined }}>{delta >= 0 ? '↑' : '↓'} %{Math.abs(delta)} önceki 30 güne göre</span></div>
        <div><span className="label">Satış</span><b>{paid.filter((o) => inDays(o, 0, 30)).length}</b><small>ödenmiş sipariş</small></div>
        <div><span className="label">Ödeme başarı</span><b>%{conv}</b><small>{orders.length - paid.length} başarısız / iade</small></div>
        <div><span className="label">Öğrenci</span><b>{students}</b><small>aktif kayıt</small></div>
      </div>

      <div className="grid2" style={{ gridTemplateColumns: '1.6fr 1fr', marginTop: 16 }}>
        <div className="card pad">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="label">Günlük ciro</span>
            <span className="row" style={{ gap: 12 }}>
              {state.brands.filter((b) => brand === 'all' || b.id === brand).map((b) => (
                <span key={b.id} className="row" style={{ gap: 6, fontSize: 12 }}><span className="dot" style={{ color: b.accent }} />{b.name}</span>
              ))}
            </span>
          </div>
          <div className="bars">
            {series.map((s) => (
              <div key={s.day} title={`${s.day}: ${tl(s.total)}`} style={{ height: `${(s.total / max) * 100}%`, background: s.total ? 'transparent' : undefined }}>
                {state.brands.map((b) => s.byBrand[b.id] ? <i key={b.id} style={{ height: `${(s.byBrand[b.id] / s.total) * 100}%`, background: b.accent }} /> : null)}
              </div>
            ))}
          </div>
          <div className="bars-x mono faint"><span>{series[0].day}</span><span>{series[14].day}</span><span>bugün</span></div>
        </div>
        <div className="card pad" style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <span className="label">Markalara göre</span>
          {state.brands.map((b) => {
            const r = state.orders.filter((o) => o.brandId === b.id && o.status === 'odendi').reduce((a, o) => a + o.amount, 0)
            const all = state.orders.filter((o) => o.status === 'odendi').reduce((a, o) => a + o.amount, 0) || 1
            return (
              <div key={b.id} style={{ display: 'grid', gap: 6 }}>
                <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}>
                  <span className="row" style={{ gap: 8 }}><BrandMark brand={b} size={20} />{b.name}</span>
                  <b style={{ fontWeight: 600 }}>{tl(r)}</b>
                </div>
                <div className="progress"><i style={{ width: `${(r / all) * 100}%`, background: b.accent }} /></div>
              </div>
            )
          })}
          <hr className="hr" />
          <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}>
            <span className="row" style={{ gap: 8 }}><Icon name="spark" /> Toplam AI maliyeti</span>
            <b style={{ fontWeight: 600 }}>{aiCost.toFixed(2)} ₺</b>
          </div>
          <span className="muted" style={{ fontSize: 12.5 }}>{state.aiLedger.length} video analiz edildi · öğrenci başına maliyet 0 ₺</span>
        </div>
      </div>

      <Section title="Son siparişler" aside={<Link to="/yonetim/siparisler" className="label">tümü →</Link>}>
        <OrdersTable orders={orders.slice(0, 8)} />
      </Section>
    </>
  )
}

function OrdersTable({ orders }: { orders: Order[] }) {
  const { state } = useStore()
  return (
    <div className="card tablewrap">
      <table className="table">
        <thead>
          <tr><th>Sipariş</th><th>Müşteri</th><th>Marka / paket</th><th>Tarih</th><th>Durum</th><th>Fatura</th><th className="num">Tutar</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const b = state.brands.find((x) => x.id === o.brandId)!
            const p = state.packages.find((x) => x.id === o.packageId)
            return (
              <tr key={o.id}>
                <td><span className="mono">{o.id}</span><div className="mono faint" style={{ fontSize: 10.5 }}>{o.paytrRef}</div></td>
                <td><b style={{ fontWeight: 500 }}>{o.buyer.company ?? o.buyer.name}</b><div className="muted" style={{ fontSize: 12 }}>{o.buyer.email}</div></td>
                <td><span className="row" style={{ gap: 8 }}><BrandMark brand={b} size={18} /> {p?.title}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(o.createdAt, true)}</td>
                <td>{statusTag(o)}</td>
                <td>{o.invoice ? <span className={`tag ${o.invoice.status === 'iptal' ? '' : 'ink'}`} title={o.invoice.no}>{o.invoice.type}{o.invoice.status === 'iptal' ? ' · iptal' : ''}</span> : <span className="faint">—</span>}</td>
                <td className="num">{tl(o.amount)}{o.installment > 1 && <div className="mono faint" style={{ fontSize: 10.5 }}>{o.installment} taksit</div>}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {orders.length === 0 && <div className="empty">Sipariş yok.</div>}
    </div>
  )
}

export function AdminOrders() {
  const { state, update } = useStore()
  const [brand, setBrand] = useState('all')
  const [status, setStatus] = useState<'all' | Order['status']>('all')
  const [q, setQ] = useState('')
  const toast = useToast()
  const list = state.orders.filter(
    (o) =>
      (brand === 'all' || o.brandId === brand) &&
      (status === 'all' || o.status === status) &&
      (!q || `${o.id} ${o.buyer.name} ${o.buyer.email} ${o.invoice?.no ?? ''}`.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr'))),
  )
  const total = list.filter((o) => o.status === 'odendi').reduce((a, o) => a + o.amount, 0)
  const exportCsv = () => {
    const rows = [['siparis', 'tarih', 'marka', 'musteri', 'eposta', 'tutar', 'durum', 'fatura_no', 'fatura_tipi', 'paytr_ref']]
    list.forEach((o) => rows.push([o.id, o.createdAt, state.brands.find((b) => b.id === o.brandId)!.name, o.buyer.company ?? o.buyer.name, o.buyer.email, String(o.amount), o.status, o.invoice?.no ?? '', o.invoice?.type ?? '', o.paytrRef]))
    const blob = new Blob(['﻿' + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'siparisler.csv'
    a.click()
  }
  const refundLast = () => {
    const o = list.find((x) => x.status === 'odendi')
    if (!o || !confirm(`${o.id} iade edilsin mi? Fatura iptal edilir ve erişim kaldırılır.`)) return
    update((d) => {
      const x = d.orders.find((y) => y.id === o.id)!
      x.status = 'iade'
      if (x.invoice) x.invoice.status = 'iptal'
      d.enrollments = d.enrollments.filter((e) => e.orderId !== o.id)
    })
    toast.show(`${o.id} iade edildi, PayTR iade talebi oluşturuldu`)
  }
  return (
    <>
      <PageHead kicker="Satış" title="Siparişler & faturalar">
        <button className="btn ghost" onClick={refundLast}>Son siparişi iade et</button>
        <button className="btn" onClick={exportCsv}><Icon name="down" /> CSV</button>
      </PageHead>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 14 }}>
        <BrandFilter value={brand} onChange={setBrand} />
        <div className="row">
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} style={{ width: 'auto' }}>
            <option value="all">Tüm durumlar</option>
            <option value="odendi">Ödendi</option>
            <option value="basarisiz">Başarısız</option>
            <option value="iade">İade</option>
          </select>
          <input className="input" placeholder="Ara: isim, e-posta, fatura no" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} />
        </div>
      </div>
      <div className="mono muted" style={{ marginBottom: 10 }}>{list.length} kayıt · tahsil edilen {tl(total)}</div>
      <OrdersTable orders={list} />
      {toast.node}
    </>
  )
}

export function AdminBrands() {
  const { state, update } = useStore()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const create = (e: React.FormEvent) => {
    e.preventDefault()
    const base = seed().brands[0]
    const id = uid('b')
    const slug = name.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    update((d) => {
      d.brands.push({
        ...base,
        id,
        slug: slug || id,
        name,
        domain: domain || `${slug}.com`,
        accent: '#6b3fa0',
        accentSoft: '#ece3f6',
        monogram: name.slice(0, 1).toLocaleUpperCase('tr'),
        tagline: 'Yeni eğitim markası',
        active: false,
        landing: {
          ...base.landing,
          eyebrow: 'Yeni program',
          headline: `${name} ile *yeni* bir başlangıç.`,
          subheadline: 'Bu metni yönetim panelinden düzenleyebilirsin.',
          stats: [],
          videoTestimonials: [],
          textTestimonials: [],
          faq: base.landing.faq.slice(1, 4),
        },
      })
    })
    nav(`/yonetim/markalar/${id}`)
  }
  return (
    <>
      <PageHead kicker="Çoklu marka" title="Markalar & domainler" />
      <div className="courses">
        {state.brands.map((b) => {
          const pk = state.packages.filter((p) => p.brandId === b.id)
          const rev = state.orders.filter((o) => o.brandId === b.id && o.status === 'odendi').reduce((a, o) => a + o.amount, 0)
          return (
            <div key={b.id} className="ccard" style={{ '--accent': b.accent } as React.CSSProperties}>
              <Img src={b.landing.vslPoster} alt={b.name} />
              <div className="body">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="row" style={{ gap: 10 }}><BrandMark brand={b} size={28} /><b style={{ fontSize: 18 }}>{b.name}</b></span>
                  {b.active ? <span className="tag ok"><span className="dot" /> yayında</span> : <span className="tag">taslak</span>}
                </div>
                <span className="mono muted">{b.domain}</span>
                <div className="row muted" style={{ fontSize: 13, gap: 16 }}>
                  <span>{pk.length} paket</span>
                  <span>{state.courses.filter((c) => c.brandId === b.id).length} eğitim</span>
                  <span>{tl(rev)}</span>
                </div>
                <div className="row">
                  <Link className="btn sm" to={`/yonetim/markalar/${b.id}`}><Icon name="edit" size={14} /> Düzenle</Link>
                  <Link className="btn sm ghost" to={`/${b.slug}`} target="_blank"><Icon name="eye" size={14} /> Sayfa</Link>
                </div>
              </div>
            </div>
          )
        })}
        <form className="card pad" onSubmit={create} style={{ display: 'grid', gap: 12, alignContent: 'start', borderStyle: 'dashed' }}>
          <span className="label">Yeni marka</span>
          <h3 className="serif" style={{ fontSize: 26, lineHeight: 1.05 }}>Aynı altyapı, yeni domain.</h3>
          <label className="field"><span>Marka adı</span><input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="ör. Akort" /></label>
          <label className="field"><span>Domain</span><input className="input mono" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="akort.com" /></label>
          <small className="muted">Landing şablonu ve SSS varsayılanlarıyla oluşturulur. DNS’te domaini platforma CNAME ile yönlendirmen yeterli.</small>
          <button className="btn"><Icon name="plus" /> Markayı oluştur</button>
        </form>
      </div>
    </>
  )
}

export function AdminUsers() {
  const { state, update } = useStore()
  const [role, setRole] = useState<'all' | Role>('all')
  const [q, setQ] = useState('')
  const list = state.users.filter((u) => (role === 'all' || u.role === role) && (!q || `${u.name} ${u.email}`.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr'))))
  const label: Record<Role, string> = { admin: 'Yönetici', teacher: 'Eğitmen', student: 'Öğrenci' }
  return (
    <>
      <PageHead kicker="Kullanıcılar" title="Öğrenciler & eğitmenler" />
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="filters">
          {(['all', 'student', 'teacher', 'admin'] as const).map((r) => (
            <button key={r} className={`chip ${role === r ? 'on' : ''}`} onClick={() => setRole(r)}>
              {r === 'all' ? 'Hepsi' : label[r]} <span className="mono faint">{r === 'all' ? state.users.length : state.users.filter((u) => u.role === r).length}</span>
            </button>
          ))}
        </div>
        <input className="input" placeholder="Ara" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 220 }} />
      </div>
      <div className="card tablewrap">
        <table className="table">
          <thead><tr><th>Kişi</th><th>Rol</th><th>Markalar</th><th>Eğitim</th><th>Kayıt</th><th></th></tr></thead>
          <tbody>
            {list.map((u) => {
              const enr = state.enrollments.filter((e) => e.userId === u.id).length
              const taught = state.courses.filter((c) => c.teacherId === u.id).length
              return (
                <tr key={u.id}>
                  <td><span className="row" style={{ gap: 10 }}><Avatar src={u.avatar} name={u.name} size={30} /><span><b style={{ fontWeight: 500 }}>{u.name}</b><div className="muted" style={{ fontSize: 12 }}>{u.email}</div></span></span></td>
                  <td>
                    <select className="select" style={{ padding: '5px 8px', width: 'auto', fontSize: 13 }} value={u.role} onChange={(e) => update((d) => void (d.users.find((x) => x.id === u.id)!.role = e.target.value as Role))} disabled={u.id === state.currentUserId}>
                      <option value="student">Öğrenci</option>
                      <option value="teacher">Eğitmen</option>
                      <option value="admin">Yönetici</option>
                    </select>
                  </td>
                  <td><span className="row" style={{ gap: 4 }}>{state.brands.filter((b) => u.brandIds.includes(b.id)).map((b) => <BrandMark key={b.id} brand={b} size={20} />)}</span></td>
                  <td className="mono">{u.role === 'teacher' ? `${taught} veriyor` : u.role === 'student' ? `${enr} kayıt` : '—'}</td>
                  <td>{fmtDate(u.createdAt)}</td>
                  <td className="num">{u.role === 'student' && <Link to="/yonetim/siparisler" className="label">siparişler</Link>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminCourses() {
  const { state, update } = useStore()
  const teachers = state.users.filter((u) => u.role === 'teacher')
  const [brand, setBrand] = useState('all')
  const list = state.courses.filter((c) => brand === 'all' || c.brandId === brand)
  const addCourse = () => {
    const b = brand === 'all' ? state.brands[0] : state.brands.find((x) => x.id === brand)!
    update((d) =>
      void d.courses.push({
        id: uid('c'),
        brandId: b.id,
        teacherId: teachers.find((t) => t.brandIds.includes(b.id))?.id ?? teachers[0].id,
        title: 'Yeni eğitim',
        cover: b.landing.heroImage,
        description: '',
        level: 'Başlangıç',
        sections: [{ id: uid('s'), title: 'Giriş', lessons: [] }],
      }),
    )
  }
  return (
    <>
      <PageHead kicker="İçerik" title="Eğitimler">
        <button className="btn" onClick={addCourse}><Icon name="plus" /> Eğitim ekle</button>
      </PageHead>
      <div style={{ marginBottom: 14 }}><BrandFilter value={brand} onChange={setBrand} /></div>
      <div className="card tablewrap">
        <table className="table">
          <thead><tr><th>Eğitim</th><th>Marka</th><th>Eğitmen</th><th>Ders</th><th>AI test</th><th>Öğrenci</th><th></th></tr></thead>
          <tbody>
            {list.map((c) => {
              const b = state.brands.find((x) => x.id === c.brandId)!
              const ls = lessonsOf(c)
              return (
                <tr key={c.id}>
                  <td><span className="row" style={{ gap: 10 }}><Img src={c.cover} alt={c.title} style={{ width: 54, height: 36, borderRadius: 6 }} /><b style={{ fontWeight: 500 }}>{c.title}</b></span></td>
                  <td><span className="row" style={{ gap: 6 }}><BrandMark brand={b} size={18} />{b.name}</span></td>
                  <td>
                    <select className="select" style={{ padding: '5px 8px', width: 'auto', fontSize: 13 }} value={c.teacherId} onChange={(e) => update((d) => void (d.courses.find((x) => x.id === c.id)!.teacherId = e.target.value))}>
                      {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td className="mono">{ls.length}</td>
                  <td className="mono">{ls.filter((l) => l.ai.status === 'approved').length}/{ls.length}</td>
                  <td className="mono">{state.enrollments.filter((e) => e.courseId === c.id).length}</td>
                  <td className="num"><Link className="btn sm ghost" to={`/yonetim/egitimler/${c.id}`}>İçerik</Link></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminAi() {
  const { state } = useStore()
  const rows = state.aiLedger
    .map((x) => {
      for (const c of state.courses) for (const l of lessonsOf(c)) if (l.id === x.lessonId) return { ...x, c, l }
      return null
    })
    .filter(Boolean) as { lessonId: string; at: string; tokens: number; cost: number; c: (typeof state.courses)[0]; l: ReturnType<typeof lessonsOf>[0] }[]
  const total = rows.reduce((a, r) => a + r.cost, 0)
  const studentViews = state.enrollments.length * 4
  return (
    <>
      <PageHead kicker="Maliyet kontrolü" title="Yapay zekâ kullanımı" />
      <div className="kpis">
        <div><span className="label">Analiz edilen video</span><b>{rows.length}</b><small>her biri bir kez</small></div>
        <div><span className="label">Toplam token</span><b>{(rows.reduce((a, r) => a + r.tokens, 0) / 1000).toFixed(1)}k</b><small>transkript + üretim</small></div>
        <div><span className="label">Toplam maliyet</span><b>{total.toFixed(0)} ₺</b><small>tüm markalar</small></div>
        <div><span className="label">Öğrenci başına</span><b>0 ₺</b><small>{studentViews} test gösterimi, model çağrısı yok</small></div>
      </div>
      <Section title="Çalıştırma kaydı">
        <div className="card tablewrap">
          <table className="table">
            <thead><tr><th>Ders</th><th>Eğitim</th><th>Tarih</th><th>Durum</th><th className="num">Token</th><th className="num">Maliyet</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.lessonId + r.at}>
                  <td>{r.l.title}</td>
                  <td className="muted">{r.c.title}</td>
                  <td>{fmtDate(r.at, true)}</td>
                  <td>{r.l.ai.status === 'approved' ? <span className="tag ok">yayında</span> : <span className="tag warn">eğitmen onayında</span>}</td>
                  <td className="num mono">{r.tokens.toLocaleString('tr-TR')}</td>
                  <td className="num mono">{r.cost.toFixed(2)} ₺</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
