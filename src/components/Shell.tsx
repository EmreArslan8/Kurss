import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import type { Role } from '../data/types'
import { Avatar, Icon, KurssMark } from './ui'

export interface NavItem {
  to: string
  label: string
  icon: string
  end?: boolean
  badge?: number
}

export function Shell({ role, nav, title }: { role: Role; nav: NavItem[]; title: string }) {
  const { me, login } = useStore()
  const navigate = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [loc.pathname])
  if (!me || me.role !== role) return <Navigate to="/giris" replace />

  return (
    <div className={`shell ${open ? 'open' : ''}`}>
      <aside className="rail">
        <Link to="/" className="rail-brand">
          <KurssMark size={24} />
          <span>Kurss</span>
          <span className="label" style={{ marginLeft: 'auto' }}>{title}</span>
        </Link>
        <nav>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'on' : '')}>
              <Icon name={n.icon} size={17} />
              <span>{n.label}</span>
              {!!n.badge && <span className="badge">{n.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="rail-me">
          <Avatar src={me.avatar} name={me.name} size={32} />
          <span style={{ minWidth: 0 }}>
            <b>{me.name}</b>
            <small className="muted">{me.email}</small>
          </span>
          <button
            className="iconbtn"
            title="Çıkış"
            onClick={() => {
              login(null)
              navigate('/')
            }}
          >
            <Icon name="logout" size={16} />
          </button>
        </div>
      </aside>
      <div className="shell-main">
        <div className="mobile-top">
          <button className="iconbtn" onClick={() => setOpen(!open)} aria-label="Menü">
            <Icon name={open ? 'x' : 'grid'} size={18} />
          </button>
          <span className="row" style={{ gap: 8, fontWeight: 600 }}>
            <KurssMark size={20} /> {title}
          </span>
          <Avatar src={me.avatar} name={me.name} size={28} />
        </div>
        <Outlet />
      </div>
      <div className="scrim" onClick={() => setOpen(false)} />
    </div>
  )
}

export function PageHead({ kicker, title, children }: { kicker?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="phead">
      <div>
        {kicker && <div className="label" style={{ marginBottom: 8 }}>{kicker}</div>}
        <h1 className="serif">{title}</h1>
      </div>
      {children && <div className="row" style={{ flexWrap: 'wrap' }}>{children}</div>}
    </header>
  )
}
