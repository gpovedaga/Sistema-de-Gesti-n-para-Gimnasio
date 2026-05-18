import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, CreditCard, Dumbbell, Calendar,
  UserCog, Tag, Building2, Wrench, Settings, LogOut,
  ChevronRight, Zap, DollarSign
} from 'lucide-react'
import './Layout.css'

const NAV_ITEMS = [
  { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['administrador', 'recepcionista', 'instructor', 'tecnico_mantenimiento'] },
  { path: 'miembros', label: 'Miembros', icon: Users, roles: ['administrador', 'recepcionista', 'instructor'] },
  { path: 'membresias', label: 'Membresías', icon: CreditCard, roles: ['administrador', 'recepcionista'] },
  { path: 'pagos', label: 'Pagos', icon: DollarSign, roles: ['administrador', 'recepcionista'] },
  { path: 'clases', label: 'Clases', icon: Dumbbell, roles: ['administrador', 'recepcionista', 'instructor'] },
  { path: 'reservas', label: 'Reservas', icon: Calendar, roles: ['administrador', 'recepcionista', 'instructor'] },
  { path: 'empleados', label: 'Empleados', icon: UserCog, roles: ['administrador'] },
  { path: 'planes', label: 'Planes', icon: Tag, roles: ['administrador'] },
  { path: 'salas', label: 'Salas', icon: Building2, roles: ['administrador', 'tecnico_mantenimiento'] },
  { path: 'equipos', label: 'Equipos', icon: Settings, roles: ['administrador', 'tecnico_mantenimiento'] },
  { path: 'mantenimientos', label: 'Mantenimientos', icon: Wrench, roles: ['administrador', 'tecnico_mantenimiento'] },
]

const CARGO_LABELS = {
  administrador: 'Administrador',
  recepcionista: 'Recepcionista',
  instructor: 'Instructor',
  tecnico_mantenimiento: 'Técnico'
}

const CARGO_COLORS = {
  administrador: '#ff4d00',
  recepcionista: '#3b82f6',
  instructor: '#22c55e',
  tecnico_mantenimiento: '#f59e0b'
}

export default function Layout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const visibleItems = NAV_ITEMS.filter(item => hasRole(...item.roles))

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Zap size={22} className="logo-icon" />
          <span className="logo-text">GYM<span className="logo-accent">OS</span></span>
        </div>

        <div className="sidebar-section-label">MENÚ</div>

        <nav className="sidebar-nav">
          {visibleItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/${path}`}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.nombre?.split(' ')[0]}</span>
              <span className="user-role" style={{ color: CARGO_COLORS[user?.cargo] }}>
                {CARGO_LABELS[user?.cargo]}
              </span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  )
}