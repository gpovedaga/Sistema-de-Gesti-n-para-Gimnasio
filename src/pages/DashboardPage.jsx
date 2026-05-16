import { useState, useEffect } from 'react'
import { Users, CreditCard, Dumbbell, Calendar, AlertTriangle, UserCog, Building2, Wrench } from 'lucide-react'
import { StatCard } from '../components/common/Common'
import { useAuth } from '../context/AuthContext'
import { miembroService, membresiaService, claseService, reservaService, empleadoService, salaService, mantenimientoService } from '../services/api'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user, isAdmin, isRecepcionista, isInstructor, isTecnico } = useAuth()
  const [stats,   setStats]   = useState({})
  const [vencer,  setVencer]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        miembroService.listar(),
        membresiaService.listar(),
        claseService.listar(),
        reservaService.listar(),
        empleadoService.listar(),
        salaService.listar(),
        mantenimientoService.listar(),
        membresiaService.porVencer(),
      ])
      const [miem, memb, clas, res, emp, sal, mant, venc] = results.map(r => r.status === 'fulfilled' ? r.value.data : [])
      setStats({
        miembros:       Array.isArray(miem) ? miem.length : 0,
        activos:        Array.isArray(miem) ? miem.filter(m => m.estado === 'activo').length : 0,
        membresias:     Array.isArray(memb) ? memb.filter(m => m.estado === 'activa').length : 0,
        clases:         Array.isArray(clas) ? clas.filter(c => c.estado === 'activo').length : 0,
        reservas:       Array.isArray(res)  ? res.filter(r => r.estado === 'confirmada').length : 0,
        empleados:      Array.isArray(emp)  ? emp.length : 0,
        salas:          Array.isArray(sal)  ? sal.filter(s => s.estado === 'disponible').length : 0,
        mantenimientos: Array.isArray(mant) ? mant.length : 0,
      })
      setVencer(Array.isArray(venc) ? venc : [])
    } finally {
      setLoading(false)
    }
  }

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="dashboard animate-fade">
      {/* Header */}
      <div className="dash-header">
        <div>
          <p className="dash-saludo">{saludo},</p>
          <h1 className="dash-nombre">{user?.nombre?.split(' ')[0]} <span>👋</span></h1>
          <p className="dash-rol">Acceso como <strong>{user?.cargo?.replace(/_/g, ' ')}</strong></p>
        </div>
        <div className="dash-date">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <>
          {(isAdmin() || isRecepcionista()) && (
            <div className="stat-grid">
              <StatCard title="Miembros activos"    value={stats.activos}    icon={Users}       color="var(--accent)" />
              <StatCard title="Membresías activas"  value={stats.membresias} icon={CreditCard}  color="#3b82f6" />
              <StatCard title="Clases activas"      value={stats.clases}     icon={Dumbbell}    color="#22c55e" />
              <StatCard title="Reservas hoy"        value={stats.reservas}   icon={Calendar}    color="#8b5cf6" />
            </div>
          )}

          {isInstructor() && (
            <div className="stat-grid">
              <StatCard title="Clases activas"  value={stats.clases}   icon={Dumbbell}  color="var(--accent)" />
              <StatCard title="Reservas activas" value={stats.reservas} icon={Calendar}  color="#3b82f6" />
              <StatCard title="Miembros totales" value={stats.miembros} icon={Users}    color="#22c55e" />
            </div>
          )}

          {isTecnico() && (
            <div className="stat-grid">
              <StatCard title="Salas disponibles"   value={stats.salas}          icon={Building2} color="var(--accent)" />
              <StatCard title="Mantenimientos"       value={stats.mantenimientos} icon={Wrench}    color="#f59e0b" />
            </div>
          )}

          {isAdmin() && (
            <div className="stat-grid" style={{ marginTop: 0 }}>
              <StatCard title="Total empleados" value={stats.empleados}      icon={UserCog}   color="#f59e0b" />
              <StatCard title="Total miembros"  value={stats.miembros}       icon={Users}     color="#8888a8" />
              <StatCard title="Salas disp."     value={stats.salas}          icon={Building2} color="#22c55e" />
              <StatCard title="Mantenimientos"  value={stats.mantenimientos} icon={Wrench}    color="#ef4444" />
            </div>
          )}
        </>
      )}

      {/* Membresías por vencer */}
      {(isAdmin() || isRecepcionista()) && vencer.length > 0 && (
        <div className="dash-alert-section">
          <div className="dash-section-title">
            <AlertTriangle size={16} color="var(--warning)" />
            <span>Membresías próximas a vencer ({vencer.length})</span>
          </div>
          <div className="vencer-list">
            {vencer.map((m, i) => (
              <div key={i} className="vencer-item">
                <div className="vencer-info">
                  <span className="vencer-nombre">{m.miembroNombre}</span>
                  <span className="vencer-plan">{m.planNombre}</span>
                </div>
                <div className="vencer-fecha">
                  <span>Vence:</span>
                  <strong>{new Date(m.fechaFin).toLocaleDateString('es-CO')}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info del sistema */}
      <div className="dash-info-grid">
        <div className="dash-info-card">
          <h3>🏋️ Sistema de Gestión</h3>
          <p>Universidad El Bosque · Bases de Datos 1</p>
          <p style={{ marginTop: 8 }}>Gestiona miembros, membresías, clases, reservas, salas y mantenimientos desde un solo lugar.</p>
        </div>
        <div className="dash-info-card">
          <h3>🔐 Tu rol: <span style={{ color: 'var(--accent)' }}>{user?.cargo?.replace(/_/g, ' ')}</span></h3>
          <p>Tienes acceso a los módulos correspondientes a tu cargo. Navega usando el menú lateral.</p>
        </div>
      </div>
    </div>
  )
}