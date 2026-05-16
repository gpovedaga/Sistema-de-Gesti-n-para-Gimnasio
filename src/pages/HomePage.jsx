import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Dumbbell, Users, Calendar, CreditCard, Star, ChevronRight, ArrowRight, Play, Shield, Clock, Award, Menu, X } from 'lucide-react'
import './HomePage.css'

const SLIDES = [
  {
    title: 'TRANSFORMA\nTU CUERPO',
    subtitle: 'El gimnasio donde los límites no existen',
    badge: '🔥 Más de 500 miembros activos',
    bg: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a00 50%, #0a0a0f 100%)',
    accent: '#ff4d00',
  },
  {
    title: 'FUERZA\nY DISCIPLINA',
    subtitle: 'Instructores certificados listos para guiarte',
    badge: '💪 +20 clases semanales',
    bg: 'linear-gradient(135deg, #0a0a0f 0%, #001a1a 50%, #0a0a0f 100%)',
    accent: '#00d4aa',
  },
  {
    title: 'RESULTADOS\nREALES',
    subtitle: 'Tecnología y gestión para tu experiencia perfecta',
    badge: '⚡ Sistema GymOS activo',
    bg: 'linear-gradient(135deg, #0a0a0f 0%, #0a001a 50%, #0a0a0f 100%)',
    accent: '#8b5cf6',
  },
]

const PLANS = [
  { name: 'MENSUAL',     price: '$120.000',  days: 30,  color: '#3b82f6', features: ['Acceso total al gimnasio','Clases grupales','Vestuarios'] },
  { name: 'TRIMESTRAL',  price: '$320.000',  days: 90,  color: '#ff4d00', features: ['Todo del mensual','Descuento del 11%','Reserva prioritaria'], popular: true },
  { name: 'SEMESTRAL',   price: '$550.000',  days: 180, color: '#22c55e', features: ['Todo del trimestral','Descuento del 23%','Asesoría nutricional'] },
  { name: 'ANUAL',       price: '$900.000',  days: 365, color: '#8b5cf6', features: ['Todo el semestral','Descuento del 37%','Acceso VIP'] },
]

const CLASSES = [
  { name: 'CrossFit', icon: '🔥', level: 'Avanzado',    color: '#ff4d00' },
  { name: 'Yoga',     icon: '🧘', level: 'Básico',      color: '#22c55e' },
  { name: 'Spinning', icon: '🚴', level: 'Intermedio',  color: '#3b82f6' },
  { name: 'Pilates',  icon: '🤸', level: 'Básico',      color: '#8b5cf6' },
  { name: 'Boxeo',    icon: '🥊', level: 'Intermedio',  color: '#f59e0b' },
  { name: 'Funcional',icon: '⚡', level: 'Avanzado',    color: '#ef4444' },
]

