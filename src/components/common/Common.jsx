/* ─────────────────────────────────────────────────────────────────
   Common UI Components
   - PageHeader
   - StatCard
   - DataTable
   - Badge
   - Modal
   - FormInput / FormSelect
   - ConfirmDialog
   - EmptyState
   - Spinner
───────────────────────────────────────────────────────────────── */
import { useState } from 'react'
import { X, AlertTriangle, Search } from 'lucide-react'
import './Common.css'
import { createPortal } from 'react-dom'   // ← agrega esto

/* ── PageHeader ───────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  )
}

/* ── StatCard ─────────────────────────────────────────────────── */
export function StatCard({ title, value, icon: Icon, color = 'var(--accent)', trend }) {
  return (
    <div className="stat-card animate-fade">
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>
        <div className="stat-icon" style={{ background: `${color}20`, color }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {trend && <div className={`stat-trend stat-trend--${trend.type}`}>{trend.label}</div>}
    </div>
  )
}

/* ── Badge ────────────────────────────────────────────────────── */
const BADGE_COLORS = {
  activo:           { bg:'#22c55e20', color:'#22c55e', border:'#22c55e40' },
  activa:           { bg:'#22c55e20', color:'#22c55e', border:'#22c55e40' },
  disponible:       { bg:'#22c55e20', color:'#22c55e', border:'#22c55e40' },
  operativo:        { bg:'#22c55e20', color:'#22c55e', border:'#22c55e40' },
  confirmada:       { bg:'#3b82f620', color:'#3b82f6', border:'#3b82f640' },
  inactivo:         { bg:'#55556a20', color:'#8888a8', border:'#55556a40' },
  inactiva:         { bg:'#55556a20', color:'#8888a8', border:'#55556a40' },
  suspendido:       { bg:'#f59e0b20', color:'#f59e0b', border:'#f59e0b40' },
  vencida:          { bg:'#f59e0b20', color:'#f59e0b', border:'#f59e0b40' },
  cancelada:        { bg:'#ef444420', color:'#ef4444', border:'#ef444440' },
  dado_de_baja:     { bg:'#ef444420', color:'#ef4444', border:'#ef444440' },
  retirado:         { bg:'#ef444420', color:'#ef4444', border:'#ef444440' },
  ausente:          { bg:'#ef444420', color:'#ef4444', border:'#ef444440' },
  en_mantenimiento: { bg:'#ff4d0020', color:'#ff4d00', border:'#ff4d0040' },
  asistida:         { bg:'#8b5cf620', color:'#8b5cf6', border:'#8b5cf640' },
}

export function Badge({ value }) {
  const style = BADGE_COLORS[value] || { bg:'#33334420', color:'#8888a8', border:'#33334440' }
  return (
    <span className="badge" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
      {value?.replace(/_/g, ' ')}
    </span>
  )
}

/* ── DataTable ────────────────────────────────────────────────── */
export function DataTable({ columns, data, loading, searchable = true }) {
  const [search, setSearch] = useState('')

  const filtered = searchable && search
    ? data.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
    : data

  return (
    <div className="table-wrapper animate-fade">
      {searchable && (
        <div className="table-search">
          <Search size={15} className="table-search-icon" />
          <input
            className="table-search-input"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ width: col.width }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} className="table-loading"><Spinner /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={columns.length} className="table-empty">Sin resultados</td></tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</div>
    </div>
  )
}

/* ── Modal ────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null
  return createPortal(           // ← envuelve con portal
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body               // ← se monta directo en el body
  )
}

/* ── ConfirmDialog ────────────────────────────────────────────── */
export function ConfirmDialog({ open, onClose, onConfirm, message = '¿Estás seguro?' }) {
  if (!open) return null
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <AlertTriangle size={32} color="var(--warning)" />
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── FormInput ────────────────────────────────────────────────── */
export function FormInput({ label, error, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input className={`form-input ${error ? 'form-input--error' : ''}`} {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

/* ── FormSelect ───────────────────────────────────────────────── */
export function FormSelect({ label, error, options, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select className={`form-input ${error ? 'form-input--error' : ''}`} {...props}>
        <option value="">Seleccionar...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

/* ── ActionButton ─────────────────────────────────────────────── */
export function ActionBtn({ onClick, variant = 'edit', icon: Icon, label }) {
  return (
    <button className={`action-btn action-btn--${variant}`} onClick={onClick} title={label}>
      {Icon && <Icon size={14} />}
      {label && <span>{label}</span>}
    </button>
  )
}

/* ── Spinner ──────────────────────────────────────────────────── */
export function Spinner() {
  return <div className="spinner" />
}

/* ── Button ───────────────────────────────────────────────────── */
export function Button({ children, variant = 'primary', loading, icon: Icon, ...props }) {
  return (
    <button className={`btn btn-${variant}`} disabled={loading} {...props}>
      {loading ? <Spinner /> : Icon ? <Icon size={15} /> : null}
      {children}
    </button>
  )
}