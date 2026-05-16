import { useState, useEffect } from 'react'
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Badge, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { planService } from '../services/api'

const ESTADO_OPTS = [{ value:'activo', label:'Activo' },{ value:'inactivo', label:'Inactivo' }]
const EMPTY = { nombre:'', precioCop:'', duracionDias:'', estado:'activo' }

export default function PlanesPage() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => { fetch() }, [])
  const fetch = async () => { setLoading(true); try { const r = await planService.listar(); setData(r.data) } finally { setLoading(false) } }

  const openCreate = () => { setForm(EMPTY); setEditing(null); setError(''); setModal(true) }
  const openEdit   = row => { setForm({...row}); setEditing(row.idPlan); setError(''); setModal(true) }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editing) await planService.actualizar(editing, form)
      else         await planService.crear(form)
      setModal(false); fetch()
    } catch (err) { setError(err.response?.data || 'Error.') } finally { setSaving(false) }
  }

  const del = async () => { try { await planService.eliminar(confirm); fetch() } finally { setConfirm(null) } }

  const cols = [
    { key:'idPlan',      label:'ID',       width:60 },
    { key:'nombre',      label:'Nombre' },
    { key:'precioCop',   label:'Precio COP', width:140, render: r => `$ ${Number(r.precioCop).toLocaleString('es-CO')}` },
    { key:'duracionDias',label:'Duración',   width:100, render: r => `${r.duracionDias} días` },
    { key:'estado', label:'Estado', width:100, render: r => <Badge value={r.estado} /> },
    { key:'acciones', label:'', width:80, render: r => (
      <div className="table-actions">
        <ActionBtn variant="edit"   icon={Pencil} onClick={() => openEdit(r)} />
        <ActionBtn variant="delete" icon={Trash2} onClick={() => setConfirm(r.idPlan)} />
      </div>
    )},
  ]

  return (
    <div className="animate-fade">
      <PageHeader title="PLANES" subtitle={`${data.length} planes registrados`} action={<Button icon={Plus} onClick={openCreate}>Nuevo plan</Button>} />
      <DataTable columns={cols} data={data} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'EDITAR PLAN' : 'NUEVO PLAN'}>
        {error && <div className="form-error" style={{marginBottom:12}}>{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid">
            <FormInput label="Nombre *" value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} required />
            <FormInput label="Precio COP *" type="number" value={form.precioCop} onChange={e=>setForm(f=>({...f,precioCop:e.target.value}))} required />
            <FormInput label="Duración (días) *" type="number" value={form.duracionDias} onChange={e=>setForm(f=>({...f,duracionDias:e.target.value}))} required />
            <FormSelect label="Estado" value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))} options={ESTADO_OPTS} />
          </div>
          <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}>
            <Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Guardar' : 'Crear plan'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} message="¿Eliminar este plan?" />
    </div>
  )
}