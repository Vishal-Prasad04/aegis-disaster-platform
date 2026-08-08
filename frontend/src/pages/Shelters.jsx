import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Droplet, UtensilsCrossed, Stethoscope } from 'lucide-react'
import * as shelterApi from '../api/shelterApi'
import * as disasterApi from '../api/disasterApi'
import { useUI } from '../context/UIContext'
import { useForm } from '../hooks/useForm'
import { required, isNonNegativeNumber } from '../utils/validators'
import { percentage } from '../utils/helpers'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import ErrorComponent from '../components/common/ErrorComponent'

const SUPPLY_LEVELS = ['Adequate', 'Low', 'Critical']

function SupplyPill({ icon: Icon, label, level }) {
  const colors = { Adequate: 'text-signal-safe', Low: 'text-signal-warning', Critical: 'text-signal-critical' }
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon size={13} className={colors[level]} />
      <span className="text-ink-500">{label}</span>
      <span className={`font-medium ${colors[level]}`}>{level}</span>
    </div>
  )
}

export default function Shelters() {
  const { notifySuccess, notifyError } = useUI()
  const [items, setItems] = useState([])
  const [disasters, setDisasters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [saving, setSaving] = useState(false)

  const { values, errors, handleChange, validate, reset, setValues } = useForm(
    { name: '', location: '', capacity: '', occupancy: '', food: 'Adequate', water: 'Adequate', medical: 'Adequate', disasterId: '' },
    { name: [required], location: [required], capacity: [required, isNonNegativeNumber], occupancy: [required, isNonNegativeNumber] },
  )

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [sheltersRes, disastersRes] = await Promise.all([shelterApi.getShelters(), disasterApi.getDisasters()])
      setItems(sheltersRes.data.items)
      setDisasters(disastersRes.data.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditingId(null); reset(); setModalOpen(true) }
  const openEdit = (item) => {
    setEditingId(item.id)
    setValues({ ...item, capacity: String(item.capacity), occupancy: String(item.occupancy) })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { ...values, capacity: Number(values.capacity), occupancy: Number(values.occupancy) }
      if (editingId) {
        await shelterApi.updateShelter(editingId, payload)
        notifySuccess('Shelter updated')
      } else {
        await shelterApi.createShelter(payload)
        notifySuccess('Shelter added')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      notifyError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    try {
      await shelterApi.deleteShelter(deletingItem.id)
      notifySuccess('Shelter removed')
      setDeletingItem(null)
      load()
    } catch (err) {
      notifyError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold">Shelters</h1>
          <p className="text-sm text-ink-500 mt-1">Capacity, occupancy, and supply status across relief shelters.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Shelter</Button>
      </div>

      {error ? (
        <Card><ErrorComponent message={error} onRetry={load} /></Card>
      ) : loading ? (
        <Card><Loader label="Loading shelters..." /></Card>
      ) : items.length === 0 ? (
        <Card><EmptyState message="No shelters registered yet" /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => {
            const occPct = percentage(s.occupancy, s.capacity)
            return (
              <Card key={s.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-ink-100">{s.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{s.location}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(s)} aria-label="Edit" />
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeletingItem(s)} className="hover:text-signal-critical" aria-label="Delete" />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink-500">Occupancy</span>
                    <span className="font-mono text-ink-300">{s.occupancy} / {s.capacity} ({occPct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${occPct >= 95 ? 'bg-signal-critical' : occPct >= 80 ? 'bg-signal-warning' : 'bg-signal-safe'}`}
                      style={{ width: `${occPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-3 border-t border-white/[0.05]">
                  <SupplyPill icon={UtensilsCrossed} label="Food" level={s.food} />
                  <SupplyPill icon={Droplet} label="Water" level={s.water} />
                  <SupplyPill icon={Stethoscope} label="Medical" level={s.medical} />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Shelter' : 'Add Shelter'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingId ? 'Save Changes' : 'Add Shelter'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Shelter name" value={values.name} onChange={handleChange('name')} error={errors.name} />
          <Input label="Location" value={values.location} onChange={handleChange('location')} error={errors.location} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Capacity" type="number" value={values.capacity} onChange={handleChange('capacity')} error={errors.capacity} />
            <Input label="Current occupancy" type="number" value={values.occupancy} onChange={handleChange('occupancy')} error={errors.occupancy} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['food', 'water', 'medical'].map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-ink-500 mb-1.5 capitalize">{field}</label>
                <select value={values[field]} onChange={(e) => handleChange(field)(e.target.value)} className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-ink-100">
                  {SUPPLY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1.5">Linked disaster</label>
            <select value={values.disasterId} onChange={(e) => handleChange('disasterId')(e.target.value)} className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100">
              <option value="">None</option>
              {disasters.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Remove Shelter"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeletingItem(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-ink-300">Remove <span className="text-ink-100 font-medium">{deletingItem?.name}</span>? This cannot be undone.</p>
      </Modal>
    </div>
  )
}
