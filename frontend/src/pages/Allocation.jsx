import { useEffect, useState } from 'react'
import { Plus, Check, X as XIcon, Clock3 } from 'lucide-react'
import * as allocationApi from '../api/allocationApi'
import * as resourceApi from '../api/resourceApi'
import * as disasterApi from '../api/disasterApi'
import { useUI } from '../context/UIContext'
import { useAuth } from '../context/AuthContext'
import { useForm } from '../hooks/useForm'
import { required, isPositiveNumber } from '../utils/validators'
import { formatDateTime } from '../utils/helpers'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import StatusBadge from '../components/common/StatusBadge'
import Table from '../components/common/Table'
import ErrorComponent from '../components/common/ErrorComponent'

const TABS = [
  { key: 'pending', label: 'Pending Requests', statuses: ['Pending', 'Approved', 'In Progress'] },
  { key: 'history', label: 'History', statuses: ['Completed', 'Rejected'] },
]

export default function Allocation() {
  const { notifySuccess, notifyError } = useUI()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [resources, setResources] = useState([])
  const [disasters, setDisasters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('pending')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const { values, errors, handleChange, validate, reset } = useForm(
    { resourceId: '', disasterId: '', quantity: '' },
    { resourceId: [required], disasterId: [required], quantity: [required, isPositiveNumber] },
  )

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [allocRes, resRes, disRes] = await Promise.all([
        allocationApi.getAllocations(),
        resourceApi.getResources(),
        disasterApi.getDisasters(),
      ])
      setItems(allocRes.data.items)
      setResources(resRes.data.items)
      setDisasters(disRes.data.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const resource = resources.find((r) => r.id === values.resourceId)
      const disaster = disasters.find((d) => d.id === values.disasterId)
      await allocationApi.assignResource({
        resourceId: values.resourceId,
        resourceName: resource?.name,
        disasterId: values.disasterId,
        disasterName: disaster?.name,
        quantity: Number(values.quantity),
        requestedBy: user?.name,
      })
      notifySuccess('Allocation request submitted')
      setModalOpen(false)
      reset()
      load()
    } catch (err) {
      notifyError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await allocationApi.updateAllocationStatus(id, status)
      notifySuccess(`Marked as ${status}`)
      load()
    } catch (err) {
      notifyError(err.message)
    }
  }

  const activeTab = TABS.find((t) => t.key === tab)
  const filtered = items.filter((a) => activeTab.statuses.includes(a.status))

  const columns = [
    { key: 'resourceName', header: 'Resource', render: (r) => <span className="text-ink-100 font-medium">{r.resourceName}</span> },
    { key: 'disasterName', header: 'Disaster' },
    { key: 'quantity', header: 'Qty', render: (r) => <span className="font-mono">{r.quantity.toLocaleString()}</span> },
    { key: 'requestedBy', header: 'Requested By' },
    { key: 'requestedAt', header: 'Requested', render: (r) => <span className="font-mono text-xs">{formatDateTime(r.requestedAt)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(tab === 'pending'
      ? [{
          key: 'actions',
          header: '',
          className: 'text-right',
          render: (r) => (
            <div className="flex justify-end gap-1">
              {r.status === 'Pending' && (
                <Button variant="ghost" size="sm" icon={Check} onClick={() => updateStatus(r.id, 'Approved')} className="hover:text-signal-safe" aria-label="Approve" />
              )}
              {r.status === 'Approved' && (
                <Button variant="ghost" size="sm" icon={Clock3} onClick={() => updateStatus(r.id, 'In Progress')} className="hover:text-signal-info" aria-label="Start" />
              )}
              {r.status === 'In Progress' && (
                <Button variant="ghost" size="sm" icon={Check} onClick={() => updateStatus(r.id, 'Completed')} className="hover:text-signal-safe" aria-label="Complete" />
              )}
              <Button variant="ghost" size="sm" icon={XIcon} onClick={() => updateStatus(r.id, 'Rejected')} className="hover:text-signal-critical" aria-label="Reject" />
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold">Allocation</h1>
          <p className="text-sm text-ink-500 mt-1">Assign resources to active disasters and track requests to completion.</p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>Assign Resource</Button>
      </div>

      <Card>
        <div className="flex gap-1 mb-4 border-b border-white/[0.06]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key ? 'border-signal-info text-signal-info' : 'border-transparent text-ink-500 hover:text-ink-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error ? (
          <ErrorComponent message={error} onRetry={load} />
        ) : (
          <Table columns={columns} rows={filtered} loading={loading} emptyMessage={`No ${activeTab.label.toLowerCase()}`} />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Assign Resource"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} loading={saving}>Submit Request</Button>
          </>
        }
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1.5">Resource</label>
            <select value={values.resourceId} onChange={(e) => handleChange('resourceId')(e.target.value)} className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100">
              <option value="">Select a resource</option>
              {resources.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.quantity} {r.unit} available)</option>)}
            </select>
            {errors.resourceId && <p className="text-xs text-signal-critical mt-1">{errors.resourceId}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1.5">Disaster</label>
            <select value={values.disasterId} onChange={(e) => handleChange('disasterId')(e.target.value)} className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100">
              <option value="">Select a disaster</option>
              {disasters.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {errors.disasterId && <p className="text-xs text-signal-critical mt-1">{errors.disasterId}</p>}
          </div>
          <Input label="Quantity to allocate" type="number" value={values.quantity} onChange={handleChange('quantity')} error={errors.quantity} />
        </form>
      </Modal>
    </div>
  )
}
