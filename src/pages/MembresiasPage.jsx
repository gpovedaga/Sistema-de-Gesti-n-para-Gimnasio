import { useState, useEffect } from 'react'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Badge, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { membresiaService, miembroService, planService, pagoService } from '../services/api'

const ESTADO_OPTS = [
  { value: 'activa',    label: 'Activa' },
  { value: 'vencida',   label: 'Vencida' },
  { value: 'cancelada', label: 'Cancelada' },
]
const METODO_OPTS = [
  { value: 'efectivo',      label: 'Efectivo' },
  { value: 'tarjeta',       label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
]
const EMPTY = { miembroDocumento: '', planIdPlan: '', fechaInicio: '' }

export default function MembresiasPage() {
  const [data,       setData]       = useState([])
  const [miembros,   setMiembros]   = useState([])
  const [planes,     setPlanes]     = useState([])
  const [planesData, setPlanesData] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [confirm,    setConfirm]    = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const [tipoPago,   setTipoPago]   = useState('total')
  const [montoPago,  setMontoPago]  = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [mem, miem, plan] = await Promise.all([
        membresiaService.listar(),
        miembroService.listar(),
        planService.listar(),
      ])
      setMiembros(miem.data.map(m => ({ value: m.documento, label: `${m.nombreCompleto} (${m.documento})` })))
      setPlanes(plan.data.map(p => ({ value: p.idPlan, label: `${p.nombre} - $${Number(p.precioCop).toLocaleString('es-CO')} (${p.duracionDias} días)` })))
      setPlanesData(plan.data)
      setData(mem.data)
    } finally { setLoading(false) }
  }

  const handlePlan = (e) => {
    const id = e.target.value
    setForm(f => ({ ...f, planIdPlan: id }))
    const plan = planesData.find(p => p.idPlan == id)
    if (plan) setMontoPago(plan.precioCop)
  }

  const openModal = () => {
    setForm(EMPTY)
    setTipoPago('total')
    setMontoPago('')
    setMetodoPago('efectivo')
    setError('')
    setModal(true)
  }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await membresiaService.crear(form)

      const membresiasActualizadas = await membresiaService.listar()
      const nuevaMembresia = membresiasActualizadas.data
        .filter(m => m.miembroDocumento === form.miembroDocumento)
        .sort((a, b) => b.idMembresia - a.idMembresia)[0]

      if (nuevaMembresia && tipoPago !== 'sin_pago') {
        await pagoService.crear({
          membresiaIdMembresia: nuevaMembresia.idMembresia,
          fechaPago:            form.fechaInicio,
          montoCop:             tipoPago === 'total' ? nuevaMembresia.precioInscrito : Number(montoPago),
          metodoPago:           metodoPago
        })
      }

      setModal(false); fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error al crear.')
    } finally { setSaving(false) }
  }

  const cambiarEstado = async (id, estado) => {
    try { await membresiaService.cambiarEstado(id, estado); fetchAll() } catch {}
  }

  const renovar = async (id) => {
    try {
      await membresiaService.renovar(id)
      const memActualizada = await membresiaService.buscar(id)
      await pagoService.crear({
        membresiaIdMembresia: id,
        fechaPago:            new Date().toISOString().split('T')[0],
        montoCop:             memActualizada.data.precioInscrito,
        metodoPago:           'efectivo'
      })
      fetchAll()
    } catch {
      alert('Error al renovar la membresía.')
    }
  }

  const del = async () => {
    try { await membresiaService.eliminar(confirm); fetchAll() } finally { setConfirm(null) }
  }

  const precioplan = planesData.find(p => p.idPlan == form.planIdPlan)?.precioCop || 0

  const cols = [
    { key: 'idMembresia',   label: 'ID',      width: 60 },
    { key: 'miembroNombre', label: 'Miembro' },
    { key: 'planNombre',    label: 'Plan',    width: 140 },
    { key: 'precioInscrito', label: 'Precio', width: 120, render: r => `$ ${Number(r.precioInscrito).toLocaleString('es-CO')}` },
    { key: 'fechaInicio',   label: 'Inicio',  width: 110 },
    { key: 'fechaFin',      label: 'Fin',     width: 110 },
    { key: 'estado', label: 'Estado', width: 110, render: r => <Badge value={r.estado} /> },
    {
      key: 'acciones', label: '', width: 160, render: r => (
        <div className="table-actions">
          <select className="form-input" style={{ padding: '4px 8px', fontSize: 11, width: 'auto' }}
            value={r.estado} onChange={e => cambiarEstado(r.idMembresia, e.target.value)}>
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
        action={<Button icon={Plus} onClick={openModal}>Nueva membresía</Button>}
      />
      <DataTable columns={cols} data={data} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title="NUEVA MEMBRESÍA">
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid form-grid--1">
            <FormSelect label="Miembro *" value={form.miembroDocumento}
              onChange={e => setForm(f => ({ ...f, miembroDocumento: e.target.value }))}
              options={miembros} required />
            <FormSelect label="Plan *" value={form.planIdPlan}
              onChange={handlePlan} options={planes} required />
            <FormInput label="Fecha de inicio *" type="date" value={form.fechaInicio}
              onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} required />
          </div>

          {form.planIdPlan && (
            <div style={{
              marginTop: 16,
              padding: '14px 16px',
              borderRadius: 8,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)',
            }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: 12,
              }}>
                Pago inicial —{' '}
                <span style={{ color: 'var(--accent)' }}>
                  ${Number(precioplan).toLocaleString('es-CO')} COP
                </span>
              </div>

              {/* Tipo de pago buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {[
                  { id: 'total',    label: 'Pago total' },
                  { id: 'parcial',  label: 'Pago parcial' },
                  { id: 'sin_pago', label: 'Sin pago ahora' },
                ].map(({ id, label }) => (
                  <button key={id} type="button"
                    onClick={() => {
                      setTipoPago(id)
                      if (id === 'total')   setMontoPago(precioplan)
                      if (id === 'parcial') setMontoPago('')
                    }}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      transition: 'all 0.15s ease',
                      background: tipoPago === id ? 'var(--accent)' : 'var(--surface)',
                      color:      tipoPago === id ? 'var(--bg-main)' : 'var(--text-muted)',
                      outline:    tipoPago === id ? 'none' : '1px solid var(--border)',
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              {tipoPago !== 'sin_pago' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      {tipoPago === 'parcial' ? 'Monto a pagar ahora *' : 'Monto'}
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      value={montoPago}
                      onChange={e => setMontoPago(e.target.value)}
                      readOnly={tipoPago === 'total'}
                      required={tipoPago === 'parcial'}
                      style={{
                        background: tipoPago === 'total' ? 'var(--surface)' : undefined,
                        color:      tipoPago === 'total' ? 'var(--text-muted)' : undefined,
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Método de pago</label>
                    <select className="form-input" value={metodoPago}
                      onChange={e => setMetodoPago(e.target.value)}>
                      {METODO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {tipoPago === 'sin_pago' && (
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: 'var(--warning)',
                }}>
                  La membresía se creará sin pago. Podrás registrarlo después en la sección de Pagos.
                </p>
              )}

              {tipoPago === 'parcial' && montoPago && Number(montoPago) < Number(precioplan) && (
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: 'var(--warning)',
                  marginTop: 8,
                }}>
                  Pendiente: ${(Number(precioplan) - Number(montoPago)).toLocaleString('es-CO')} COP.{' '}
                  Registra el saldo restante en la sección de Pagos.
                </p>
              )}
            </div>
          )}

          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
            marginTop: 8,
          }}>
            La fecha de fin y el precio se calculan automáticamente según el plan.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Crear membresía</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del}
        message="¿Eliminar esta membresía?" />
    </div>
  )
}