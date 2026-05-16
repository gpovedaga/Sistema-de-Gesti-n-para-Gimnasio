import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { miembroService, authService } from '../services/api'
import './RegisterPage.css'

const STEPS = ['Datos personales', 'Acceso', 'Confirmar']

const EMPTY = {
  documento: '', nombreCompleto: '', correoElectronico: '',
  telefono: '', fechaNacimiento: '',
  password: '', confirmPassword: ''
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const nextStep = e => {
    e.preventDefault()
    setError('')
    if (step === 1 && form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.'); return
    }
    if (step === 1 && form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.'); return
    }
    setStep(s => s + 1)
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await miembroService.crear({
        documento: form.documento,
        nombreCompleto: form.nombreCompleto,
        correoElectronico: form.correoElectronico,
        telefono: form.telefono,
        fechaNacimiento: form.fechaNacimiento,
        password: form.password,
        estado: 'activo'
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data || 'Error al registrarse. Intenta de nuevo.')
      setStep(0)
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="register-root">
        <div className="register-bg">
          <div className="register-orb" />
        </div>
        <div className="register-card success-card animate-fade">
          <CheckCircle size={56} color="var(--success)" />
          <h2>¡Registro exitoso!</h2>
          <p>Tu cuenta de miembro ha sido creada. Ya puedes iniciar sesión cuando el administrador active tu perfil completo.</p>
          <button className="reg-btn" onClick={() => navigate('/login')}>
            Ir a iniciar sesión
          </button>
          <button className="reg-btn-ghost" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="register-root">
      <div className="register-bg">
        <div className="register-orb" />
        <div className="register-grid" />
      </div>

      <div className="register-card animate-fade">
        {/* Header */}
        <div className="reg-header">
          <button className="reg-back" onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/')}>
            <ArrowLeft size={16} />
          </button>
          <div className="reg-logo">
            <div className="reg-logo-icon"><Zap size={16} /></div>
            <span>GYM<span>OS</span></span>
          </div>
        </div>

        <h1 className="reg-title">Crear cuenta</h1>
        <p className="reg-subtitle">Regístrate como <strong>miembro</strong> del gimnasio</p>

        {/* Steps */}
        <div className="reg-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`reg-step ${i === step ? 'reg-step--active' : ''} ${i < step ? 'reg-step--done' : ''}`}>
              <div className="reg-step-dot">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="reg-progress">
          <div className="reg-progress-fill" style={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }} />
        </div>

        {error && <div className="reg-error">{error}</div>}

        {/* Step 0: Datos personales */}
        {step === 0 && (
          <form onSubmit={nextStep} className="reg-form">
            <div className="reg-field">
              <label>Número de documento *</label>
              <input name="documento" value={form.documento} onChange={handle} placeholder="Ej: 1234567890" required />
            </div>
            <div className="reg-field">
              <label>Nombre completo *</label>
              <input name="nombreCompleto" value={form.nombreCompleto} onChange={handle} placeholder="Tu nombre completo" required />
            </div>
            <div className="reg-field">
              <label>Fecha de nacimiento *</label>
              <input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handle} required />
            </div>
            <div className="reg-field">
              <label>Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handle} placeholder="Ej: 3101234567" />
            </div>
            <button type="submit" className="reg-btn">Continuar →</button>
          </form>
        )}

        {/* Step 1: Acceso */}
        {step === 1 && (
          <form onSubmit={nextStep} className="reg-form">
            <div className="reg-field">
              <label>Correo electrónico *</label>
              <input name="correoElectronico" type="email" value={form.correoElectronico} onChange={handle} placeholder="tu@correo.com" required />
            </div>
            <div className="reg-field">
              <label>Contraseña *</label>
              <div className="reg-pass-wrap">
                <input name="password" type={show ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="Mínimo 6 caracteres" required />
                <button type="button" onClick={() => setShow(s => !s)}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="reg-field">
              <label>Confirmar contraseña *</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handle} placeholder="Repite tu contraseña" required />
            </div>
            <p className="reg-note">
              ℹ️ El correo y contraseña serán para ingresar al sistema. Tu acceso estará disponible una vez el administrador gestione tu membresía.
            </p>
            <button type="submit" className="reg-btn">Continuar →</button>
          </form>
        )}

        {/* Step 2: Confirmar */}
        {step === 2 && (
          <form onSubmit={submit} className="reg-form">
            <div className="reg-confirm">
              <h3>Confirma tus datos</h3>
              <div className="reg-confirm-grid">
                {[
                  ['Documento', form.documento],
                  ['Nombre', form.nombreCompleto],
                  ['Nacimiento', form.fechaNacimiento],
                  ['Teléfono', form.telefono || '—'],
                  ['Correo', form.correoElectronico],
                  ['Contraseña', '••••••••'],
                ].map(([k, v]) => (
                  <div key={k} className="reg-confirm-item">
                    <span className="reg-confirm-key">{k}</span>
                    <span className="reg-confirm-val">{v}</span>
                  </div>
                ))}
              </div>
              <p className="reg-note" style={{ marginTop: 16 }}>
                ⚠️ Al registrarte aceptas que el personal del gimnasio gestionará tu membresía. Solo podrás iniciar sesión una vez que un administrador configure tu acceso al sistema.
              </p>
            </div>
            <button type="submit" className="reg-btn" disabled={loading}>
              {loading ? <span className="reg-spinner" /> : '✅ Confirmar registro'}
            </button>
          </form>
        )}

        <p className="reg-footer-text">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}