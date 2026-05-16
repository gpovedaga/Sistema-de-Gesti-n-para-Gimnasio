import { useState, useEffect } from 'react'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Badge, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { membresiaService, miembroService, planService, pagoService } from '../services/api'

const ESTADO_OPTS = [
  { value: 'activa', label: 'Activa' },
  { value: 'vencida', label: 'Vencida' },
  { value: 'cancelada', label: 'Cancelada' },
]
const EMPTY = { miembroDocumento: '', planIdPlan: '', fechaInicio: '' }

export default function MembresiasPage() {
  const [data, setData] = useState([])
  const [miembros, setMiembros] = useState([])
  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [planesData, setPlanesData] = useState([])  // ← agregar este estado

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [mem, miem, plan] = await Promise.all([
        membresiaService.listar(),
        miembroService.listar(),
        planService.listar(),
      ])
      setData(miem.data)
      setMiembros(miem.data.map(m => ({ value: m.documento, label: `${m.nombreCompleto} (${m.documento})` })))
      setPlanes(plan.data.map(p => ({ value: p.idPlan, label: `${p.nombre} - $${Number(p.precioCop).toLocaleString('es-CO')} (${p.duracionDias} días)` })))
      setPlanesData(plan.data)  // ← agregar esta línea después de setPlanes
      setData(mem.data)
    } finally { setLoading(false) }
  }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await membresiaService.crear(form)

      // Buscar el precio del plan seleccionado
      const planSeleccionado = planes.find(p => p.value == form.planIdPlan)
      // Extraer el precio del label "Plan Mensual - $80.000 (30 días)"
      // O buscarlo desde los datos de planes cargados
      const planData = planesData.find(p => p.idPlan == form.planIdPlan)

      // Crear pago automático
      // Necesitamos el idMembresia recién creada — buscamos en la lista actualizada
      const membresiasActualizadas = await membresiaService.listar()
      const nuevaMembresia = membresiasActualizadas.data
        .filter(m => m.miembroDocumento === form.miembroDocumento)
        .sort((a, b) => b.idMembresia - a.idMembresia)[0]

      if (nuevaMembresia) {
        await pagoService.crear({
          membresiaIdMembresia: nuevaMembresia.idMembresia,
          fechaPago: form.fechaInicio,
          montoCop: nuevaMembresia.precioInscrito,
          metodoPago: 'efectivo'
        })
      }

      setModal(false); fetchAll()
    } catch (err) {
      setError(err.response?.data || 'Error al crear.')
    } finally { setSaving(false) }
  }

  const cambiarEstado = async (id, estado) => {
    try { await membresiaService.cambiarEstado(id, estado); fetchAll() } catch { }
  }
  const renovar = async (id) => {
    try {
      await membresiaService.renovar(id)
      // Generar pago automático
      const memActualizada = await membresiaService.buscar(id)
      await pagoService.crear({
        membresiaIdMembresia: id,
        fechaPago: new Date().toISOString().split('T')[0],
        montoCop: memActualizada.data.precioInscrito,
        metodoPago: 'efectivo'
      })
      fetchAll()
    } catch {
      alert('Error al renovar la membresía.')
    }
  }
  const del = async () => { try { await membresiaService.eliminar(confirm); fetchAll() } finally { setConfirm(null) } }

  const cols = [
    { key: 'idMembresia', label: 'ID', width: 60 },
    { key: 'miembroNombre', label: 'Miembro' },
    { key: 'planNombre', label: 'Plan', width: 140 },
    { key: 'precioInscrito', label: 'Precio', width: 120, render: r => `$ ${Number(r.precioInscrito).toLocaleString('es-CO')}` },
    { key: 'fechaInicio', label: 'Inicio', width: 110 },
    { key: 'fechaFin', label: 'Fin', width: 110 },
    { key: 'estado', label: 'Estado', width: 110, render: r => <Badge value={r.estado} /> },
    {
      key: 'acciones', label: '', width: 160, render: r => (
        <div className="table-actions">
          <select className="form-input" style={{ padding: '4px 8px', fontSize: 11, width: 'auto' }}
            value={r.estado}
            onChange={e => cambiarEstado(r.idMembresia, e.target.value)}>
            {ESTADO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {r.estado === 'vencida' && (
            <Button style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => renovar(r.idMembresia)}>
              Renovar
            </Button>
          )}
          <ActionBtn variant="delete" icon={Trash2} onClick={() => setConfirm(r.idMembresia)} />
        </div>
      )
    },
  ]

  return (
    <div className="animate-fade">
      <PageHeader
        title="MEMBRESÍAS"
        subtitle={`${data.filter(m => m.estado === 'activa').length} activas · ${data.length} total`}
        action={<Button icon={Plus} onClick={() => { setForm(EMPTY); setError(''); setModal(true) }}>Nueva membresía</Button>}
      />
      <DataTable columns={cols} data={data} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title="NUEVA MEMBRESÍA">
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid form-grid--1">
            <FormSelect label="Miembro *" value={form.miembroDocumento} onChange={e => setForm(f => ({ ...f, miembroDocumento: e.target.value }))} options={miembros} required />
            <FormSelect label="Plan *" value={form.planIdPlan} onChange={e => setForm(f => ({ ...f, planIdPlan: e.target.value }))} options={planes} required />
            <FormInput label="Fecha de inicio *" type="date" value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} required />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>La fecha de fin y el precio se calculan automáticamente según el plan.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Crear membresía</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} message="¿Eliminar esta membresía?" />
    </div>
  )
}