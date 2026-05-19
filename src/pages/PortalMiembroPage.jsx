import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { claseService, membresiaService, reservaService } from '../services/api'
import { LogOut, Dumbbell, CreditCard, Calendar, Clock, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './PortalMiembroPage.css'

export default function PortalMiembroPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [clases, setClases] = useState([])
    const [membresia, setMembresia] = useState(null)
    const [reservas, setReservas] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('clases') 
    const [msg, setMsg] = useState('')
    const doc = user?.documento


    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        try {
            const [c, r] = await Promise.allSettled([
                claseService.activas(),
                reservaService.porMiembro(doc), 
            ])
            setClases(c.status === 'fulfilled' ? c.value.data : [])
            setReservas(r.status === 'fulfilled' ? r.value.data : [])
        } finally {
            setLoading(false)
        }
    }

    const fetchMembresia = async () => {
        try {
            const res = await membresiaService.porMiembro(doc) 
            const lista = Array.isArray(res.data) ? res.data : []
            setMembresia(lista.find(m => m.estado === 'activa') || null)
        } catch { }
    }


    const reservar = async (idClase) => {
        setMsg('')
        try {
            await reservaService.crear({
                claseIdClase: idClase,
                miembroDocumento: doc,
                fechaReserva: new Date().toISOString().split('T')[0],
                estado: 'confirmada'
            })
            setMsg('OK Reserva realizada exitosamente.')
            fetchAll()
        } catch (e) {
            setMsg((e.response?.data || 'Error al reservar.'))
        }
    }

    const cancelar = async (idReserva, docMiembro) => {
        try {
            await reservaService.cambiarEstado(idReserva, docMiembro, 'cancelada')
            setMsg('OK Reserva cancelada.')
            fetchAll()
        } catch {
            setMsg('Error al cancelar.')
        }
    }

    const handleLogout = () => { logout(); navigate('/login') }

    const hora = new Date().getHours()
    const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

    const DIAS = { lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom' }
    const NIVEL = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }

    const TABS = [
        { id: 'clases', label: 'Clases disponibles', icon: Dumbbell },
        { id: 'reservas', label: 'Mis reservas', icon: Calendar },
        { id: 'membresia', label: 'Mi membresía', icon: CreditCard },
    ]

    const estadoChipClass = (estado) => {
        const map = { confirmada: 'confirmada', asistida: 'asistida', ausente: 'ausente', cancelada: 'cancelada' }
        return `portal-estado-chip ${map[estado] || ''}`
    }

    return (
        <div className="portal-wrapper">

            <header className="portal-header">
                <div className="portal-header-brand">
                    <div className="portal-header-icon">
                        <Dumbbell size={20} color="#fff" />
                    </div>
                    <div>
                        <div className="portal-header-title">Portal de Miembros</div>
                        <div className="portal-header-saludo">
                            {saludo}, <span>{user?.nombre?.split(' ')[0]}</span>
                        </div>
                    </div>
                </div>

                <button className="portal-logout-btn" onClick={handleLogout}>
                    <LogOut size={14} /> Salir
                </button>
            </header>

            <div className="portal-tabs">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={`portal-tab-btn${tab === id ? ' active' : ''}`}
                        onClick={() => setTab(id)}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            <div className="portal-content">

                {msg && (
                    <div className={`portal-msg ${msg.startsWith('OK') ? 'success' : 'error'}`}>
                        {msg}
                    </div>
                )}

                {loading ? (
                    <div className="portal-loading">Cargando...</div>
                ) : (
                    <>
                        {tab === 'clases' && (
                            <div>
                                <h2 className="portal-section-title">Clases disponibles</h2>
                                <p className="portal-section-subtitle">Reserva tu lugar en cualquier clase activa</p>

                                {clases.length === 0 ? (
                                    <div className="portal-empty">
                                        <Dumbbell size={40} />
                                        <p>No hay clases activas por el momento.</p>
                                    </div>
                                ) : (
                                    <div className="portal-clases-grid">
                                        {clases.map(c => (
                                            <div key={c.idClase} className="portal-clase-card">
                                                <div className="portal-clase-card-header">
                                                    <div>
                                                        <div className="portal-clase-nombre">{c.nombreClase}</div>
                                                        <div className="portal-clase-disciplina">{c.disciplina}</div>
                                                    </div>
                                                    <span className={`portal-badge ${c.nivelDificultad}`}>
                                                        {NIVEL[c.nivelDificultad] || c.nivelDificultad}
                                                    </span>
                                                </div>

                                                <div className="portal-clase-meta">
                                                    <span>
                                                        <Clock size={13} />
                                                        {DIAS[c.diaSemana] || c.diaSemana} a las {c.horaInicio} · {c.duracionMinutos} min
                                                    </span>
                                                    <span>
                                                        <Users size={13} />
                                                        Instructor: {c.instructorNombre}
                                                    </span>
                                                    <span>
                                                        <Dumbbell size={13} />
                                                        Sala: {c.salaNombre} · Cupos: {c.capacidadMax}
                                                    </span>
                                                </div>

                                                <button
                                                    className="portal-btn-reservar"
                                                    onClick={() => reservar(c.idClase)}
                                                >
                                                    Reservar clase
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'reservas' && (
                            <div>
                                <h2 className="portal-section-title">Mis reservas</h2>
                                <p className="portal-section-subtitle">Historial y estado de tus inscripciones</p>

                                {reservas.length === 0 ? (
                                    <div className="portal-empty">
                                        <Calendar size={40} />
                                        <p>No tienes reservas aún.</p>
                                    </div>
                                ) : (
                                    <div className="portal-reservas-list">
                                        {reservas.map((r, i) => (
                                            <div key={i} className="portal-reserva-item">
                                                <div className="portal-reserva-info">
                                                    <div className="portal-reserva-clase">
                                                        {r.claseNombre || `Clase #${r.claseIdClase}`}
                                                    </div>
                                                    <div className="portal-reserva-fecha">
                                                        {r.fechaReserva
                                                            ? new Date(r.fechaReserva).toLocaleDateString('es-CO')
                                                            : '—'}
                                                    </div>
                                                    <div className="portal-reserva-estado">
                                                        <span className={estadoChipClass(r.estado)}>
                                                            {r.estado}
                                                        </span>
                                                    </div>
                                                </div>

                                                {r.estado === 'confirmada' && (
                                                    <button
                                                        className="portal-btn-cancelar"
                                                        onClick={() => cancelar(r.idReserva, r.miembroDocumento)}
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'membresia' && (
                            <div>
                                <h2 className="portal-section-title">Mi membresía</h2>
                                <p className="portal-section-subtitle">Detalles de tu plan activo</p>

                                {!membresia ? (
                                    <div className="portal-no-membresia">
                                        <div className="portal-no-membresia-icon">
                                            <CreditCard size={48} />
                                        </div>
                                        <div className="portal-no-membresia-title">Sin membresía activa</div>
                                        <div className="portal-no-membresia-hint">
                                            Acércate a recepción para contratar un plan.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="portal-membresia-card">
                                        <div className="portal-membresia-card-header">
                                            <div className="portal-membresia-icon">
                                                <CreditCard size={24} color="var(--accent)" />
                                            </div>
                                            <div>
                                                <div className="portal-membresia-plan">{membresia.planNombre}</div>
                                                <div className="portal-membresia-status">Activa</div>
                                            </div>
                                        </div>

                                        <div className="portal-membresia-divider" />

                                        <div className="portal-membresia-rows">
                                            <div className="portal-membresia-row">
                                                <span className="portal-membresia-row-label">Inicio</span>
                                                <span className="portal-membresia-row-value">
                                                    {new Date(membresia.fechaInicio).toLocaleDateString('es-CO')}
                                                </span>
                                            </div>
                                            <div className="portal-membresia-row">
                                                <span className="portal-membresia-row-label">Vencimiento</span>
                                                <span className="portal-membresia-row-value vence">
                                                    {new Date(membresia.fechaFin).toLocaleDateString('es-CO')}
                                                </span>
                                            </div>
                                            <div className="portal-membresia-row">
                                                <span className="portal-membresia-row-label">Valor pagado</span>
                                                <span className="portal-membresia-row-value precio">
                                                    ${Number(membresia.precioInscrito).toLocaleString('es-CO')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}