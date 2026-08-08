import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, MapPin, Users2 } from 'lucide-react'
import * as disasterApi from '../api/disasterApi'
import { useUI } from '../context/UIContext'
import { useForm } from '../hooks/useForm'
import { required, isPositiveNumber } from '../utils/validators'
import { DISASTER_STATUS, PRIORITY, RESOURCE_CATEGORIES } from '../constants'
import { formatDate } from '../utils/helpers'
import Card from '../components/common/Card'
import Filters from '../components/common/Filters'
import Dropdown from '../components/common/Dropdown'
import SearchBar from '../components/common/SearchBar'
import Button from '../components/common/Button'
import StatusBadge from '../components/common/StatusBadge'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import ErrorComponent from '../components/common/ErrorComponent'

export default function DisasterMap() {
  const { notifySuccess, notifyError } = useUI()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [saving, setSaving] = useState(false)

  const { values, errors, handleChange, validate, reset, setValues } = useForm(
    {
      name: '', type: '', status: DISASTER_STATUS.MONITORING, priority: PRIORITY.MEDIUM,
      affectedPopulation: '', location: '', description: '', requiredResources: [],
    },
    {
      name: [required], type: [required], location: [required],
      affectedPopulation: [required, isPositiveNumber], description: [required],
    },
  )

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await disasterApi.getDisasters({ search, status, priority })
      setItems(data.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority])

  const openCreate = () => {
    setEditingId(null)
    reset()
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setValues({ ...item, affectedPopulation: String(item.affectedPopulation) })
    setModalOpen(true)
  }

  const toggleResource = (res) => {
    setValues((prev) => ({
      ...prev,
      requiredResources: prev.requiredResources.includes(res)
        ? prev.requiredResources.filter((r) => r !== res)
        : [...prev.requiredResources, res],
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { ...values, affectedPopulation: Number(values.affectedPopulation) }
      if (editingId) {
        await disasterApi.updateDisaster(editingId, payload)
        notifySuccess('Disaster updated')
      } else {
        await disasterApi.createDisaster(payload)
        notifySuccess('Disaster logged')
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
      await disasterApi.deleteDisaster(deletingItem.id)
      notifySuccess('Disaster record removed')
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
          <h1 className="font-display text-xl font-semibold">Disaster Map</h1>
          <p className="text-sm text-ink-500 mt-1">Every tracked incident, its severity, and where it stands.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Log Disaster</Button>
      </div>

      <Card>
        <Filters>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or location..." className="w-64" />
          <Dropdown value={status} onChange={setStatus} options={Object.values(DISASTER_STATUS)} placeholder="All statuses" />
          <Dropdown value={priority} onChange={setPriority} options={Object.values(PRIORITY)} placeholder="All priorities" />
        </Filters>

        {error ? (
          <ErrorComponent message={error} onRetry={load} />
        ) : loading ? (
          <Loader label="Loading disaster records..." />
        ) : items.length === 0 ? (
          <EmptyState message="No disasters match your filters" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((d) => (
              <div key={d.id} className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] relative overflow-hidden">
                {d.status === 'Active' && (
                  <span className="absolute -top-1 -right-1 h-16 w-16">
                    <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-signal-critical" />
                    <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-signal-critical animate-pulseRing" />
                  </span>
                )}
                <div className="flex items-start justify-between mb-2 pr-6">
                  <div>
                    <p className="font-medium text-ink-100">{d.name}</p>
                    <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {d.location}
                    </p>
                  </div>
                  <StatusBadge status={d.priority} />
                </div>
                <p className="text-xs text-ink-500 mb-3 line-clamp-2">{d.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-ink-500 font-mono">
                    <Users2 size={12} /> {d.affectedPopulation.toLocaleString()} affected
                  </span>
                  <StatusBadge status={d.status} />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {d.requiredResources?.map((r) => (
                    <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-ink-500 font-mono">{r}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                  <span className="text-[10px] text-ink-700 font-mono">Since {formatDate(d.startedAt)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(d)} aria-label="Edit" />
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeletingItem(d)} className="hover:text-signal-critical" aria-label="Delete" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Disaster' : 'Log New Disaster'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingId ? 'Save Changes' : 'Log Disaster'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Disaster name" value={values.name} onChange={handleChange('name')} error={errors.name} />
            <Input label="Type (e.g. Flood, Wildfire)" value={values.type} onChange={handleChange('type')} error={errors.type} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Status</label>
              <select value={values.status} onChange={(e) => handleChange('status')(e.target.value)} className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100">
                {Object.values(DISASTER_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Priority</label>
              <select value={values.priority} onChange={(e) => handleChange('priority')(e.target.value)} className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100">
                {Object.values(PRIORITY).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Input label="Affected population" type="number" value={values.affectedPopulation} onChange={handleChange('affectedPopulation')} error={errors.affectedPopulation} />
          </div>
          <Input label="Location" value={values.location} onChange={handleChange('location')} error={errors.location} />
          <Input label="Description" textarea value={values.description} onChange={handleChange('description')} error={errors.description} />
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1.5">Required resource categories</label>
            <div className="flex flex-wrap gap-1.5">
              {RESOURCE_CATEGORIES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => toggleResource(r)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                    values.requiredResources.includes(r)
                      ? 'bg-signal-info/15 border-signal-info/40 text-signal-info'
                      : 'border-white/10 text-ink-500 hover:text-ink-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Delete Disaster Record"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeletingItem(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-ink-300">
          Remove <span className="text-ink-100 font-medium">{deletingItem?.name}</span> from tracked disasters? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
