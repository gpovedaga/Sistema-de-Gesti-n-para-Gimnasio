import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MiembrosPage from './pages/MiembrosPage'
import MembresiasPage from './pages/MembresiasPage'
import PagosPage from './pages/PagosPage'
import ClasesPage from './pages/ClasesPage'
import ReservasPage from './pages/ReservasPage'
import EmpleadoPage from './pages/EmpleadoPage'
import PlanesPage from './pages/PlanesPage'
import SalasPage from './pages/SalasPage'
import EquiposPage from './pages/EquiposPage'
import MantenimientosPage from './pages/MantenimientosPage'
import PortalMiembroPage from './pages/PortalMiembroPage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)'
    }}>
      Cargando...
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.cargo)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── BUG 1 y 2 CORREGIDOS: rutas públicas con paths correctos ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />  {/* era /register */}
          <Route path="/portal" element={
            <ProtectedRoute roles={['miembro']}><PortalMiembroPage /></ProtectedRoute>
          } />

          {/* ── BUG 5 CORREGIDO: dashboard dentro del Layout con sidebar ── */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />

            <Route path="miembros"
              element={<ProtectedRoute roles={['administrador', 'recepcionista', 'instructor']}><MiembrosPage /></ProtectedRoute>} />
            <Route path="membresias"
              element={<ProtectedRoute roles={['administrador', 'recepcionista']}><MembresiasPage /></ProtectedRoute>} />
            <Route path="pagos"
              element={<ProtectedRoute roles={['administrador', 'recepcionista']}><PagosPage /></ProtectedRoute>} />
            <Route path="clases"
              element={<ProtectedRoute roles={['administrador', 'recepcionista', 'instructor']}><ClasesPage /></ProtectedRoute>} />
            <Route path="reservas"
              element={<ProtectedRoute roles={['administrador', 'recepcionista', 'instructor']}><ReservasPage /></ProtectedRoute>} />
            <Route path="empleados"
              element={<ProtectedRoute roles={['administrador']}><EmpleadoPage /></ProtectedRoute>} />
            <Route path="planes"
              element={<ProtectedRoute roles={['administrador']}><PlanesPage /></ProtectedRoute>} />

            {/* ── BUG 3 CORREGIDO: salas también para tecnico_mantenimiento ── */}
            <Route path="salas"
              element={<ProtectedRoute roles={['administrador', 'tecnico_mantenimiento']}><SalasPage /></ProtectedRoute>} />
            <Route path="equipos"
              element={<ProtectedRoute roles={['administrador', 'tecnico_mantenimiento']}><EquiposPage /></ProtectedRoute>} />
            <Route path="mantenimientos"
              element={<ProtectedRoute roles={['administrador', 'tecnico_mantenimiento']}><MantenimientosPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}