const STATS = [
  { value: '500+', label: 'Miembros activos', icon: Users },
  { value: '20+',  label: 'Clases semanales', icon: Calendar },
  { value: '10+',  label: 'Instructores',     icon: Award },
  { value: '5+',   label: 'Salas equipadas',  icon: Shield },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [slide,    setSlide]    = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goSlide = i => { setSlide(i); clearInterval(intervalRef.current); intervalRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000) }

  const current = SLIDES[slide]

  return (
    <div className="home">
      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <nav className={`home-nav ${scrolled ? 'home-nav--scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="nav-logo-icon"><Zap size={18} /></div>
            <span>GYM<span>OS</span></span>
          </div>

          <div className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
            <a href="#inicio"   onClick={() => setMenuOpen(false)}>Inicio</a>
            <a href="#clases"   onClick={() => setMenuOpen(false)}>Clases</a>
            <a href="#planes"   onClick={() => setMenuOpen(false)}>Planes</a>
            <a href="#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a>
          </div>

          <div className="nav-actions">
            <button className="nav-btn nav-btn--ghost" onClick={() => navigate('/login')}>Iniciar sesión</button>
            <button className="nav-btn nav-btn--primary" onClick={() => navigate('/registro')}>
              Únete ahora <ArrowRight size={14} />
            </button>
            <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO CAROUSEL ────────────────────────────────────── */}
      <section id="inicio" className="hero" style={{ background: current.bg }}>
        <div className="hero-bg-grid" />
        <div className="hero-orb" style={{ background: current.accent }} />

        <div className="hero-content">
          <div className="hero-badge" style={{ borderColor: `${current.accent}40`, color: current.accent }}>
            {current.badge}
          </div>
          <h1 className="hero-title" key={slide} style={{ '--accent': current.accent }}>
            {current.title.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
          <p className="hero-subtitle">{current.subtitle}</p>
          <div className="hero-actions">
            <button className="hero-btn hero-btn--primary" style={{ background: current.accent }} onClick={() => navigate('/registro')}>
              Comenzar ahora <ArrowRight size={18} />
            </button>
            <button className="hero-btn hero-btn--ghost" onClick={() => navigate('/login')}>
              <Play size={16} fill="currentColor" /> Ya soy miembro
            </button>
          </div>
        </div>

        <div className="hero-carousel-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`dot ${i === slide ? 'dot--active' : ''}`}
              style={i === slide ? { background: current.accent } : {}}
              onClick={() => goSlide(i)} />
          ))}
        </div>

        <div className="hero-scroll-hint">
          <div className="scroll-mouse"><div className="scroll-wheel" /></div>
          <span>Desliza</span>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="stats-bar">
        {STATS.map(({ value, label, icon: Icon }) => (
          <div key={label} className="stats-item">
            <Icon size={20} color="var(--accent)" />
            <span className="stats-value">{value}</span>
            <span className="stats-label">{label}</span>
          </div>
        ))}
      </section>

      {/* ── CLASES ───────────────────────────────────────────── */}
      <section id="clases" className="section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">🏋️ Disciplinas</span>
            <h2 className="section-title">NUESTRAS <span>CLASES</span></h2>
            <p className="section-subtitle">Encuentra la disciplina que más se adapte a tus objetivos y nivel de experiencia</p>
          </div>

          <div className="classes-grid">
            {CLASSES.map(({ name, icon, level, color }) => (
              <div key={name} className="class-card" style={{ '--card-color': color }}>
                <div className="class-icon" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <span>{icon}</span>
                </div>
                <h3 className="class-name">{name}</h3>
                <span className="class-level" style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>{level}</span>
                <div className="class-hover-line" style={{ background: color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANES ───────────────────────────────────────────── */}
      <section id="planes" className="section section--dark">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">💳 Membresías</span>
            <h2 className="section-title">ELIGE TU <span>PLAN</span></h2>
            <p className="section-subtitle">Todos los planes incluyen acceso completo a nuestras instalaciones</p>
          </div>

          <div className="plans-grid">
            {PLANS.map(({ name, price, days, color, features, popular }) => (
              <div key={name} className={`plan-card ${popular ? 'plan-card--popular' : ''}`} style={{ '--plan-color': color }}>
                {popular && <div className="plan-badge" style={{ background: color }}>⭐ MÁS POPULAR</div>}
                <div className="plan-header">
                  <h3 className="plan-name" style={{ color }}>{name}</h3>
                  <div className="plan-price">{price}</div>
                  <div className="plan-duration">{days} días de acceso</div>
                </div>
                <ul className="plan-features">
                  {features.map(f => (
                    <li key={f}>
                      <span style={{ color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button className="plan-btn" style={{ borderColor: color, color }} onClick={() => navigate('/registro')}>
                  Elegir plan <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOSOTROS ─────────────────────────────────────────── */}
      <section id="nosotros" className="section">
        <div className="section-inner">
          <div className="about-grid">
            <div className="about-text">
              <span className="section-tag">💪 Sobre nosotros</span>
              <h2 className="section-title">¿POR QUÉ <span>ELEGIRNOS?</span></h2>
              <p className="about-desc">
                GymOS es más que un gimnasio — es un sistema integral de gestión que garantiza la mejor experiencia para cada miembro. Nuestro equipo de instructores certificados y nuestra tecnología de punta hacen la diferencia.
              </p>
              <div className="about-features">
                {[
                  { icon: '🔒', title: 'Sistema seguro', desc: 'Acceso basado en roles con autenticación JWT' },
                  { icon: '📊', title: 'Gestión total', desc: 'Controla membresías, pagos y reservas en tiempo real' },
                  { icon: '⚡', title: 'Rápido y moderno', desc: 'Tecnología React + Spring Boot + PostgreSQL' },
                  { icon: '👨‍💻', title: 'Soporte completo', desc: 'Personal disponible para ayudarte siempre' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="about-feature">
                    <span className="about-feature-icon">{icon}</span>
                    <div>
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-visual">
              <div className="about-card about-card--main">
                <Dumbbell size={40} color="var(--accent)" />
                <h3>Universidad El Bosque</h3>
                <p>Proyecto Final — Bases de Datos 1</p>
                <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Ing. Christian Felipe Duarte</p>
              </div>
              <div className="about-card about-card--sm about-card--top">
                <Star size={24} color="#f59e0b" />
                <span>Gestión completa</span>
              </div>
              <div className="about-card about-card--sm about-card--bot">
                <Shield size={24} color="#22c55e" />
                <span>Seguridad total</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-bg-orb" />
        <div className="cta-inner">
          <h2 className="cta-title">¿LISTO PARA EMPEZAR?</h2>
          <p className="cta-subtitle">Únete hoy y transforma tu vida. Regístrate como miembro en segundos.</p>
          <div className="cta-actions">
            <button className="hero-btn hero-btn--primary" onClick={() => navigate('/registro')}>
              Registrarme ahora <ArrowRight size={18} />
            </button>
            <button className="hero-btn hero-btn--ghost" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <Zap size={18} color="var(--accent)" />
            <span>GYM<span>OS</span></span>
          </div>
          <p className="footer-text">Sistema de Gestión para Gimnasio · Universidad El Bosque · Bases de Datos 1 · 2026</p>
          <div className="footer-links">
            <button onClick={() => navigate('/login')}>Iniciar sesión</button>
            <button onClick={() => navigate('/registro')}>Registrarse</button>
          </div>
        </div>
      </footer>
    </div>
  )
}