import { useState, useEffect } from 'react'
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Badge, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { salaService } from '../services/api'

const ESTADO_OPTS = [
  { value: 'disponible',       label: 'Disponible' },
  { value: 'en_mantenimiento', label: 'En mantenimiento' },
]

const TIPO_OPTS = [
  { value: 'funcional', label: 'Funcional' },
  { value: 'cardio',    label: 'Cardio' },
  { value: 'pesas',     label: 'Pesas' },
  { value: 'calma',     label: 'Calma / Yoga' },
  { value: 'spinning',  label: 'Spinning' },
  { value: 'otro',      label: 'Otro' },
]

const EMPTY = { nombreSala: '', tipo: 'funcional', capacidadMax: '', estado: 'disponible' }

export default function SalasPage() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const r = await salaService.listar()
      setData(r.data)
    } finally { setLoading(false) }
  }

  const openCreate = () => {
    setForm(EMPTY); setEditing(null); setError(''); setModal(true)
  }

  const openEdit = row => {
    setForm({ nombreSala: row.nombreSala, tipo: row.tipo, capacidadMax: row.capacidadMax, estado: row.estado })
    setEditing(row.idSala)
    setError('')
    setModal(true)
  }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editing) await salaService.actualizar(editing, form)
      else         await salaService.crear(form)
      setModal(false); fetchData()
    } catch (err) {
      setError(err.response?.data || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  const del = async () => {
    try { await salaService.eliminar(confirm); fetchData() } finally { setConfirm(null) }
  }

  const cols = [
    { key: 'idSala',      label: 'ID',         width: 60 },
    { key: 'nombreSala',  label: 'Nombre' },
    { key: 'tipo',        label: 'Tipo',        width: 130, render: r => <span style={{ textTransform: 'capitalize' }}>{r.tipo}</span> },
    { key: 'capacidadMax',label: 'Capacidad',   width: 100, render: r => `${r.capacidadMax} personas` },
    { key: 'estado',      label: 'Estado',      width: 160, render: r => <Badge value={r.estado} /> },
    { key: 'fechaCreacion',label: 'Creada',     width: 110 },
    {
      key: 'acciones', label: '', width: 80,
      render: r => (
        <div className="table-actions">
          <ActionBtn variant="edit"   icon={Pencil} onClick={() => openEdit(r)} />
          <ActionBtn variant="delete" icon={Trash2} onClick={() => setConfirm(r.idSala)} />
        </div>
      )
    },
  ]

  const disponibles = data.filter(s => s.estado === 'disponible').length

  return (
    <div className="animate-fade">
      <PageHeader
        title="SALAS"
        subtitle={`${disponibles} disponibles · ${data.length} total`}
        action={<Button icon={Plus} onClick={openCreate}>Nueva sala</Button>}
      />

      <DataTable columns={cols} data={data} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'EDITAR SALA' : 'NUEVA SALA'}>
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <FormInput
              label="Nombre de la sala *"
              value={form.nombreSala}
              onChange={e => setForm(f => ({ ...f, nombreSala: e.target.value }))}
              placeholder="Ej: Sala CrossFit"
              required
            />
            <FormSelect
              label="Tipo"
              value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              options={TIPO_OPTS}
            />
            <FormInput
              label="Capacidad máxima *"
              type="number"
              min="1"
              value={form.capacidadMax}
              onChange={e => setForm(f => ({ ...f, capacidadMax: e.target.value }))}
              placeholder="Ej: 25"
              required
            />
            <FormSelect
              label="Estado"
              value={form.estado}
              onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
              options={ESTADO_OPTS}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Guardar cambios' : 'Crear sala'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={del}
        message="¿Eliminar esta sala? Los equipos y clases asociadas también se verán afectados."
      />
    </div>
  )
}