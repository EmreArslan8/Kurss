import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import type { Brand } from '../data/types'

/* Görsel yüklenemezse (ağ, 404) desenli yer tutucu gösterir */
export function Img({ src, alt, className = '', style, label }: { src?: string; alt: string; className?: string; style?: CSSProperties; label?: string }) {
  const [bad, setBad] = useState(!src)
  useEffect(() => setBad(!src), [src])
  return (
    <div className={`imgbox ${className}`} style={style}>
      {!bad && <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />}
      {bad && <div className="ph">{label ?? initials(alt)}</div>}
    </div>
  )
}

export const initials = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toLocaleUpperCase('tr-TR'))
    .join('')

export function Avatar({ src, name, size = 32 }: { src?: string; name: string; size?: number }) {
  const [bad, setBad] = useState(!src)
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  if (bad)
    return (
      <span
        className="avatar"
        style={{
          width: size,
          height: size,
          display: 'grid',
          placeItems: 'center',
          background: `hsl(${hue} 30% 86%)`,
          color: `hsl(${hue} 35% 28%)`,
          fontSize: size * 0.38,
          fontWeight: 600,
        }}
      >
        {initials(name)}
      </span>
    )
  return <img className="avatar" src={src} alt={name} width={size} height={size} style={{ width: size, height: size, objectFit: 'cover' }} onError={() => setBad(true)} />
}

/* Panelden girilen metni düz yazı olarak basar (eski *yıldız* işaretleri temizlenir) */
export function Rich({ text }: { text: string }) {
  return <>{text.replace(/\*/g, '')}</>
}

export function BrandMark({ brand, size = 30 }: { brand: Pick<Brand, 'monogram' | 'accent' | 'name'>; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: brand.accent,
        color: '#fff',
        display: 'inline-grid',
        placeItems: 'center',
        fontSize: size * (brand.monogram.length > 1 ? 0.42 : 0.52),
        lineHeight: 1,
        flex: 'none',
        fontWeight: 600,
        fontFamily: 'var(--sans)',
      }}
    >
      {brand.monogram}
    </span>
  )
}

export function KurssMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--ink)" />
      <path d="M10 8v16M10 16l9-8M13 13.5L21 24" stroke="var(--paper)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

const ytId = (url: string) => url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1]
const vimeoId = (url: string) => url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]

/* YouTube, Vimeo veya doğrudan mp4 bağlantısını oynatır */
export function VideoEmbed({
  url,
  poster,
  className = '',
  onEnded,
  onTime,
  autoPlay,
}: {
  url: string
  poster?: string
  className?: string
  onEnded?: () => void
  onTime?: (t: number, d: number) => void
  autoPlay?: boolean
}) {
  const [started, setStarted] = useState(!!autoPlay)
  const yt = ytId(url)
  const vm = vimeoId(url)
  if (yt || vm) {
    const src = yt ? `https://www.youtube-nocookie.com/embed/${yt}?rel=0&autoplay=${started ? 1 : 0}` : `https://player.vimeo.com/video/${vm}?autoplay=${started ? 1 : 0}`
    return (
      <div className={`video ${className}`}>
        {started ? (
          <iframe src={src} title="video" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <PosterButton poster={poster} onClick={() => setStarted(true)} />
        )}
      </div>
    )
  }
  return (
    <div className={`video ${className}`}>
      {started ? (
        <video
          src={url}
          poster={poster}
          controls
          autoPlay
          playsInline
          onEnded={onEnded}
          onTimeUpdate={(e) => onTime?.(e.currentTarget.currentTime, e.currentTarget.duration)}
        />
      ) : (
        <PosterButton poster={poster} onClick={() => setStarted(true)} />
      )}
    </div>
  )
}

function PosterButton({ poster, onClick }: { poster?: string; onClick: () => void }) {
  return (
    <button className="video-poster" onClick={onClick} aria-label="Videoyu oynat">
      <Img src={poster} alt="video" className="fill" label=" " />
      <span className="play">
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
        </svg>
      </span>
    </button>
  )
}

export function Toast({ msg, onDone }: { msg: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [msg, onDone])
  return msg ? <div className="toast">{msg}</div> : null
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  return { msg, show: setMsg, node: <Toast msg={msg} onDone={() => setMsg(null)} /> }
}

export function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} / 5`} style={{ letterSpacing: 2, fontSize: 13 }}>
      {'★★★★★'.slice(0, n)}
      <span style={{ opacity: 0.2 }}>{'★★★★★'.slice(n)}</span>
    </span>
  )
}

export function Section({ title, aside, children }: { title: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="psec">
      <header>
        <h2 className="serif">{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  )
}

/* Basit ikon seti (stroke) */
const paths: Record<string, ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  back: <path d="M19 12H5M11 18l-6-6 6-6" />,
  check: <path d="M4 12.5l5 5L20 6.5" />,
  play: <path d="M7 4.5v15l13-7.5z" />,
  file: <><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4" /></>,
  down: <><path d="M12 4v12M6 10l6 6 6-6" /><path d="M4 20h16" /></>,
  spark: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14.8c1.8.8 3 2.6 3.5 5.2" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.6 5.7 3.6 9s-1.1 6.3-3.6 9c-2.5-2.7-3.6-5.7-3.6-9S9.5 5.7 12 3z" /></>,
  book: <><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" /><path d="M4 19V5M8 7h7" /></>,
  upload: <><path d="M12 16V4M6 10l6-6 6 6" /><path d="M4 20h16" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  edit: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  logout: <><path d="M15 4h4v16h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></>,
  chev: <path d="M9 6l6 6-6 6" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  drag: <><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></>,
  up: <path d="M6 15l6-6 6 6" />,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
  shield: <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />,
}

export function Icon({ name, size = 16, stroke = 1.7, style }: { name: keyof typeof paths | string; size?: number; stroke?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', ...style }} aria-hidden>
      {paths[name]}
    </svg>
  )
}
