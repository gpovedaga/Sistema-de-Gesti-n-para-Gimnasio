import { useState, useEffect } from 'react'
import { Users, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Badge, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { miembroService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ESTADO_OPTS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'suspendido', label: 'Suspendido' },
]

const EMPTY = { documento: '', nombreCompleto: '', correoElectronico: '', telefono: '', fechaNacimiento: '', estado: 'activo' }

export default function MiembrosPage() {
  const { isInstructor, isAdmin } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [esMenor, setEsMenor] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try { const r = await miembroService.listar(); setData(r.data) } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(EMPTY); setEditing(null); setError(''); setModal(true) }
  const openEdit = row => { setForm({ ...row }); setEditing(row.documento); setError(''); setModal(true) }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editing) await miembroService.actualizar(editing, form)
      else await miembroService.crear(form)
      setModal(false); fetchData()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  const del = async () => {
    try { await miembroService.eliminar(confirm); fetchData() } finally { setConfirm(null) }
  }

  const cols = [
    { key: 'documento', label: 'Documento', width: 120 },
    { key: 'nombreCompleto', label: 'Nombre' },
    { key: 'correoElectronico', label: 'Correo' },
    { key: 'telefono', label: 'Teléfono', width: 120 },
    { key: 'fechaNacimiento', label: 'Nacimiento', width: 120 },
    { key: 'estado', label: 'Estado', width: 110, render: r => <Badge value={r.estado} /> },
    ...(!isInstructor() ? [{
      key: 'acciones', label: '', width: 80, render: r => (
        <div className="table-actions">
          <ActionBtn variant="edit" icon={Pencil} onClick={() => openEdit(r)} />
          {isAdmin() && <ActionBtn variant="delete" icon={Trash2} onClick={() => setConfirm(r.documento)} />}
        </div>
      )
    }] : []),
  ]

  const handleFecha = e => {
    const fecha = e.target.value
    setForm(f => ({ ...f, fechaNacimiento: fecha }))
    if (fecha) {
      const hoy = new Date()
      const nac = new Date(fecha)
      const edad = hoy.getFullYear() - nac.getFullYear() -
        (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate()) ? 1 : 0)
      setEsMenor(edad < 18)
    }
  }

  return (
    <div className="animate-fade">
      <PageHeader
        title="MIEMBROS"
        subtitle={`${data.length} miembros registrados`}
        action={!isInstructor() && <Button icon={Plus} onClick={openCreate}>Nuevo miembro</Button>}
      />
      <DataTable columns={cols} data={data} loading={loading} />

      {!isInstructor() && (
        <>
          <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'EDITAR MIEMBRO' : 'NUEVO MIEMBRO'}>
            {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
            <form onSubmit={save}>
              <div className="form-grid">
                <FormInput label="Documento *" value={form.documento} onChange={e => setForm(f => ({ ...f, documento: e.target.value }))} required disabled={!!editing} />
                <FormInput label="Nombre completo *" value={form.nombreCompleto} onChange={e => setForm(f => ({ ...f, nombreCompleto: e.target.value }))} required />
                <FormInput label="Correo *" type="email" value={form.correoElectronico} onChange={e => setForm(f => ({ ...f, correoElectronico: e.target.value }))} required />
                <FormInput label="Teléfono" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value.replace(/\D/g, '') }))} maxLength={15} />                <FormInput label="Fecha de nacimiento *" type="date" value={form.fechaNacimiento} onChange={handleFecha} required />
                {esMenor && (
                  <>
                    <div style={{
                      gridColumn: '1/-1', padding: '10px 14px', background: '#f59e0b20',
                      border: '1px solid #f59e0b40', borderRadius: 8, fontSize: 13, color: '#f59e0b'
                    }}>
                      El miembro es menor de edad. Debes registrar un acudiente responsable.
                    </div>
                    <FormInput label="Nombre del acudiente *" value={form.acudienteNombre || ''}
                      onChange={e => setForm(f => ({ ...f, acudienteNombre: e.target.value }))} required />
                    <FormInput label="Teléfono del acudiente *" value={form.acudienteTelefono || ''}
                      onChange={e => setForm(f => ({ ...f, acudienteTelefono: e.target.value }))} required />
                    <FormInput label="Correo del acudiente" value={form.acudienteCorreo || ''}
                      onChange={e => setForm(f => ({ ...f, acudienteCorreo: e.target.value }))} />
                    <FormInput label="Parentesco" value={form.acudienteParentesco || ''}
                      onChange={e => setForm(f => ({ ...f, acudienteParentesco: e.target.value }))}
                      placeholder="Ej: Madre, Padre, Tutor" />
                  </>
                )}
                <FormSelect label="Estado" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} options={ESTADO_OPTS} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancelar</Button>
                <Button type="submit" loading={saving}>{editing ? 'Guardar cambios' : 'Crear miembro'}</Button>
              </div>
            </form>
          </Modal>
          <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} message="¿Eliminar este miembro? Esta acción no se puede deshacer." />
        </>
      )}
    </div>
  )
}