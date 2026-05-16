import { useState, useEffect } from 'react'
import { Wrench, Plus, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Modal, ConfirmDialog, FormInput, FormSelect, Button, ActionBtn } from '../components/common/Common'
import { mantenimientoService, equipoService, empleadoService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const EMPTY = {
  equipoIdEquipo:          '',
  fechaMantenimiento:      '',
  costoCop:                '',
  descripcion:             '',
  tecnicoIdEmpleado:       '',
  administradorIdEmpleado: '',
}

export default function MantenimientosPage() {
  const { user, isTecnico } = useAuth()
  const [data,          setData]          = useState([])
  const [equipos,       setEquipos]       = useState([])
  const [tecnicos,      setTecnicos]      = useState([])
  const [admins,        setAdmins]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [modal,         setModal]         = useState(false)
  const [confirm,       setConfirm]       = useState(null)
  const [form,          setForm]          = useState(EMPTY)
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState('')
  const [miIdEmpleado,  setMiIdEmpleado]  = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [mant, eq, emp] = await Promise.allSettled([
        mantenimientoService.listar(),
        equipoService.listar(),
        empleadoService.listar(),
      ])
      setData(mant.status === 'fulfilled' ? mant.value.data : [])

      const eqData = eq.status === 'fulfilled' ? eq.value.data : []
      setEquipos(eqData
        .filter(e => e.estado !== 'dado_de_baja')
        .map(e => ({ value: e.idEquipo, label: `${e.nombre} — ${e.salaNombre || 'Sin sala'}` }))
      )

      const empData = emp.status === 'fulfilled' ? emp.value.data.filter(e => e.estado === 'activo') : []
      setTecnicos(empData
        .filter(e => e.cargo === 'tecnico_mantenimiento')
        .map(e => ({ value: e.idEmpleado, label: e.nombreCompleto }))
      )
      setAdmins(empData
        .filter(e => e.cargo === 'administrador')
        .map(e => ({ value: e.idEmpleado, label: e.nombreCompleto }))
      )

      // Si es técnico, autocompletar su propio ID
      if (isTecnico()) {
        const yo = empData.find(e => e.correo === user.correo)
        if (yo) setMiIdEmpleado(yo.idEmpleado)
      }
    } finally { setLoading(false) }
  }

  const openCreate = () => {
    setForm({
      ...EMPTY,
      tecnicoIdEmpleado: isTecnico() && miIdEmpleado ? miIdEmpleado : ''
    })
    setError('')
    setModal(true)
  }

  const save = async e => {
    e.preventDefault(); setSaving(true); setError('')
    if (!form.tecnicoIdEmpleado && !form.administradorIdEmpleado) {
      setError('Debes asignar al menos un técnico o administrador responsable.')
      setSaving(false); return
    }
    const payload = {
      equipoIdEquipo:          Number(form.equipoIdEquipo),
      fechaMantenimiento:      form.fechaMantenimiento,
      costoCop:                Number(form.costoCop),
      descripcion:             form.descripcion,
      tecnicoIdEmpleado:       form.tecnicoIdEmpleado       ? Number(form.tecnicoIdEmpleado)       : null,
      administradorIdEmpleado: form.administradorIdEmpleado ? Number(form.administradorIdEmpleado) : null,
    }
    try {
      await mantenimientoService.crear(payload)
      setModal(false); fetchAll()
    } catch (err) {
      setError(err.response?.data || 'Error al registrar.')
    } finally { setSaving(false) }
  }

  const del = async () => {
    if (!confirm) return
    try {
      await mantenimientoService.eliminar(confirm.idMantenimiento, confirm.equipoIdEquipo)
      fetchAll()
    } finally { setConfirm(null) }
  }

  const cols = [
    { key: 'idMantenimiento',    label: 'ID',          width: 60 },
    { key: 'equipoNombre',       label: 'Equipo' },
    { key: 'fechaMantenimiento', label: 'Fecha',        width: 110 },
    {
      key: 'costoCop', label: 'Costo', width: 140,
      render: r => `$ ${Number(r.costoCop).toLocaleString('es-CO')}`
    },
    {
      key: 'tecnicoNombre', label: 'Responsable', width: 180,
      render: r => r.tecnicoNombre || r.administradorNombre || '—'
    },
    {
      key: 'descripcion', label: 'Descripción',
      render: r => (
        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          {r.descripcion ? (r.descripcion.length > 60 ? r.descripcion.slice(0, 60) + '…' : r.descripcion) : '—'}
        </span>
      )
    },
    {
      key: 'acciones', label: '', width: 60,
      render: r => (
        <ActionBtn
          variant="delete"
          icon={Trash2}
          onClick={() => setConfirm({ idMantenimiento: r.idMantenimiento, equipoIdEquipo: r.equipoIdEquipo })}
        />
      )
    },
  ]

  const totalCosto = data.reduce((acc, m) => acc + Number(m.costoCop || 0), 0)

  return (
    <div className="animate-fade">
      <PageHeader
        title="MANTENIMIENTOS"
        subtitle={`${data.length} registros · Total: $ ${totalCosto.toLocaleString('es-CO')} COP`}
        action={<Button icon={Plus} onClick={openCreate}>Registrar mantenimiento</Button>}
      />

      <DataTable columns={cols} data={data} loading={loading} />

      <Modal open={modal} onClose={() => setModal(false)} title="REGISTRAR MANTENIMIENTO" width={560}>
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={save}>
          <div className="form-grid form-grid--1">
            <FormSelect
              label="Equipo *"
              value={form.equipoIdEquipo}
              onChange={e => setForm(f => ({ ...f, equipoIdEquipo: e.target.value }))}
              options={equipos}
              required
            />
          </div>

          <div className="form-grid" style={{ marginTop: 14 }}>
            <FormInput
              label="Fecha del mantenimiento *"
              type="date"
              value={form.fechaMantenimiento}
              onChange={e => setForm(f => ({ ...f, fechaMantenimiento: e.target.value }))}
              required
            />
            <FormInput
              label="Costo COP *"
              type="number"
              min="0"
              value={form.costoCop}
              onChange={e => setForm(f => ({ ...f, costoCop: e.target.value }))}
              placeholder="Ej: 150000"
              required
            />

            {isTecnico() ? (
              <div className="form-group">
                <label className="form-label">Técnico responsable</label>
                <div className="form-input" style={{ color: 'var(--text-secondary)', background: 'var(--surface-2)' }}>
                  {tecnicos.find(t => t.value == miIdEmpleado)?.label || 'Tú (técnico actual)'}
                </div>
              </div>
            ) : (
              <>
                <FormSelect
                  label="Técnico responsable"
                  value={form.tecnicoIdEmpleado}
                  onChange={e => setForm(f => ({ ...f, tecnicoIdEmpleado: e.target.value }))}
                  options={tecnicos}
                />
                <FormSelect
                  label="Administrador responsable"
                  value={form.administradorIdEmpleado}
                  onChange={e => setForm(f => ({ ...f, administradorIdEmpleado: e.target.value }))}
                  options={admins}
                />
              </>
            )}
          </div>

          <div className="form-grid form-grid--1" style={{ marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Describe el trabajo realizado..."
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
            * Debe asignarse al menos un técnico de mantenimiento o un administrador como responsable.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <Button variant="ghost" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Registrar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={del}
        message="¿Eliminar este registro de mantenimiento?"
      />
    </div>
  )
}