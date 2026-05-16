import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Modal, ConfirmDialog, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { reservaService, miembroService, claseService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ESTADO_OPTS = [
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'asistida',   label: 'Asistida' },
  { value: 'ausente',    label: 'Ausente' },
  { value: 'cancelada',  label: 'Cancelada' },
]

const EMPTY = { miembroDocumento: '', claseIdClase: '', fechaReserva: '' }

export default function ReservasPage() {
  const { isInstructor } = useAuth()
  const [data,     setData]     = useState([])
  const [miembros, setMiembros] = useState([])
  const [clases,   setClases]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [confirm,  setConfirm]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [res, miem, clas] = await Promise.allSettled([
        reservaService.listar(),
        miembroService.listar(),
        claseService.listar(),
      ])
      setData(res.status === 'fulfilled' ? res.value.data : [])
      setMiembros(
        miem.status === 'fulfilled'
          ? miem.value.data.filter(m => m.estado === 'activo').map(m => ({ value: m.documento, label: `${m.nombreCompleto} (${m.documento})` }))
          : []
      )
      setClases(
        clas.status === 'fulfilled'
          ? clas.value.data.filter(c => c.estado === 'activo').map(c => ({ value: c.idClase, label: `${c.nombreClase} - ${c.diaSemana} ${c.horaInicio}` }))
          : []
      )
    } finally { setLoading(false) }
  }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await reservaService.crear({ ...form, fechaReserva: new Date().toISOString().split('T')[0] })
      setModal(false); fetchAll()
    } catch (err) {
      setError(err.response?.data || 'Error al crear la reserva.')
    } finally { setSaving(false) }
  }

  const cambiarEstado = async (idReserva, doc, estado) => {
    try { await reservaService.cambiarEstado(idReserva, doc, estado); fetchAll() } catch {}
  }

  const del = async () => {
    if (!confirm) return
    try { await reservaService.eliminar(confirm.id, confirm.doc); fetchAll() }
    finally { setConfirm(null) }
  }

  const cols = [
    { key: 'idReserva',     label: 'ID',      width: 60 },
    { key: 'miembroNombre', label: 'Miembro' },
    { key: 'claseNombre',   label: 'Clase',   width: 160 },
    { key: 'fechaReserva',  label: 'Fecha',   width: 110 },
    {
      key: 'estado', label: 'Estado', width: 180,
      render: r => (
        <select
          className="form-input"
          style={{ padding: '4px 8px', fontSize: 11, width: 'auto' }}
          value={r.estado}
          onChange={e => cambiarEstado(r.idReserva, r.miembroDocumento, e.target.value)}
          disabled={isInstructor() && r.estado === 'cancelada'}
        >
          {ESTADO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    },
    ...(!isInstructor() ? [{
      key: 'acciones', label: '', width: 60,
      render: r => (
        <ActionBtn
          variant="delete"
          icon={Trash2}
          onClick={() => setConfirm({ id: r.idReserva, doc: r.miembroDocumento })}
        />
      )
    }] : []),
  ]

  return (
    <div className="animate-fade">
      <PageHeader
        title="RESERVAS"
        subtitle={`${data.filter(r => r.estado === 'confirmada').length} confirmadas`}
        action={!isInstructor() && (
          <Button icon={Plus} onClick={() => { setForm(EMPTY); setError(''); setModal(true) }}>
            Nueva reserva
          </Button>
        )}
      />

      <DataTable columns={cols} data={data} loading={loading} />

      {!isInstructor() && (
        <>
          <Modal open={modal} onClose={() => setModal(false)} title="NUEVA RESERVA">
            {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
            <form onSubmit={save}>
              <div className="form-grid form-grid--1">
                <FormSelect label="Miembro *" value={form.miembroDocumento}
                  onChange={e => setForm(f => ({ ...f, miembroDocumento: e.target.value }))}
                  options={miembros} required />
                <FormSelect label="Clase *" value={form.claseIdClase}
                  onChange={e => setForm(f => ({ ...f, claseIdClase: e.target.value }))}
                  options={clases} required />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancelar</Button>
                <Button type="submit" loading={saving}>Crear reserva</Button>
              </div>
            </form>
          </Modal>
          <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} message="¿Eliminar esta reserva?" />
        </>
      )}
    </div>
  )
}