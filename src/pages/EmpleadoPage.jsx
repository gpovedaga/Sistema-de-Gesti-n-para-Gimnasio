import { useState, useEffect } from 'react'
import { UserCog, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Badge, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { empleadoService } from '../services/api'

const CARGO_OPTS = [
  { value:'administrador',         label:'Administrador' },
  { value:'recepcionista',         label:'Recepcionista' },
  { value:'instructor',            label:'Instructor' },
  { value:'tecnico_mantenimiento', label:'Técnico de Mantenimiento' },
]
const ESTADO_OPTS = [
  { value:'activo',   label:'Activo' },
  { value:'retirado', label:'Retirado' },
]
const NIVEL_ACCESO_OPTS = [
  { value:'total',    label:'Total' },
  { value:'parcial',  label:'Parcial' },
]
const EMPTY = {
  documento:'', nombreCompleto:'', correo:'', password:'', telefono:'',
  cargo:'recepcionista', estado:'activo',
  nivelAcceso:'', areaEspecialidad:'', especialidad:'', nivelCertificacion:''
}

export default function EmpleadosPage() {
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
    try { const r = await empleadoService.listar(); setData(r.data) } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(EMPTY); setEditing(null); setError(''); setModal(true) }
  const openEdit   = row => { setForm({...row, password:''}); setEditing(row.idEmpleado); setError(''); setModal(true) }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editing) await empleadoService.actualizar(editing, form)
      else         await empleadoService.crear(form)
      setModal(false); fetchData()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  const del = async () => { try { await empleadoService.eliminar(confirm); fetchData() } finally { setConfirm(null) } }

  const cols = [
    { key:'idEmpleado',    label:'ID',       width:60 },
    { key:'nombreCompleto',label:'Nombre' },
    { key:'correo',        label:'Correo' },
    { key:'telefono',      label:'Teléfono', width:120 },
    { key:'cargo', label:'Cargo', width:160, render: r => <span style={{textTransform:'capitalize'}}>{r.cargo?.replace(/_/g,' ')}</span> },
    { key:'estado', label:'Estado', width:100, render: r => <Badge value={r.estado} /> },
    { key:'acciones', label:'', width:80, render: r => (
      <div className="table-actions">
        <ActionBtn variant="edit"   icon={Pencil} onClick={() => openEdit(r)} />
        <ActionBtn variant="delete" icon={Trash2} onClick={() => setConfirm(r.idEmpleado)} />
      </div>
    )},
  ]

  return (
    <div className="animate-fade">
      <PageHeader title="EMPLEADOS" subtitle={`${data.length} empleados registrados`}
        action={<Button icon={Plus} onClick={openCreate}>Nuevo empleado</Button>} />
      <DataTable columns={cols} data={data} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'EDITAR EMPLEADO' : 'NUEVO EMPLEADO'}>
        {error && <div className="form-error" style={{marginBottom:12}}>{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <FormInput label="Documento *" value={form.documento}
              onChange={e=>setForm(f=>({...f,documento:e.target.value}))} required disabled={!!editing} />
            <FormInput label="Nombre completo *" value={form.nombreCompleto}
              onChange={e=>setForm(f=>({...f,nombreCompleto:e.target.value}))} required />
            <FormInput label="Correo *" type="email" value={form.correo}
              onChange={e=>setForm(f=>({...f,correo:e.target.value}))} required />
            <FormInput label={editing ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
              type="password" value={form.password}
              onChange={e=>setForm(f=>({...f,password:e.target.value}))} required={!editing} />
            <FormInput label="Teléfono" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value.replace(/\D/g, '') }))} maxLength={15} />
            <FormSelect label="Cargo" value={form.cargo}
              onChange={e=>setForm(f=>({...f,cargo:e.target.value}))} options={CARGO_OPTS} />
            <FormSelect label="Estado" value={form.estado}
              onChange={e=>setForm(f=>({...f,estado:e.target.value}))} options={ESTADO_OPTS} />

            {/* Campos según cargo */}
            {form.cargo === 'administrador' && (
              <FormSelect label="Nivel de acceso"
                value={form.nivelAcceso || ''}
                onChange={e=>setForm(f=>({...f,nivelAcceso:e.target.value}))}
                options={NIVEL_ACCESO_OPTS} />
            )}

            {form.cargo === 'tecnico_mantenimiento' && (
              <FormInput label="Área de especialidad"
                value={form.areaEspecialidad || ''}
                onChange={e=>setForm(f=>({...f,areaEspecialidad:e.target.value}))}
                placeholder="Ej: Eléctrica, Mecánica, Hidráulica" />
            )}

            {form.cargo === 'instructor' && (
              <>
                <FormInput label="Especialidad"
                  value={form.especialidad || ''}
                  onChange={e=>setForm(f=>({...f,especialidad:e.target.value}))}
                  placeholder="Ej: Yoga, CrossFit, Natación" />
                <FormInput label="Nivel de certificación"
                  value={form.nivelCertificacion || ''}
                  onChange={e=>setForm(f=>({...f,nivelCertificacion:e.target.value}))}
                  placeholder="Ej: Básico, Avanzado, Internacional" />
              </>
            )}
          </div>

          <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}>
            <Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Guardar cambios' : 'Crear empleado'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} message="¿Eliminar este empleado?" />
    </div>
  )
}