import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Badge, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { claseService, empleadoService, salaService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const NIVEL_OPTS = [{ value:'basico',label:'Básico' },{ value:'intermedio',label:'Intermedio' },{ value:'avanzado',label:'Avanzado' }]
const DIA_OPTS = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].map(d=>({value:d,label:d.charAt(0).toUpperCase()+d.slice(1)}))
const ESTADO_OPTS = [{ value:'activo',label:'Activo' },{ value:'inactivo',label:'Inactivo' }]
const EMPTY = { nombreClase:'', disciplina:'', duracionMinutos:'', nivelDificultad:'basico', capacidadMax:'', diaSemana:'lunes', horaInicio:'', estado:'activo', instructorIdEmpleado:'', salaIdSala:'' }

export default function ClasesPage() {
  const { isInstructor } = useAuth()
  const [data,        setData]        = useState([])
  const [instructores,setInstructores]= useState([])
  const [salas,       setSalas]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(false)
  const [confirm,     setConfirm]     = useState(null)
  const [form,        setForm]        = useState(EMPTY)
  const [editing,     setEditing]     = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [cl, emp, sal] = await Promise.allSettled([
        claseService.listar(),
        empleadoService.listar(),
        salaService.listar()
      ])
      setData(cl.status === 'fulfilled' ? cl.value.data : [])
      setInstructores(emp.status === 'fulfilled'
        ? emp.value.data.filter(e => e.cargo === 'instructor').map(e => ({ value: e.idEmpleado, label: e.nombreCompleto }))
        : [])
      setSalas(sal.status === 'fulfilled'
        ? sal.value.data.map(s => ({ value: s.idSala, label: `${s.nombreSala} (cap. ${s.capacidadMax})` }))
        : [])
    } finally { setLoading(false) }
  }

  const openCreate = () => { setForm(EMPTY); setEditing(null); setError(''); setModal(true) }
  const openEdit   = row => { setForm({ ...row }); setEditing(row.idClase); setError(''); setModal(true) }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editing) await claseService.actualizar(editing, form)
      else         await claseService.crear(form)
      setModal(false); fetchAll()
    } catch (err) { setError(err.response?.data || 'Error.') } finally { setSaving(false) }
  }

  const del = async () => { try { await claseService.eliminar(confirm); fetchAll() } finally { setConfirm(null) } }

  const cols = [
    { key:'idClase',          label:'ID',          width:55 },
    { key:'nombreClase',      label:'Nombre' },
    { key:'disciplina',       label:'Disciplina',  width:120 },
    { key:'nivelDificultad',  label:'Nivel',       width:100, render: r => <Badge value={r.nivelDificultad} /> },
    { key:'capacidadMax',     label:'Cap.',         width:60 },
    { key:'diaSemana',        label:'Día',          width:90, render: r => <span style={{textTransform:'capitalize'}}>{r.diaSemana}</span> },
    { key:'horaInicio',       label:'Hora',         width:70 },
    { key:'instructorNombre', label:'Instructor',  width:160 },
    { key:'salaNombre',       label:'Sala',         width:120 },
    { key:'estado',           label:'Estado',       width:90, render: r => <Badge value={r.estado} /> },
    ...(!isInstructor() ? [{
      key:'acciones', label:'', width:80, render: r => (
        <div className="table-actions">
          <ActionBtn variant="edit"   icon={Pencil} onClick={() => openEdit(r)} />
          <ActionBtn variant="delete" icon={Trash2} onClick={() => setConfirm(r.idClase)} />
        </div>
      )
    }] : []),
  ]

  return (
    <div className="animate-fade">
      <PageHeader
        title="CLASES"
        subtitle={`${data.filter(c=>c.estado==='activo').length} activas`}
        action={!isInstructor() && <Button icon={Plus} onClick={openCreate}>Nueva clase</Button>}
      />
      <DataTable columns={cols} data={data} loading={loading} />

      {!isInstructor() && (
        <>
          <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'EDITAR CLASE' : 'NUEVA CLASE'} width={640}>
            {error && <div className="form-error" style={{marginBottom:12}}>{error}</div>}
            <form onSubmit={save}>
              <div className="form-grid">
                <FormInput label="Nombre *" value={form.nombreClase} onChange={e=>setForm(f=>({...f,nombreClase:e.target.value}))} required />
                <FormInput label="Disciplina *" value={form.disciplina} onChange={e=>setForm(f=>({...f,disciplina:e.target.value}))} required />
                <FormInput label="Duración (min) *" type="number" value={form.duracionMinutos} onChange={e=>setForm(f=>({...f,duracionMinutos:e.target.value}))} required />
                <FormInput label="Capacidad máx. *" type="number" value={form.capacidadMax} onChange={e=>setForm(f=>({...f,capacidadMax:e.target.value}))} required />
                <FormSelect label="Nivel dificultad" value={form.nivelDificultad} onChange={e=>setForm(f=>({...f,nivelDificultad:e.target.value}))} options={NIVEL_OPTS} />
                <FormSelect label="Día de la semana" value={form.diaSemana} onChange={e=>setForm(f=>({...f,diaSemana:e.target.value}))} options={DIA_OPTS} />
                <FormInput label="Hora inicio (HH:MM) *" value={form.horaInicio} onChange={e=>setForm(f=>({...f,horaInicio:e.target.value}))} placeholder="07:00" required />
                <FormSelect label="Instructor *" value={form.instructorIdEmpleado} onChange={e=>setForm(f=>({...f,instructorIdEmpleado:e.target.value}))} options={instructores} required />
                <FormSelect label="Sala *" value={form.salaIdSala} onChange={e=>setForm(f=>({...f,salaIdSala:e.target.value}))} options={salas} required />
                <FormSelect label="Estado" value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))} options={ESTADO_OPTS} />
              </div>
              <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}>
                <Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancelar</Button>
                <Button type="submit" loading={saving}>{editing ? 'Guardar' : 'Crear clase'}</Button>
              </div>
            </form>
          </Modal>
          <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} message="¿Eliminar esta clase?" />
        </>
      )}
    </div>
  )
}