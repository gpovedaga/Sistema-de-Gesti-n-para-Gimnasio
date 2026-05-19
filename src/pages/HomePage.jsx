import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Users, Calendar, Award, Shield, Clock, ChevronRight, ArrowRight, Menu, X } from 'lucide-react'
import './HomePage.css'

const SLIDES = [
  {
    title: "FUERZA\nY DISCIPLINA",
    subtitle: "Resultados reales. Entrenamiento que transforma.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop",
    overlay: "linear-gradient(120deg, rgba(10,18,40,0.88) 40%, rgba(26,77,181,0.55) 100%)",
    accent: "#1a4db5",
    label: "Bienvenido a GYMOS",
  },
  {
    title: "SUPERA\nTUS LÍMITES",
    subtitle: "Entrena con propósito. Cada repetición cuenta.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop",
    overlay: "linear-gradient(120deg, rgba(10,18,40,0.88) 40%, rgba(18,60,120,0.6) 100%)",
    accent: "#2563eb",
    label: "Sin excusas",
  },
  {
    title: "MENTE\nY CUERPO",
    subtitle: "Constancia todos los días. Tu mejor versión.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1920&auto=format&fit=crop",
    overlay: "linear-gradient(120deg, rgba(10,18,40,0.90) 40%, rgba(26,77,181,0.5) 100%)",
    accent: "#3b82f6",
    label: "Transforma tu vida",
  },
]

const PLANS = [
  { name: 'MENSUAL',    price: '$80.000', days: 30,  color: '#3b82f6', features: ['Acceso total al gimnasio', 'Clases grupales', 'Vestuarios'] },
  { name: 'TRIMESTRAL', price: '$210.000', days: 90,  color: '#1a4db5', features: ['Todo del mensual', 'Descuento del 11%', 'Reserva prioritaria'], popular: true },
  { name: 'SEMESTRAL',  price: '$380.000', days: 180, color: '#22c55e', features: ['Todo del trimestral', 'Descuento del 23%', 'Asesoría nutricional'] },
  { name: 'ANUAL',      price: '$650.000', days: 365, color: '#8b5cf6', features: ['Todo el semestral', 'Descuento del 37%', 'Acceso VIP'] },
  { name: 'ESTUDIANTE', price: '$60.000', days: 30, color: '#a9f610', features: ['Acceso total al gimnasio', 'Clases grupales', 'Vestuarios'] },
]

const CLASSES = [
  { name: 'CrossFit',   level: 'Avanzado',   color: '#ef4444' },
  { name: 'Yoga',       level: 'Básico',     color: '#22c55e' },
  { name: 'Spinning',   level: 'Intermedio', color: '#3b82f6' },
  { name: 'Pilates',    level: 'Básico',     color: '#8b5cf6' },
  { name: 'Boxeo',      level: 'Intermedio', color: '#f59e0b' },
  { name: 'Funcional',  level: 'Avanzado',   color: '#1a4db5' },
]

