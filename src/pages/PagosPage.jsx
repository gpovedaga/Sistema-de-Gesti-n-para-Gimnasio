import { useState, useEffect } from 'react'
import { DollarSign, Plus, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { pagoService, membresiaService } from '../services/api'

const METODO_OPTS = [
  { value:'efectivo', label:'Efectivo' },
  { value:'tarjeta', label:'Tarjeta' },
  { value:'transferencia', label:'Transferencia bancaria' },
]
const EMPTY = { membresiaIdMembresia:'', fechaPago:'', montoCop:'', metodoPago:'efectivo' }

export default function PagosPage() {
  const [data,       setData]       = useState([])
  const [membresias, setMembresias] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [confirm,    setConfirm]    = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [pag, mem] = await Promise.all([pagoService.listar(), membresiaService.listar()])
      setData(pag.data)
      setMembresias(mem.data.map(m => ({ value: m.idMembresia, label: `#${m.idMembresia} - ${m.miembroNombre} (${m.planNombre})` })))
    } finally { setLoading(false) }
  }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try { await pagoService.crear(form); setModal(false); fetchAll() }
    catch (err) { setError(err.response?.data || 'Error.') } finally { setSaving(false) }
  }

  const del = async () => {
    if (!confirm) return
    try { await pagoService.eliminar(confirm.numPago, confirm.membresiaIdMembresia); fetchAll() }
    finally { setConfirm(null) }
  }

  const cols = [
    { key:'numPago',            label:'#',       width:50 },
    { key:'miembroNombre',      label:'Miembro' },
    { key:'membresiaIdMembresia',label:'Membresía',width:90, render: r => `#${r.membresiaIdMembresia}` },
    { key:'fechaPago',          label:'Fecha',   width:110 },
    { key:'montoCop',           label:'Monto',   width:130, render: r => `$ ${Number(r.montoCop).toLocaleString('es-CO')}` },
    { key:'metodoPago',         label:'Método',  width:130, render: r => <span style={{textTransform:'capitalize'}}>{r.metodoPago}</span> },
    { key:'acciones', label:'', width:60, render: r => (
      <ActionBtn variant="delete" icon={Trash2} onClick={() => setConfirm({ numPago: r.numPago, membresiaIdMembresia: r.membresiaIdMembresia })} />
    )},
  ]

  return (
    <div className="animate-fade">
      <PageHeader
        title="PAGOS"
        subtitle={`${data.length} pagos registrados`}
        action={<Button icon={Plus} onClick={() => { setForm(EMPTY); setError(''); setModal(true) }}>Registrar pago</Button>}
      />
      <DataTable columns={cols} data={data} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title="REGISTRAR PAGO">
        {error && <div className="form-error" style={{marginBottom:12}}>{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid form-grid--1">
            <FormSelect label="Membresía *" value={form.membresiaIdMembresia} onChange={e=>setForm(f=>({...f,membresiaIdMembresia:e.target.value}))} options={membresias} required />
            <FormInput label="Fecha del pago *" type="date" value={form.fechaPago} onChange={e=>setForm(f=>({...f,fechaPago:e.target.value}))} required />
            <FormInput label="Monto COP *" type="number" value={form.montoCop} onChange={e=>setForm(f=>({...f,montoCop:e.target.value}))} required />
            <FormSelect label="Método de pago" value={form.metodoPago} onChange={e=>setForm(f=>({...f,metodoPago:e.target.value}))} options={METODO_OPTS} />
          </div>
          <div style={{display:'flex',gap:10,marginTop:20,justifyContent:'flex-end'}}>
            <Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Registrar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={del} message="¿Eliminar este pago?" />
    </div>
  )
}