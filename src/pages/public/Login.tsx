import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { Avatar, KurssMark } from '../../components/ui'

export default function Login() {
  const { state, login } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const u = state.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
    if (!u) return setErr('Bu e-posta ile kayıtlı hesap bulunamadı.')
    login(u.id)
    nav(u.role === 'admin' ? '/yonetim' : u.role === 'teacher' ? '/egitmen' : '/ogrenci')
  }
  const quick = ['u_s1', 'u_t1', 'u_admin'].map((id) => state.users.find((u) => u.id === id)!)
  return (
    <div className="login">
      <form className="card pad" onSubmit={submit} style={{ display: 'grid', gap: 18, width: 'min(420px, 100%)' }}>
        <Link to="/" className="row" style={{ gap: 10, textDecoration: 'none', fontWeight: 600 }}>
          <KurssMark /> Kurss
        </Link>
        <h1 className="serif" style={{ fontSize: 40, lineHeight: 1 }}>Giriş yap</h1>
        <label className="field">
          <span>E-posta</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" required />
        </label>
        <label className="field">
          <span>Şifre</span>
          <input className="input" type="password" defaultValue="demo1234" />
        </label>
        {err && <span className="tag bad">{err}</span>}
        <button className="btn block lg">Devam</button>
        <hr className="hr" />
        <span className="label">Demo hesaplar</span>
        {quick.map((u) => (
          <button type="button" key={u.id} className="btn ghost block" style={{ justifyContent: 'flex-start' }} onClick={() => setEmail(u.email)}>
            <Avatar src={u.avatar} name={u.name} size={22} /> {u.name} <span className="muted mono" style={{ marginLeft: 'auto' }}>{u.role}</span>
          </button>
        ))}
      </form>
    </div>
  )
}
