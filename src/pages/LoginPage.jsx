import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, Dumbbell } from 'lucide-react'
import './LoginPage.css'

export default function LoginPage() {
  const { login, loginMiembro } = useAuth()
  const navigate = useNavigate()

  const [tipo, setTipo] = useState('empleado') // 'empleado' | 'miembro'
  const [form, setForm] = useState({ correo: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tipo === 'empleado') {
        await login(form.correo, form.password)
        navigate('/dashboard')
      } else {
        await loginMiembro(form.correo, form.password)
        navigate('/portal')
      }
    } catch (err) {
      console.log('ERROR COMPLETO:', err)
      console.log('RESPUESTA:', err.response?.data)
      console.log('STATUS:', err.response?.status)
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="login-bg-orb orb-1" />
        <div className="login-bg-orb orb-2" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon"><Zap size={28} /></div>
          <div>
            <h1 className="login-logo-text">GYM<span>OS</span></h1>
            <p className="login-logo-sub">Sistema de Gestión</p>
          </div>
        </div>

        {/* Toggle empleado / miembro */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--surface-2,#1a1a2e)', borderRadius: 10, padding: 4 }}>
          <button
            type="button"
            onClick={() => { setTipo('empleado'); setError('') }}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              background: tipo === 'empleado' ? 'var(--accent,#ff4d00)' : 'transparent',
              color: tipo === 'empleado' ? '#fff' : 'var(--text-secondary,#888)'
            }}>
            Empleado
          </button>
          <button
            type="button"
            onClick={() => { setTipo('miembro'); setError('') }}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              background: tipo === 'miembro' ? '#3b82f6' : 'transparent',
              color: tipo === 'miembro' ? '#fff' : 'var(--text-secondary,#888)'
            }}>
            Miembro
          </button>
        </div>

        <h2 className="login-title">
          {tipo === 'empleado' ? 'Bienvenido de nuevo' : 'Portal de Miembros'}
        </h2>
        <p className="login-desc">
          {tipo === 'empleado' ? 'Ingresa tus credenciales para continuar' : 'Accede a tus clases y reservas'}
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={submit} className="login-form">
          <div className="login-field">
            <label>Correo electrónico</label>
            <input name="correo" type="email"
              placeholder={tipo === 'empleado' ? 'correo@gimnasio.com' : 'tu@correo.com'}
              value={form.correo} onChange={handle} required autoFocus />
          </div>
          <div className="login-field">
            <label>Contraseña</label>
            <div className="login-pass-wrap">
              <input name="password" type={show ? 'text' : 'password'}
                placeholder="••••••••" value={form.password} onChange={handle} required />
              <button type="button" className="login-eye" onClick={() => setShow(s => !s)}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : 'Iniciar sesión'}
          </button>
        </form>

        {tipo === 'empleado' && (
          <div className="login-roles">
            <p>Acceso según rol:</p>
            <div className="login-role-tags">
              <span style={{ background: '#ff4d0020', color: '#ff4d00', border: '1px solid #ff4d0040' }}>Administrador</span>
              <span style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640' }}>Recepcionista</span>
              <span style={{ background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40' }}>Instructor</span>
              <span style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40' }}>Técnico</span>
            </div>
          </div>
        )}

        {tipo === 'miembro' && (
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-secondary,#888)' }}>
            ¿No tienes cuenta? <a href="/registro" style={{ color: '#3b82f6' }}>Regístrate aquí</a>
          </p>
        )}
      </div>

      <div className="login-side">
        <Dumbbell size={80} className="login-side-icon" />
        <h2 className="login-side-title">FUERZA.<br />DISCIPLINA.<br />RESULTADOS.</h2>
        <p className="login-side-sub">Gestiona tu gimnasio con precisión y control total.</p>
      </div>
    </div>
  )
}