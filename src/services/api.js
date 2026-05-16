import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/auth/login', data),
  registro: (data) => api.post('/auth/registro', data),
  loginMiembro: (data) => api.post('/auth/login/miembro', data),
}

// ── Miembros ──────────────────────────────────────────────────────
export const miembroService = {
  listar: () => api.get('/miembros'),
  buscar: (doc) => api.get(`/miembros/${doc}`),
  listarEstado: (est) => api.get(`/miembros/estado/${est}`),
  crear: (data) => api.post('/miembros', data),
  actualizar: (doc, data) => api.put(`/miembros/${doc}`, data),
  eliminar: (doc) => api.delete(`/miembros/${doc}`),
}

// ── Planes ────────────────────────────────────────────────────────
export const planService = {
  listar: () => api.get('/planes'),
  activos: () => api.get('/planes/activos'),
  buscar: (id) => api.get(`/planes/${id}`),
  crear: (data) => api.post('/planes', data),
  actualizar: (id, data) => api.put(`/planes/${id}`, data),
  eliminar: (id) => api.delete(`/planes/${id}`),
}

// ── Membresías ────────────────────────────────────────────────────
export const membresiaService = {
  listar: () => api.get('/membresias'),
  porMiembro: (doc) => api.get(`/membresias/miembro/${doc}`),
  porVencer: () => api.get('/membresias/por-vencer'),
  buscar: (id) => api.get(`/membresias/${id}`),
  crear: (data) => api.post('/membresias', data),
  cambiarEstado: (id, estado) => api.patch(`/membresias/${id}/estado?estado=${estado}`),
  eliminar: (id) => api.delete(`/membresias/${id}`),
  renovar: (id) => api.patch(`/membresias/${id}/renovar`),

}

// ── Pagos ─────────────────────────────────────────────────────────
export const pagoService = {
  listar: () => api.get('/pagos'),
  porMembresia: (id) => api.get(`/pagos/membresia/${id}`),
  crear: (data) => api.post('/pagos', data),
  eliminar: (num, idMem) => api.delete(`/pagos/${num}/membresia/${idMem}`),
}

// ── Empleados ─────────────────────────────────────────────────────
export const empleadoService = {
  listar: () => api.get('/empleados'),
  buscar: (id) => api.get(`/empleados/${id}`),
  crear: (data) => api.post('/empleados', data),
  actualizar: (id, data) => api.put(`/empleados/${id}`, data),
  eliminar: (id) => api.delete(`/empleados/${id}`),
}

// ── Clases ────────────────────────────────────────────────────────
export const claseService = {
  listar: () => api.get('/clases'),
  activas: () => api.get('/clases/activas'),
  buscar: (id) => api.get(`/clases/${id}`),
  crear: (data) => api.post('/clases', data),
  actualizar: (id, data) => api.put(`/clases/${id}`, data),
  eliminar: (id) => api.delete(`/clases/${id}`),
}

// ── Reservas ──────────────────────────────────────────────────────
export const reservaService = {
  listar: () => api.get('/reservas'),
  porMiembro: (doc) => api.get(`/reservas/miembro/${doc}`),
  porClase: (id) => api.get(`/reservas/clase/${id}`),
  crear: (data) => api.post('/reservas', data),
  cambiarEstado: (id, doc, estado) => api.patch(`/reservas/${id}/miembro/${doc}/estado?estado=${estado}`),
  eliminar: (id, doc) => api.delete(`/reservas/${id}/miembro/${doc}`),
}

// ── Salas ─────────────────────────────────────────────────────────
export const salaService = {
  listar: () => api.get('/salas'),
  disponibles: () => api.get('/salas/disponibles'),
  buscar: (id) => api.get(`/salas/${id}`),
  crear: (data) => api.post('/salas', data),
  actualizar: (id, data) => api.put(`/salas/${id}`, data),
  eliminar: (id) => api.delete(`/salas/${id}`),
}

// ── Equipos ───────────────────────────────────────────────────────
export const equipoService = {
  listar: () => api.get('/equipos'),
  porSala: (id) => api.get(`/equipos/sala/${id}`),
  buscar: (id) => api.get(`/equipos/${id}`),
  crear: (data) => api.post('/equipos', data),
  actualizar: (id, data) => api.put(`/equipos/${id}`, data),
  eliminar: (id) => api.delete(`/equipos/${id}`),
}

// ── Mantenimientos ────────────────────────────────────────────────
export const mantenimientoService = {
  listar: () => api.get('/mantenimientos'),
  porEquipo: (id) => api.get(`/mantenimientos/equipo/${id}`),
  crear: (data) => api.post('/mantenimientos', data),
  eliminar: (id, eq) => api.delete(`/mantenimientos/${id}/equipo/${eq}`),
}