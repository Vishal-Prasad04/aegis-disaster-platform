import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Truck, MapPin, UserRound } from 'lucide-react'
import * as teamApi from '../api/teamApi'
import * as disasterApi from '../api/disasterApi'
import { useUI } from '../context/UIContext'
import { useForm } from '../hooks/useForm'
import { required, isPositiveNumber } from '../utils/validators'
import { TEAM_STATUS } from '../constants'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import StatusBadge from '../components/common/StatusBadge'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import ErrorComponent from '../components/common/ErrorComponent'
import Filters from '../components/common/Filters'
import Dropdown from '../components/common/Dropdown'

export default function RescueTeams() {
  const { notifySuccess, notifyError } = useUI()
  const [items, setItems] = useState([])
  const [disasters, setDisasters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [saving, setSaving] = useState(false)

  const { values, errors, handleChange, validate, reset, setValues } = useForm(
    { name: '', members: '', vehicle: '', status: TEAM_STATUS.STANDBY, assignment: '', currentLocation: '', leader: '' },
    { name: [required], members: [required, isPositiveNumber], vehicle: [required], currentLocation: [required], leader: [required] },
  )

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [teamsRes, disastersRes] = await Promise.all([
        teamApi.getTeams(statusFilter ? { status: statusFilter } : {}),
        disasterApi.getDisasters(),
      ])
      setItems(teamsRes.data.items)
      setDisasters(disastersRes.data.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const openCreate = () => { setEditingId(null); reset(); setModalOpen(true) }
  const openEdit = (item) => {
    setEditingId(item.id)
    setValues({ ...item, members: String(item.members), assignment: item.assignment || '' })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { ...values, members: Number(values.members), assignment: values.assignment || null }
      if (editingId) {
        await teamApi.updateTeam(editingId, payload)
        notifySuccess('Team updated')
      } else {
        await teamApi.createTeam(payload)
        notifySuccess('Team registered')
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
      await teamApi.deleteTeam(deletingItem.id)
      notifySuccess('Team removed')
      setDeletingItem(null)
      load()
    } catch (err) {
      notifyError(err.message)
    }
  }

  const disasterName = (id) => disasters.find((d) => d.id === id)?.name

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold">Rescue Teams</h1>
          <p className="text-sm text-ink-500 mt-1">Field units, their vehicles, and current deployment status.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Register Team</Button>
      </div>

      <Card>
        <Filters>
          <Dropdown value={statusFilter} onChange={setStatusFilter} options={Object.values(TEAM_STATUS)} placeholder="All statuses" />
        </Filters>

        {error ? (
          <ErrorComponent message={error} onRetry={load} />
        ) : loading ? (
          <Loader label="Loading rescue teams..." />
        ) : items.length === 0 ? (
          <EmptyState message="No teams match this filter" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((t) => (
              <div key={t.id} className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-ink-100">{t.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5">Leader: {t.leader}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div className="space-y-1.5 text-xs text-ink-500">
                  <p className="flex items-center gap-1.5"><UserRound size={12} /> {t.members} members</p>
                  <p className="flex items-center gap-1.5"><Truck size={12} /> {t.vehicle}</p>
                  <p className="flex items-center gap-1.5"><MapPin size={12} /> {t.currentLocation}</p>
                </div>
                {t.assignment && (
                  <div className="mt-3 pt-3 border-t border-white/[0.05] text-xs">
                    <span className="text-ink-500">Assigned to </span>
                    <span className="text-signal-info">{disasterName(t.assignment) || t.assignment}</span>
                  </div>
                )}
                <div className="flex justify-end gap-1 mt-3">
                  <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(t)} aria-label="Edit" />
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeletingItem(t)} className="hover:text-signal-critical" aria-label="Delete" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Team' : 'Register Team'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingId ? 'Save Changes' : 'Register Team'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Team name" value={values.name} onChange={handleChange('name')} error={errors.name} />
            <Input label="Team leader" value={values.leader} onChange={handleChange('leader')} error={errors.leader} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Members" type="number" value={values.members} onChange={handleChange('members')} error={errors.members} />
            <Input label="Vehicle" value={values.vehicle} onChange={handleChange('vehicle')} error={errors.vehicle} />
          </div>
          <Input label="Current location" value={values.currentLocation} onChange={handleChange('currentLocation')} error={errors.currentLocation} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Status</label>
              <select value={values.status} onChange={(e) => handleChange('status')(e.target.value)} className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100">
                {Object.values(TEAM_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Assigned disaster</label>
              <select value={values.assignment} onChange={(e) => handleChange('assignment')(e.target.value)} className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100">
                <option value="">Unassigned</option>
                {disasters.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Remove Team"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeletingItem(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-ink-300">Remove <span className="text-ink-100 font-medium">{deletingItem?.name}</span> from the roster? This cannot be undone.</p>
      </Modal>
    </div>
  )
}
