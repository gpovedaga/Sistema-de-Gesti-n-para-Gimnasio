import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Dumbbell, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { miembroService } from '../services/api'
import './RegisterPage.css'

const STEPS = ['Datos personales', 'Acceso', 'Confirmar']

const EMPTY = {
  documento: '', nombreCompleto: '', correoElectronico: '',
  telefono: '', fechaNacimiento: '',
  password: '', confirmPassword: '',
  acudienteNombre: '', acudienteTelefono: '', acudienteCorreo: '', acudienteParentesco: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [esMenor, setEsMenor] = useState(false)

  const handle = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (e.target.name === 'fechaNacimiento') {
      const age = new Date().getFullYear() - new Date(e.target.value).getFullYear()
      setEsMenor(age < 18)
    }
  }

  const nextStep = e => {
    e.preventDefault()
    setError('')
    if (step === 1 && form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden.'); return }
    if (step === 1 && form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
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
        estado: 'activo',
        acudienteNombre: form.acudienteNombre || null,
        acudienteTelefono: form.acudienteTelefono || null,
        acudienteCorreo: form.acudienteCorreo || null,
        acudienteParentesco: form.acudienteParentesco || null,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error al registrarse.')
      setStep(0)
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="register-root">
      <div className="register-card">
        <div className="register-success">
          <div className="success-icon"><CheckCircle size={32} /></div>
          <h2>REGISTRO EXITOSO</h2>
          <p>Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión en el portal de miembros.</p>
          <button className="register-btn-submit" style={{ width: '100%' }} onClick={() => navigate('/login')}>
            Ir al login <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="register-root">
      <div className="register-card">
        {/* Logo */}
        <div className="register-logo" onClick={() => navigate('/')}>
          <div className="register-logo-icon"><Dumbbell size={22} /></div>
          <div className="register-logo-text">GYM<span>OS</span></div>
        </div>

        <div className="register-steps">
          {STEPS.map((label, i) => (
            <div key={i} className="step-item">
              <div className={`step-bubble step-bubble--${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                {i < step ? '' : i + 1}
              </div>
              <span className={`step-label step-label--${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`step-line step-line--${i < step ? 'done' : 'pending'}`} />
              )}
            </div>
          ))}
        </div>

        <h2 className="register-heading">
          {step === 0 ? 'TUS DATOS' : step === 1 ? 'TU ACCESO' : 'CONFIRMAR'}
        </h2>
        <p className="register-sub">
          {step === 0 ? 'Completa tu información personal' : step === 1 ? 'Elige tus credenciales de ingreso' : 'Revisa que todo esté correcto'}
        </p>

        {error && <div className="register-error">{error}</div>}

        {step === 0 && (
          <form onSubmit={nextStep} className="register-form">
            <div className="register-field">
              <label>Documento de identidad</label>
              <input name="documento" placeholder="Número de documento" value={form.documento} onChange={handle} required />
            </div>
            <div className="register-field">
              <label>Nombre completo</label>
              <input name="nombreCompleto" placeholder="Tu nombre completo" value={form.nombreCompleto} onChange={handle} required />
            </div>
            <div className="register-field">
              <label>Correo electrónico</label>
              <input name="correoElectronico" type="email" placeholder="tu@correo.com" value={form.correoElectronico} onChange={handle} required />
            </div>
            <div className="register-field">
              <label>Teléfono</label>
              <input name="telefono" placeholder="Número de teléfono" value={form.telefono} onChange={handle} />
            </div>
            <div className="register-field">
              <label>Fecha de nacimiento</label>
              <input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handle} required />
            </div>
            {esMenor && (
              <div className="minor-section">
                <div className="minor-section-title">Datos del acudiente (menor de edad)</div>
                {['acudienteNombre', 'acudienteTelefono', 'acudienteCorreo', 'acudienteParentesco'].map(field => (
                  <div key={field} className="register-field" style={{ marginBottom: 12 }}>
                    <label>{field.replace('acudiente', '').replace(/([A-Z])/g, ' $1').trim()}</label>
                    <input name={field} value={form[field]} onChange={handle} />
                  </div>
                ))}
              </div>
            )}
            <div className="register-actions">
              <button type="button" className="register-btn-back" onClick={() => navigate('/login')}>
                <ArrowLeft size={14} /> Volver
              </button>
              <button type="submit" className="register-btn-next">
                Continuar <ArrowRight size={14} />
              </button>
            </div>
            <p className="register-login-link">
              Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={nextStep} className="register-form">
            <div className="register-field">
              <label>Contraseña</label>
              <div className="pass-wrap">
                <input
                  name="password" type={show ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password} onChange={handle} required
                />
                <button type="button" className="pass-eye" onClick={() => setShow(s => !s)}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="register-field">
              <label>Confirmar contraseña</label>
              <input
                name="confirmPassword" type="password"
                placeholder="Repite la contraseña"
                value={form.confirmPassword} onChange={handle} required
              />
            </div>
            <div className="register-actions">
              <button type="button" className="register-btn-back" onClick={() => setStep(0)}>
                <ArrowLeft size={14} /> Atrás
              </button>
              <button type="submit" className="register-btn-next">
                Continuar <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submit} className="register-form">
            <div className="confirm-summary">
              {[
                ['Documento', form.documento],
                ['Nombre', form.nombreCompleto],
                ['Correo', form.correoElectronico],
                ['Teléfono', form.telefono],
                ['Nacimiento', form.fechaNacimiento],
              ].map(([label, value]) => value && (
                <div key={label} className="confirm-row">
                  <span className="confirm-label">{label}</span>
                  <span className="confirm-value">{value}</span>
                </div>
              ))}
            </div>
            <div className="register-actions">
              <button type="button" className="register-btn-back" onClick={() => setStep(1)}>
                <ArrowLeft size={14} /> Atrás
              </button>
              <button type="submit" className="register-btn-submit" disabled={loading}>
                {loading ? <span className="reg-spinner" /> : <>Registrarme <CheckCircle size={15} /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
