import { useState, useEffect } from 'react'
import { DollarSign, Plus, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { pagoService, membresiaService } from '../services/api'

const METODO_OPTS = [
  { value:'efectivo',      label:'Efectivo' },
  { value:'tarjeta',       label:'Tarjeta' },
  { value:'transferencia', label:'Transferencia bancaria' },
]
const EMPTY = { membresiaIdMembresia:'', fechaPago:'', montoCop:'', metodoPago:'efectivo' }

export default function PagosPage() {
  const [data,        setData]        = useState([])
  const [membresias,  setMembresias]  = useState([])
  const [memData,     setMemData]     = useState([]) 
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(false)
  const [confirm,     setConfirm]     = useState(null)
  const [form,        setForm]        = useState(EMPTY)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [pag, mem] = await Promise.all([pagoService.listar(), membresiaService.listar()])
      setData(pag.data)
      setMemData(mem.data)
      setMembresias(mem.data.map(m => ({
        value: m.idMembresia,
        label: `#${m.idMembresia} - ${m.miembroNombre} (${m.planNombre}) — Total: $${Number(m.precioInscrito).toLocaleString('es-CO')}`
      })))
    } finally { setLoading(false) }
  }

  const totalPagadoPor = (idMembresia) =>
    data.filter(p => p.membresiaIdMembresia === idMembresia)
        .reduce((acc, p) => acc + Number(p.montoCop), 0)

  const handleMembresia = (e) => {
    const id = Number(e.target.value)
    const mem = memData.find(m => m.idMembresia === id)
    const pagado = totalPagadoPor(id)
    const pendiente = mem ? Number(mem.precioInscrito) - pagado : ''
    setForm(f => ({
      ...f,
      membresiaIdMembresia: e.target.value,
      montoCop: pendiente > 0 ? pendiente : ''
    }))
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
    { key:'numPago',              label:'#',         width:50 },
    { key:'miembroNombre',        label:'Miembro' },
    { key:'membresiaIdMembresia', label:'Membresía', width:90,  render: r => `#${r.membresiaIdMembresia}` },
    { key:'fechaPago',            label:'Fecha',     width:110 },
    { key:'montoCop',             label:'Monto',     width:130, render: r => `$ ${Number(r.montoCop).toLocaleString('es-CO')}` },
    { key:'metodoPago',           label:'Método',    width:130, render: r => <span style={{textTransform:'capitalize'}}>{r.metodoPago}</span> },
    {
      key:'pendiente', label:'Estado pago', width:150,
      render: r => {
        const mem = memData.find(m => m.idMembresia === r.membresiaIdMembresia)
        if (!mem) return '—'
        const totalPagado = totalPagadoPor(r.membresiaIdMembresia)
        const total = Number(mem.precioInscrito)
        const pendiente = total - totalPagado
        if (pendiente <= 0) return <span style={{color:'#22c55e',fontSize:12}}>✅ Saldado</span>
        return <span style={{color:'#f59e0b',fontSize:12}}>⚠️ Debe: ${pendiente.toLocaleString('es-CO')}</span>
      }
    },
    { key:'acciones', label:'', width:60, render: r => (
      <ActionBtn variant="delete" icon={Trash2}
        onClick={() => setConfirm({ numPago: r.numPago, membresiaIdMembresia: r.membresiaIdMembresia })} />
    )},
  ]

  const totalIngresos = data.reduce((acc, p) => acc + Number(p.montoCop), 0)

  return (
    <div className="animate-fade">
      <PageHeader
        title="PAGOS"
        subtitle={`${data.length} pagos · Total: $${totalIngresos.toLocaleString('es-CO')} COP`}
        action={<Button icon={Plus} onClick={() => { setForm(EMPTY); setError(''); setModal(true) }}>Registrar pago</Button>}
      />
      <DataTable columns={cols} data={data} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title="REGISTRAR PAGO">
        {error && <div className="form-error" style={{marginBottom:12}}>{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid form-grid--1">
            <FormSelect label="Membresía *" value={form.membresiaIdMembresia}
              onChange={handleMembresia} options={membresias} required />

            {form.membresiaIdMembresia && (() => {
              const mem = memData.find(m => m.idMembresia === Number(form.membresiaIdMembresia))
              const pagado = totalPagadoPor(Number(form.membresiaIdMembresia))
              const total = mem ? Number(mem.precioInscrito) : 0
              const pendiente = total - pagado
              return (
                <div style={{
                  padding:'10px 14px', borderRadius:8, fontSize:13,
                  background: pendiente <= 0 ? '#22c55e20' : '#f59e0b20',
                  border: `1px solid ${pendiente <= 0 ? '#22c55e40' : '#f59e0b40'}`,
                  color: pendiente <= 0 ? '#22c55e' : '#f59e0b'
                }}>
                  Total membresía: <strong>${total.toLocaleString('es-CO')}</strong> ·
                  Pagado: <strong>${pagado.toLocaleString('es-CO')}</strong> ·
                  Pendiente: <strong>${Math.max(0, pendiente).toLocaleString('es-CO')}</strong>
                </div>
              )
            })()}

            <FormInput label="Fecha del pago *" type="date" value={form.fechaPago}
              onChange={e=>setForm(f=>({...f,fechaPago:e.target.value}))} required />
            <FormInput label="Monto COP *" type="number" value={form.montoCop}
              onChange={e=>setForm(f=>({...f,montoCop:e.target.value}))} required />
            <FormSelect label="Método de pago" value={form.metodoPago}
              onChange={e=>setForm(f=>({...f,metodoPago:e.target.value}))} options={METODO_OPTS} />
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