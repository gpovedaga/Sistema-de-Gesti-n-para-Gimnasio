import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Dumbbell, Eye, EyeOff } from 'lucide-react'
import './LoginPage.css'

export default function LoginPage() {
  const { login, loginMiembro } = useAuth()
  const navigate = useNavigate()

  const [tipo, setTipo] = useState('empleado')
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
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-panel-form">
        <div className="login-form-container">
          <div className="login-logo">
            <div className="login-logo-icon"><Dumbbell size={26} /></div>
            <div>
              <div className="login-logo-text">GYM<span>OS</span></div>
              <div className="login-logo-sub">Sistema de Gestión</div>
            </div>
          </div>

          <div className="login-toggle">
            <button
              type="button"
              className={`toggle-btn ${tipo === 'empleado' ? 'toggle-btn--active' : ''}`}
              onClick={() => { setTipo('empleado'); setError('') }}
            >
              Empleado
            </button>
            <button
              type="button"
              className={`toggle-btn ${tipo === 'miembro' ? 'toggle-btn--active' : ''}`}
              onClick={() => { setTipo('miembro'); setError('') }}
              style={tipo === 'miembro' ? { background: '#3b82f6' } : {}}
            >
              Miembro
            </button>
          </div>

          <h2 className="login-heading">
            {tipo === 'empleado' ? 'BIENVENIDO' : 'MI PORTAL'}
          </h2>
          <p className="login-desc">
            {tipo === 'empleado'
              ? 'Ingresa tus credenciales para acceder al panel'
              : 'Accede a tus clases y reservas personales'}
          </p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={submit} className="login-form">
            <div className="login-field">
              <label>Correo electrónico</label>
              <input
                name="correo" type="email"
                placeholder={tipo === 'empleado' ? 'correo@gimnasio.com' : 'tu@correo.com'}
                value={form.correo} onChange={handle} required autoFocus
              />
            </div>
            <div className="login-field">
              <label>Contraseña</label>
              <div className="login-pass-wrap">
                <input
                  name="password" type={show ? 'text' : 'password'}
                  placeholder="Contraseña" value={form.password} onChange={handle} required
                />
                <button type="button" className="login-eye" onClick={() => setShow(s => !s)} aria-label="Ver contraseña">
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
              <p>Acceso según rol</p>
              <div className="login-role-tags">
                <span style={{ background: 'rgba(26,77,181,0.12)', color: '#1a4db5', border: '1px solid rgba(26,77,181,0.25)' }}>Administrador</span>
                <span style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' }}>Recepcionista</span>
                <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>Instructor</span>
                <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>Técnico</span>
              </div>
            </div>
          )}

          {tipo === 'miembro' && (
            <p className="login-register-link">
              Sin cuenta? <a href="/registro">Regístrate aquí</a>
            </p>
          )}
        </div>
      </div>

      <div className="login-panel-visual">
        <div className="login-visual-img" />
        <div className="login-visual-overlay" />
        <div className="login-visual-content">
          <span className="login-visual-tag">GYMOS</span>
          <h2 className="login-visual-title">FUERZA.<br />DISCIPLINA.<br />RESULTADOS.</h2>
          <p className="login-visual-sub">Gestiona tu gimnasio con precisión y control total desde un solo lugar.</p>
        </div>
      </div>
    </div>
  )
}