const STATS = [
  { value: '500+', label: 'Miembros activos' },
  { value: '20+',  label: 'Clases semanales' },
  { value: '10+',  label: 'Instructores' },
  { value: '5+',   label: 'Salas equipadas' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5500)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goSlide = i => {
    setSlide(i)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5500)
  }

  const current = SLIDES[slide]

  return (
    <div className="home">
      <nav className={`home-nav ${scrolled ? 'home-nav--scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="nav-logo-icon"><Dumbbell size={18} /></div>
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
              Únete ahora <ArrowRight size={13} />
            </button>
            <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menú">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <section id="inicio" className="hero">
        <div
          className="hero-bg-image"
          style={{ backgroundImage: `url(${current.image})` }}
        />
        <div className="hero-bg-overlay" style={{ background: current.overlay }} />
        <div className="hero-stripe" />

        <div className="hero-content">
          <div
            className="hero-label"
            style={{ borderColor: current.accent, color: 'rgba(255,255,255,0.75)' }}
          >
            {current.label}
          </div>

          <h1 className="hero-title" key={slide} style={{ color: 'white' }}>
            {current.title.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'block' }}>{line}</span>
            ))}
          </h1>

          <p className="hero-subtitle" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {current.subtitle}
          </p>

          <div className="hero-actions">
            <button
              className="hero-btn hero-btn--primary"
              style={{ background: current.accent, color: 'white', border: 'none' }}
              onClick={() => navigate('/registro')}
            >
              Comenzar ahora <ArrowRight size={17} />
            </button>
            <button className="hero-btn hero-btn--ghost" onClick={() => navigate('/login')}>
              Ya soy miembro
            </button>
          </div>
        </div>

        <div className="hero-carousel-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === slide ? 'dot--active' : ''}`}
              style={i === slide ? { background: current.accent } : {}}
              onClick={() => goSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="hero-scroll-hint" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      <section className="stats-bar">
        {STATS.map(({ value, label }) => (
          <div key={label} className="stats-item">
            <div className="stats-accent" />
            <span className="stats-value">{value}</span>
            <span className="stats-label">{label}</span>
          </div>
        ))}
      </section>

      <section id="clases" className="section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Disciplinas</span>
            <h2 className="section-title">NUESTRAS <span>CLASES</span></h2>
            <p className="section-subtitle">Encuentra la disciplina que más se adapte a tus objetivos y nivel de experiencia</p>
          </div>

          <div className="classes-grid">
            {CLASSES.map(({ name, level, color }) => (
              <div key={name} className="class-card" style={{ '--card-color': color }}>
                <div className="class-card-accent" />
                <h3 className="class-name">{name}</h3>
                <span className="class-level" style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}>
                  {level}
                </span>
                <div className="class-arrow">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="section section--dark">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Membresías</span>
            <h2 className="section-title">ELIGE TU <span>PLAN</span></h2>
            <p className="section-subtitle">Todos los planes incluyen acceso completo a nuestras instalaciones</p>
          </div>

          <div className="plans-grid">
            {PLANS.map(({ name, price, days, color, features, popular }) => (
              <div key={name} className={`plan-card ${popular ? 'plan-card--popular' : ''}`}>
                {popular && <div className="plan-badge" style={{ background: color }}>MAS POPULAR</div>}
                <div>
                  <h3 className="plan-name" style={{ color }}>{name}</h3>
                  <div className="plan-price">{price}</div>
                  <div className="plan-duration">{days} días de acceso</div>
                </div>
                <ul className="plan-features">
                  {features.map(f => (
                    <li key={f}>
                      <span className="plan-check" style={{ background: `${color}25`, color }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className="plan-btn"
                  style={{ borderColor: color, color }}
                  onClick={() => navigate('/registro')}
                  onMouseEnter={e => { e.currentTarget.style.background = color }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  Elegir plan <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="nosotros" className="section">
        <div className="section-inner">
          <div className="about-grid">
            <div className="about-text">
              <span className="section-tag section-tag--left">Sobre nosotros</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginTop: 16 }}>
                POR QUE <span>ELEGIRNOS</span>
              </h2>
              <p className="about-desc">
                En GYMOS no solo entrenas, te transformas. Nos enfocamos en ofrecerte un espacio donde puedas mejorar tu condición física, cuidar tu salud y construir disciplina en un ambiente motivador. Equipos modernos, entrenadores capacitados y rutinas adaptadas a tu nivel.
              </p>
              <div className="about-features">
                {[
                  { title: 'Entrenamiento personalizado', desc: 'Rutinas adaptadas a tu nivel y objetivos, seas principiante o avanzado.' },
                  { title: 'Equipos modernos', desc: 'Máquinas y pesas de alta calidad para un entrenamiento completo y seguro.' },
                  { title: 'Ambiente motivador', desc: 'Un espacio donde entrenas con energía, disciplina y enfoque.' },
                  { title: 'Acompañamiento constante', desc: 'Asesoría de entrenadores para que avances correctamente.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="about-feature">
                    <div className="about-feature-marker" />
                    <div>
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-visual">
              <div className="about-visual-bg" />
              <div className="about-card about-card--main">
                <Dumbbell size={32} color="var(--accent)" />
                <h3>+500 miembros</h3>
                <p>confían en nosotros para alcanzar sus metas</p>
                <div className="about-card-bar">
                  <div className="about-card-bar-fill" />
                </div>
                <span className="about-card-tag">Creciendo cada mes</span>
              </div>

              <div className="about-card about-card--sm about-card--top">
                <Award size={22} color="#f59e0b" />
                <div>
                  <strong>10+ instructores</strong>
                  <span>certificados</span>
                </div>
              </div>

              <div className="about-card about-card--sm about-card--bot">
                <Clock size={22} color="#22c55e" />
                <div>
                  <strong>6 am – 10 pm</strong>
                  <span>todos los días</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-diagonal" />
        <div className="cta-inner">
          <h2 className="cta-title">LISTO PARA<br />EMPEZAR</h2>
          <p className="cta-subtitle">Únete hoy y transforma tu vida. Regístrate como miembro en segundos.</p>
          <div className="cta-actions">
            <button className="cta-btn cta-btn--solid" onClick={() => navigate('/registro')}>
              Registrarme ahora <ArrowRight size={17} />
            </button>
            <button className="cta-btn cta-btn--outline" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-logo">
          </div>
          <p className="footer-text">GYMOS · 2026</p>
          
        </div>
      </footer>
    </div>
  )
}
