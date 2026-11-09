import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { fmtDate, tl, useStore } from '../../lib/store'
import { BrandMark, Icon } from '../../components/ui'
import { brandStyle } from './Landing'

export default function Checkout() {
  const { slug, packageId } = useParams()
  const { state, me, checkout } = useStore()
  const nav = useNavigate()
  const brand = state.brands.find((b) => b.slug === slug)
  const pkg = state.packages.find((p) => p.id === packageId)

  const [kind, setKind] = useState<'bireysel' | 'kurumsal'>('bireysel')
  const [inst, setInst] = useState(1)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [f, setF] = useState({
    name: me?.role === 'student' ? me.name : '',
    email: me?.role === 'student' ? me.email : '',
    phone: me?.phone ?? '',
    city: 'İstanbul',
    idNo: '',
    company: '',
    taxNo: '',
    taxOffice: '',
    card: '',
    exp: '',
    cvc: '',
    agree: false,
  })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value })

  if (!brand || !pkg) return <Navigate to="/" replace />
  const courses = state.courses.filter((c) => pkg.courseIds.includes(c.id))
  const kdv = pkg.price - pkg.price / 1.2
  const instOptions = [1, 2, 3, 6, 9].filter((n) => n <= pkg.installments)
  const fail = f.card.replace(/\s/g, '').endsWith('0000')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!f.agree) return setErr('Devam etmek için sözleşmeleri onaylamalısın.')
    if (kind === 'kurumsal' && (!f.company || f.taxNo.length < 10)) return setErr('Kurumsal fatura için unvan ve 10 haneli VKN gerekli.')
    setBusy(true)
    const order = await checkout({
      brand,
      pkg,
      installment: inst,
      cardOk: !fail,
      buyer: {
        name: f.name,
        email: f.email,
        phone: f.phone,
        city: f.city,
        ...(kind === 'bireysel' ? { idNo: f.idNo } : { company: f.company, taxNo: f.taxNo }),
      },
    })
    setBusy(false)
    if (order.status !== 'odendi') return setErr(`Ödeme bankanız tarafından reddedildi (PayTR ref ${order.paytrRef}). Farklı bir kart deneyin.`)
    nav(`/${brand.slug}/odeme/sonuc/${order.id}`)
  }

  return (
    <div style={brandStyle(brand)}>
      <div className="co">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Link to={`/${brand.slug}`} className="row" style={{ textDecoration: 'none', gap: 10, fontWeight: 600 }}>
            <BrandMark brand={brand} size={26} /> {brand.name}
          </Link>
          <span className="label row" style={{ gap: 6 }}>
            <Icon name="lock" size={13} /> güvenli ödeme
          </span>
        </div>

        <div className="co-grid">
          <form className="card" onSubmit={submit}>
            <div className="step">
              <h1>Kaydını tamamla</h1>
              <p className="muted">Ödeme onaylandığı anda hesabın açılır, eğitime erişimin tanımlanır ve faturan e-postana gönderilir.</p>
            </div>
            <div className="step">
              <h3><i>1</i> Hesap bilgileri</h3>
              <div className="grid2">
                <label className="field"><span>Ad soyad</span><input className="input" required value={f.name} onChange={set('name')} /></label>
                <label className="field"><span>E-posta</span><input className="input" type="email" required value={f.email} onChange={set('email')} /></label>
                <label className="field"><span>Telefon</span><input className="input" required value={f.phone} onChange={set('phone')} placeholder="05xx xxx xx xx" /></label>
                <label className="field">
                  <span>İl</span>
                  <select className="select" value={f.city} onChange={set('city')}>
                    {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Diğer'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>
            </div>
            <div className="step">
              <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <h3><i>2</i> Fatura</h3>
                <div className="seg">
                  <button type="button" className={kind === 'bireysel' ? 'on' : ''} onClick={() => setKind('bireysel')}>Bireysel · e-Arşiv</button>
                  <button type="button" className={kind === 'kurumsal' ? 'on' : ''} onClick={() => setKind('kurumsal')}>Kurumsal · e-Fatura</button>
                </div>
              </div>
              {kind === 'bireysel' ? (
                <label className="field"><span>T.C. kimlik no <small>(opsiyonel, 5.000 TL altı)</small></span><input className="input" inputMode="numeric" maxLength={11} value={f.idNo} onChange={set('idNo')} placeholder="11111111111" /></label>
              ) : (
                <div className="grid2">
                  <label className="field" style={{ gridColumn: '1 / -1' }}><span>Şirket unvanı</span><input className="input" value={f.company} onChange={set('company')} /></label>
                  <label className="field"><span>Vergi no (VKN)</span><input className="input" inputMode="numeric" maxLength={10} value={f.taxNo} onChange={set('taxNo')} /></label>
                  <label className="field"><span>Vergi dairesi</span><input className="input" value={f.taxOffice} onChange={set('taxOffice')} /></label>
                </div>
              )}
            </div>
            <div className="step">
              <h3><i>3</i> Ödeme</h3>
              <div className="paytr">
                <div className="bar">
                  <span>PayTR güvenli ödeme</span>
                  <span className="row" style={{ gap: 6 }}><Icon name="lock" size={12} /> 3D Secure</span>
                </div>
                <div className="body">
                  <label className="field"><span>Kart numarası</span><input className="input mono" style={{ fontSize: 14 }} required inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={f.card} onChange={set('card')} /></label>
                  <div className="grid2">
                    <label className="field"><span>Son kullanma</span><input className="input mono" style={{ fontSize: 14 }} required placeholder="AA/YY" autoComplete="cc-exp" value={f.exp} onChange={set('exp')} /></label>
                    <label className="field"><span>CVC</span><input className="input mono" style={{ fontSize: 14 }} required placeholder="CVC" maxLength={4} autoComplete="cc-csc" value={f.cvc} onChange={set('cvc')} /></label>
                  </div>
                  {instOptions.length > 1 && (
                    <div className="inst">
                      {instOptions.map((n) => (
                        <label key={n} className={inst === n ? 'on' : ''}>
                          <input type="radio" name="inst" checked={inst === n} onChange={() => setInst(n)} />
                          <b>{n === 1 ? 'Tek çekim' : `${n} taksit`}</b>
                          <span className="muted">{n === 1 ? tl(pkg.price) : `${n} × ${tl(pkg.price / n)}`}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <label className="check">
                <input type="checkbox" checked={f.agree} onChange={set('agree')} />
                <span>Ön bilgilendirme formunu ve mesafeli satış sözleşmesini okudum, onaylıyorum.</span>
              </label>
              {err && <div className="tag bad" style={{ whiteSpace: 'normal', lineHeight: 1.4, padding: 10 }}>{err}</div>}
              <button className="btn accent lg block" disabled={busy}>
                {busy ? <><span className="spin" /> PayTR’den onay bekleniyor…</> : <>{tl(pkg.price)} öde <Icon name="arrow" /></>}
              </button>
            </div>
          </form>

          <aside className="receipt" style={{ position: 'sticky', top: 20 }}>
            <div className="rtop"><span>Sipariş özeti</span><span>{fmtDate(new Date().toISOString())}</span></div>
            <h4>{pkg.title}</h4>
            <ul>
              {courses.map((c) => <li key={c.id}>{c.title}</li>)}
              {pkg.features.slice(-2).map((x, i) => <li key={i}>{x}</li>)}
            </ul>
            <div className="dash" />
            <div className="mono" style={{ display: 'grid', gap: 6 }}>
              {pkg.oldPrice && <div className="row" style={{ justifyContent: 'space-between' }}><span>Liste fiyatı</span><s>{tl(pkg.oldPrice)}</s></div>}
              <div className="row" style={{ justifyContent: 'space-between' }}><span>Ara toplam</span><span>{tl(pkg.price - kdv)}</span></div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span>KDV %20</span><span>{tl(kdv)}</span></div>
            </div>
            <div className="dash" />
            <div className="total">
              <span className="label">Toplam</span>
              <span className="price" style={{ fontSize: 38 }}>{tl(pkg.price)}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export function CheckoutSuccess() {
  const { slug, orderId } = useParams()
  const { state } = useStore()
  const brand = state.brands.find((b) => b.slug === slug)
  const order = state.orders.find((o) => o.id === orderId)
  if (!brand || !order) return <Navigate to="/" replace />
  const pkg = state.packages.find((p) => p.id === order.packageId)!
  const first = state.courses.find((c) => c.id === pkg.courseIds[0])
  return (
    <div style={brandStyle(brand)}>
      <div className="success">
        <span className="tag ok"><Icon name="check" size={13} /> ödeme alındı</span>
        <h1>
          Hoş geldin, {order.buyer.name.split(' ')[0]}.
        </h1>
        <p className="muted" style={{ fontSize: 17 }}>
          <b style={{ color: 'var(--ink)' }}>{pkg.title}</b> hesabına tanımlandı. Faturan <b style={{ color: 'var(--ink)' }}>{order.buyer.email}</b> adresine gönderildi.
        </p>
        <div className="row" style={{ marginTop: 24, flexWrap: 'wrap' }}>
          <Link className="btn accent lg" to={first ? `/ogrenci/kurs/${first.id}` : '/ogrenci'}>
            İlk derse başla <Icon name="arrow" />
          </Link>
          <Link className="btn ghost lg" to="/ogrenci">Öğrenci paneli</Link>
        </div>

        <div className="inv">
          <div className="r"><b>{order.invoice?.type} FATURA</b><span>{order.invoice?.no}</span></div>
          <div className="r muted"><span>{brand.invoiceTitle}</span><span>VKN {brand.taxNo}</span></div>
          <div className="dash" />
          <div className="r"><span>Alıcı</span><span>{order.buyer.company ?? order.buyer.name}</span></div>
          {order.buyer.taxNo && <div className="r"><span>VKN</span><span>{order.buyer.taxNo}</span></div>}
          <div className="r"><span>Sipariş</span><span>{order.id}</span></div>
          <div className="r"><span>PayTR ref</span><span>{order.paytrRef}</span></div>
          <div className="r"><span>Taksit</span><span>{order.installment === 1 ? 'Tek çekim' : `${order.installment} taksit`}</span></div>
          <div className="dash" />
          <div className="r"><span>{pkg.title}</span><span>{tl(order.amount / 1.2)}</span></div>
          <div className="r"><span>KDV %20</span><span>{tl(order.amount - order.amount / 1.2)}</span></div>
          <div className="r" style={{ fontSize: 15 }}><b>TOPLAM</b><b>{tl(order.amount)}</b></div>
          <div className="dash" />
          <div className="muted" style={{ fontSize: 11.5 }}>GİB e-Arşiv sistemi üzerinden {fmtDate(order.createdAt, true)} tarihinde düzenlendi.</div>
        </div>
      </div>
    </div>
  )
}
