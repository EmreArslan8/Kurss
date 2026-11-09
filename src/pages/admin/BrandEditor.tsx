import { useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { Brand, LandingContent, Package } from '../../data/types'
import { tl, uid, useStore } from '../../lib/store'
import { PageHead } from '../../components/Shell'
import { Avatar, BrandMark, Icon, Img, useToast } from '../../components/ui'
import { LandingView } from '../public/Landing'

const palette = [
  ['#1f6b4a', '#dfeee4'],
  ['#d2461e', '#fbe3d8'],
  ['#2c48c9', '#e1e6fb'],
  ['#6b3fa0', '#ece3f6'],
  ['#b0821a', '#f5ebcf'],
  ['#0f7a8a', '#d8eef1'],
  ['#c22a5d', '#f8dbe5'],
  ['#17150f', '#e6e0d2'],
]

type Tab = 'genel' | 'sayfa' | 'yorum' | 'sss' | 'paket'

export default function BrandEditor() {
  const { brandId } = useParams()
  const { state, update } = useStore()
  const [tab, setTab] = useState<Tab>('sayfa')
  const toast = useToast()
  const brand = state.brands.find((b) => b.id === brandId)
  if (!brand) return <Navigate to="/yonetim/markalar" replace />
  const packages = state.packages.filter((p) => p.brandId === brand.id)
  const courses = state.courses.filter((c) => c.brandId === brand.id)

  const setB = (fn: (b: Brand) => void) => update((d) => fn(d.brands.find((b) => b.id === brand.id)!))
  const setL = (fn: (l: LandingContent) => void) => setB((b) => fn(b.landing))
  const setP = (id: string, fn: (p: Package) => void) => update((d) => fn(d.packages.find((p) => p.id === id)!))
  const L = brand.landing

  const tabs: [Tab, string][] = [
    ['sayfa', 'Satış sayfası'],
    ['yorum', `Yorumlar (${L.videoTestimonials.length + L.textTestimonials.length})`],
    ['sss', `SSS (${L.faq.length})`],
    ['paket', `Paketler & fiyat (${packages.length})`],
    ['genel', 'Marka & domain'],
  ]

  return (
    <>
      <PageHead
        kicker={<span className="row" style={{ gap: 8 }}><Link to="/yonetim/markalar" style={{ textDecoration: 'none' }}>Markalar</Link> / {brand.domain}</span>}
        title={<span className="row" style={{ gap: 14 }}><BrandMark brand={brand} size={40} />{brand.name}</span>}
      >
        <label className="check" style={{ alignItems: 'center' }}>
          <input type="checkbox" checked={brand.active} onChange={(e) => setB((b) => void (b.active = e.target.checked))} /> Yayında
        </label>
        <Link className="btn ghost" to={`/${brand.slug}`} target="_blank"><Icon name="eye" /> Canlı sayfa</Link>
        <button className="btn" onClick={() => toast.show('Değişiklikler kaydedildi ve yayınlandı')}><Icon name="check" /> Yayınla</button>
      </PageHead>

      <div className="split">
        <div>
          <div className="tabs">
            {tabs.map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === 'sayfa' && (
            <>
              <Blk title="1 · Başlık alanı">
                <F label="Üst etiket"><input className="input" value={L.eyebrow} onChange={(e) => setL((l) => void (l.eyebrow = e.target.value))} /></F>
                <F label="Headline" hint="*yıldız arasındaki* kelimeler marka renginde italik görünür">
                  <textarea className="textarea" style={{ minHeight: 64 }} value={L.headline} onChange={(e) => setL((l) => void (l.headline = e.target.value))} />
                </F>
                <F label="Sub-headline"><textarea className="textarea" value={L.subheadline} onChange={(e) => setL((l) => void (l.subheadline = e.target.value))} /></F>
                <F label="Buton metni"><input className="input" value={L.ctaLabel} onChange={(e) => setL((l) => void (l.ctaLabel = e.target.value))} /></F>
                <div className="grid3">
                  {L.stats.map((s, i) => (
                    <div key={i} style={{ display: 'grid', gap: 6 }}>
                      <input className="input" value={s.value} onChange={(e) => setL((l) => void (l.stats[i].value = e.target.value))} />
                      <input className="input" value={s.label} onChange={(e) => setL((l) => void (l.stats[i].label = e.target.value))} style={{ fontSize: 13 }} />
                    </div>
                  ))}
                </div>
                <div className="row">
                  {L.stats.length < 3 && <button className="linkbtn" style={{ fontSize: 13 }} onClick={() => setL((l) => void l.stats.push({ value: '0', label: 'açıklama' }))}>+ rakam ekle</button>}
                  {L.stats.length > 0 && <button className="linkbtn" style={{ fontSize: 13 }} onClick={() => setL((l) => void l.stats.pop())}>son rakamı kaldır</button>}
                </div>
              </Blk>
              <Blk title="2 · VSL (satış videosu)">
                <F label="Video bağlantısı" hint="YouTube, Vimeo ya da doğrudan .mp4 bağlantısı">
                  <input className="input mono" style={{ fontSize: 13 }} value={L.vslUrl} onChange={(e) => setL((l) => void (l.vslUrl = e.target.value))} />
                </F>
                <F label="Kapak görseli (URL)"><input className="input mono" style={{ fontSize: 13 }} value={L.vslPoster} onChange={(e) => setL((l) => void (l.vslPoster = e.target.value))} /></F>
                <F label="Video altı not"><input className="input" value={L.vslCaption} onChange={(e) => setL((l) => void (l.vslCaption = e.target.value))} /></F>
              </Blk>
              <Blk title="3 · Paket bölümü">
                <F label="Paket alanı görseli (URL)"><input className="input mono" style={{ fontSize: 13 }} value={L.heroImage} onChange={(e) => setL((l) => void (l.heroImage = e.target.value))} /></F>
                <F label="Garanti metni"><input className="input" value={L.guarantee} onChange={(e) => setL((l) => void (l.guarantee = e.target.value))} /></F>
              </Blk>
            </>
          )}

          {tab === 'yorum' && (
            <>
              <Blk title="Videolu öğrenci yorumları" action={<button className="btn sm ghost" onClick={() => setL((l) => void l.videoTestimonials.push({ id: uid('vt'), name: 'Yeni öğrenci', role: 'Meslek / şehir', poster: '', videoUrl: L.vslUrl, quote: 'Kısa alıntı' }))}><Icon name="plus" size={14} /> Ekle</button>}>
                {L.videoTestimonials.length === 0 && <span className="muted" style={{ fontSize: 14 }}>Video yorum yoksa bu bölüm sayfada gizlenir.</span>}
                {L.videoTestimonials.map((v, i) => (
                  <Item key={v.id} media={<Img src={v.poster} alt={v.name} style={{ width: 54, height: 72, borderRadius: 8 }} />} onUp={i ? () => setL((l) => swap(l.videoTestimonials, i, i - 1)) : undefined} onDel={() => setL((l) => void l.videoTestimonials.splice(i, 1))}>
                    <div className="grid2">
                      <input className="input" value={v.name} onChange={(e) => setL((l) => void (l.videoTestimonials[i].name = e.target.value))} />
                      <input className="input" value={v.role} onChange={(e) => setL((l) => void (l.videoTestimonials[i].role = e.target.value))} />
                    </div>
                    <input className="input" value={v.quote} onChange={(e) => setL((l) => void (l.videoTestimonials[i].quote = e.target.value))} />
                    <div className="grid2">
                      <input className="input mono" style={{ fontSize: 12 }} placeholder="video URL" value={v.videoUrl} onChange={(e) => setL((l) => void (l.videoTestimonials[i].videoUrl = e.target.value))} />
                      <input className="input mono" style={{ fontSize: 12 }} placeholder="kapak URL" value={v.poster} onChange={(e) => setL((l) => void (l.videoTestimonials[i].poster = e.target.value))} />
                    </div>
                  </Item>
                ))}
              </Blk>
              <Blk title="Yazılı yorumlar" action={<button className="btn sm ghost" onClick={() => setL((l) => void l.textTestimonials.push({ id: uid('tt'), name: 'Ad Soyad', role: 'Meslek', avatar: '', rating: 5, text: 'Yorum metni' }))}><Icon name="plus" size={14} /> Ekle</button>}>
                {L.textTestimonials.map((t, i) => (
                  <Item key={t.id} media={<Avatar src={t.avatar} name={t.name} size={40} />} onUp={i ? () => setL((l) => swap(l.textTestimonials, i, i - 1)) : undefined} onDel={() => setL((l) => void l.textTestimonials.splice(i, 1))}>
                    <div className="grid2">
                      <input className="input" value={t.name} onChange={(e) => setL((l) => void (l.textTestimonials[i].name = e.target.value))} />
                      <input className="input" value={t.role} onChange={(e) => setL((l) => void (l.textTestimonials[i].role = e.target.value))} />
                    </div>
                    <textarea className="textarea" value={t.text} onChange={(e) => setL((l) => void (l.textTestimonials[i].text = e.target.value))} />
                    <div className="row">
                      <span className="label">Puan</span>
                      <select className="select" style={{ width: 'auto' }} value={t.rating} onChange={(e) => setL((l) => void (l.textTestimonials[i].rating = +e.target.value))}>
                        {[5, 4, 3].map((n) => <option key={n} value={n}>{n} yıldız</option>)}
                      </select>
                    </div>
                  </Item>
                ))}
              </Blk>
            </>
          )}

          {tab === 'sss' && (
            <Blk title="Sıkça sorulan sorular" action={<button className="btn sm ghost" onClick={() => setL((l) => void l.faq.push({ id: uid('f'), q: 'Yeni soru?', a: 'Cevap' }))}><Icon name="plus" size={14} /> Soru ekle</button>}>
              {L.faq.map((f, i) => (
                <Item key={f.id} media={<span className="mono faint">{String(i + 1).padStart(2, '0')}</span>} onUp={i ? () => setL((l) => swap(l.faq, i, i - 1)) : undefined} onDel={() => setL((l) => void l.faq.splice(i, 1))}>
                  <input className="input" style={{ fontWeight: 500 }} value={f.q} onChange={(e) => setL((l) => void (l.faq[i].q = e.target.value))} />
                  <textarea className="textarea" value={f.a} onChange={(e) => setL((l) => void (l.faq[i].a = e.target.value))} />
                </Item>
              ))}
            </Blk>
          )}

          {tab === 'paket' && (
            <>
              {packages.map((p) => (
                <Blk key={p.id} title={p.title} action={<label className="check" style={{ fontSize: 13 }}><input type="checkbox" checked={p.active} onChange={(e) => setP(p.id, (x) => void (x.active = e.target.checked))} /> satışta</label>}>
                  <div className="grid2">
                    <F label="Paket adı"><input className="input" value={p.title} onChange={(e) => setP(p.id, (x) => void (x.title = e.target.value))} /></F>
                    <F label="Rozet (opsiyonel)"><input className="input" value={p.badge ?? ''} onChange={(e) => setP(p.id, (x) => void (x.badge = e.target.value || undefined))} /></F>
                  </div>
                  <div className="grid3">
                    <F label="Fiyat (₺, KDV dahil)"><input className="input mono" type="number" value={p.price} onChange={(e) => setP(p.id, (x) => void (x.price = +e.target.value))} /></F>
                    <F label="Üstü çizili fiyat"><input className="input mono" type="number" value={p.oldPrice ?? ''} onChange={(e) => setP(p.id, (x) => void (x.oldPrice = e.target.value ? +e.target.value : undefined))} /></F>
                    <F label="Maks. taksit">
                      <select className="select" value={p.installments} onChange={(e) => setP(p.id, (x) => void (x.installments = +e.target.value))}>
                        {[1, 2, 3, 6, 9].map((n) => <option key={n} value={n}>{n === 1 ? 'Tek çekim' : n}</option>)}
                      </select>
                    </F>
                  </div>
                  <F label="Pakete dahil eğitimler">
                    <div className="filters">
                      {courses.map((c) => (
                        <button key={c.id} className={`chip ${p.courseIds.includes(c.id) ? 'on' : ''}`} onClick={() => setP(p.id, (x) => void (x.courseIds = x.courseIds.includes(c.id) ? x.courseIds.filter((y) => y !== c.id) : [...x.courseIds, c.id]))}>
                          {p.courseIds.includes(c.id) && <Icon name="check" size={12} />} {c.title}
                        </button>
                      ))}
                    </div>
                  </F>
                  <F label="Özellik listesi" hint="her satır bir madde">
                    <textarea className="textarea" value={p.features.join('\n')} onChange={(e) => setP(p.id, (x) => void (x.features = e.target.value.split('\n')))} />
                  </F>
                  <button className="btn danger sm" style={{ justifySelf: 'start' }} onClick={() => confirm('Paket silinsin mi?') && update((d) => void (d.packages = d.packages.filter((x) => x.id !== p.id)))}><Icon name="trash" size={14} /> Paketi sil</button>
                </Blk>
              ))}
              <button
                className="btn ghost block"
                style={{ marginTop: 12 }}
                onClick={() => update((d) => void d.packages.push({ id: uid('p'), brandId: brand.id, title: 'Yeni paket', price: 990, installments: 3, courseIds: courses.slice(0, 1).map((c) => c.id), features: ['Madde 1', 'Madde 2'], active: true }))}
              >
                <Icon name="plus" /> Paket ekle
              </button>
            </>
          )}

          {tab === 'genel' && (
            <>
              <Blk title="Kimlik">
                <div className="grid2">
                  <F label="Marka adı"><input className="input" value={brand.name} onChange={(e) => setB((b) => void (b.name = e.target.value))} /></F>
                  <F label="Monogram"><input className="input" maxLength={2} value={brand.monogram} onChange={(e) => setB((b) => void (b.monogram = e.target.value))} /></F>
                </div>
                <F label="Kısa tanım"><input className="input" value={brand.tagline} onChange={(e) => setB((b) => void (b.tagline = e.target.value))} /></F>
                <F label="Marka rengi">
                  <div className="swatches">
                    {palette.map(([a, s]) => (
                      <button key={a} className={brand.accent === a ? 'on' : ''} style={{ background: a }} onClick={() => setB((b) => { b.accent = a; b.accentSoft = s })} aria-label={a} />
                    ))}
                  </div>
                </F>
              </Blk>
              <Blk title="Domain">
                <F label="Alan adı" hint="Gelen istek Host başlığına göre bu markaya yönlendirilir">
                  <input className="input mono" value={brand.domain} onChange={(e) => setB((b) => void (b.domain = e.target.value))} />
                </F>
                <F label="Platform adresi (yedek)"><input className="input mono" value={`kurss.app/${brand.slug}`} readOnly /></F>
                <div className="mono" style={{ background: 'var(--paper-2)', padding: 12, borderRadius: 10, fontSize: 12, lineHeight: 1.7 }}>
                  <div className="label" style={{ marginBottom: 6 }}>DNS kaydı</div>
                  <div>CNAME&nbsp;&nbsp;{brand.domain.split('.').length > 2 ? brand.domain.split('.')[0] : '@'}&nbsp;&nbsp;→&nbsp;&nbsp;edge.kurss.app</div>
                  <div className="row" style={{ gap: 6, marginTop: 6 }}><span className="tag ok"><span className="dot" /> SSL aktif</span><span className="tag ok">DNS doğrulandı</span></div>
                </div>
              </Blk>
              <Blk title="Fatura bilgileri">
                <F label="Fatura unvanı"><input className="input" value={brand.invoiceTitle} onChange={(e) => setB((b) => void (b.invoiceTitle = e.target.value))} /></F>
                <F label="VKN"><input className="input mono" value={brand.taxNo} onChange={(e) => setB((b) => void (b.taxNo = e.target.value))} /></F>
                <small className="muted">Farklı şirket altında satış yapan markalar için ayrı PayTR mağaza bilgisi ve e-Arşiv entegratör anahtarı tanımlanır.</small>
              </Blk>
            </>
          )}
        </div>

        <div className="preview-frame">
          <div className="chrome">
            <span className="row" style={{ gap: 4 }}>{['#e8735f', '#e6b84a', '#6cc070'].map((c) => <i key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'block' }} />)}</span>
            <span className="url">https://{brand.domain}</span>
            <span className="label">canlı önizleme</span>
          </div>
          <div className="viewport">
            <div className="scale">
              <LandingView brand={brand} packages={packages.filter((p) => p.active)} courses={courses} embedded />
            </div>
          </div>
        </div>
      </div>
      {toast.node}
      <div className="mono faint" style={{ marginTop: 18 }}>En ucuz paket: {packages.length ? tl(Math.min(...packages.map((p) => p.price))) : '—'}</div>
    </>
  )
}

function swap<T>(arr: T[], a: number, b: number) {
  ;[arr[a], arr[b]] = [arr[b], arr[a]]
}

function Blk({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="blk">
      <div className="blk-head"><b>{title}</b>{action}</div>
      {children}
    </div>
  )
}

function F({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  )
}

function Item({ media, children, onUp, onDel }: { media: ReactNode; children: ReactNode; onUp?: () => void; onDel: () => void }) {
  return (
    <div className="listitem">
      {media}
      <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>{children}</div>
      <div className="ctrls">
        {onUp && <button className="iconbtn" title="Yukarı" onClick={onUp}><Icon name="up" size={14} /></button>}
        <button className="iconbtn" title="Sil" onClick={onDel}><Icon name="trash" size={14} /></button>
      </div>
    </div>
  )
}
