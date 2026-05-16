import { useState, useEffect } from 'react'
import { Settings, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Badge, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { equipoService, salaService } from '../services/api'

const ESTADO_OPTS = [
  { value: 'operativo',        label: 'Operativo' },
  { value: 'en_mantenimiento', label: 'En mantenimiento' },
  { value: 'dado_de_baja',     label: 'Dado de baja' },
]

const EMPTY = { nombre: '', marca: '', modelo: '', estado: 'operativo', salaIdSala: '' }

export default function EquiposPage() {
  const [data,    setData]    = useState([])
  const [salas,   setSalas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [eq, sal] = await Promise.all([equipoService.listar(), salaService.listar()])
      setData(eq.data)
      setSalas(sal.data.map(s => ({ value: s.idSala, label: `${s.nombreSala} (cap. ${s.capacidadMax})` })))
    } finally { setLoading(false) }
  }

  const openCreate = () => {
    setForm(EMPTY); setEditing(null); setError(''); setModal(true)
  }

  const openEdit = row => {
    setForm({
      nombre:    row.nombre,
      marca:     row.marca     || '',
      modelo:    row.modelo    || '',
      estado:    row.estado,
      salaIdSala: row.salaIdSala,
    })
    setEditing(row.idEquipo)
    setError('')
    setModal(true)
  }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editing) await equipoService.actualizar(editing, form)
      else         await equipoService.crear(form)
      setModal(false); fetchAll()
    } catch (err) {
      setError(err.response?.data || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  const del = async () => {
    try { await equipoService.eliminar(confirm); fetchAll() } finally { setConfirm(null) }
  }

  const cols = [
    { key: 'idEquipo',   label: 'ID',      width: 60 },
    { key: 'nombre',     label: 'Equipo' },
    { key: 'marca',      label: 'Marca',   width: 120 },
    { key: 'modelo',     label: 'Modelo',  width: 120 },
    { key: 'salaNombre', label: 'Sala',    width: 150 },
    {
      key: 'estado', label: 'Estado', width: 170,
      render: r => <Badge value={r.estado} />
    },
    { key: 'fechaCreacion', label: 'Registrado', width: 110 },
    {
      key: 'acciones', label: '', width: 80,
      render: r => (
        <div className="table-actions">
          <ActionBtn variant="edit"   icon={Pencil} onClick={() => openEdit(r)} />
          <ActionBtn variant="delete" icon={Trash2} onClick={() => setConfirm(r.idEquipo)} />
        </div>
      )
    },
  ]

  const operativos = data.filter(e => e.estado === 'operativo').length
  const baja       = data.filter(e => e.estado === 'dado_de_baja').length

  return (
    <div className="animate-fade">
      <PageHeader
        title="EQUIPOS"
        subtitle={`${operativos} operativos · ${baja} dados de baja · ${data.length} total`}
        action={<Button icon={Plus} onClick={openCreate}>Nuevo equipo</Button>}
      />

      <DataTable columns={cols} data={data} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'EDITAR EQUIPO' : 'NUEVO EQUIPO'}>
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <FormInput
              label="Nombre del equipo *"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Bicicleta Spinning 1"
              required
            />
            <FormInput
              label="Marca"
              value={form.marca}
              onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}
              placeholder="Ej: Technogym"
            />
            <FormInput
              label="Modelo"
              value={form.modelo}
              onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
              placeholder="Ej: RIDE 2024"
            />
            <FormSelect
              label="Sala *"
              value={form.salaIdSala}
              onChange={e => setForm(f => ({ ...f, salaIdSala: e.target.value }))}
              options={salas}
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
            <Button type="submit" loading={saving}>{editing ? 'Guardar cambios' : 'Registrar equipo'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={del}
        message="¿Eliminar este equipo? El historial de mantenimientos también se eliminará."
      />
    </div>
  )
}