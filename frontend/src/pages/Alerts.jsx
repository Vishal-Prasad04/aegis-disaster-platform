import { useEffect, useState } from 'react'
import { Plus, BellRing, Check, CheckCheck } from 'lucide-react'
import * as alertApi from '../api/alertApi'
import * as disasterApi from '../api/disasterApi'
import { useUI } from '../context/UIContext'
import { useForm } from '../hooks/useForm'
import { required } from '../utils/validators'
import { PRIORITY, ALERT_STATUS } from '../constants'
import { formatDateTime, timeAgo } from '../utils/helpers'
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

export default function Alerts() {
  const { notifySuccess, notifyError } = useUI()
  const [items, setItems] = useState([])
  const [disasters, setDisasters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const { values, errors, handleChange, validate, reset } = useForm(
    { title: '', priority: PRIORITY.MEDIUM, disasterId: '', description: '' },
    { title: [required], description: [required] },
  )

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [alertsRes, disastersRes] = await Promise.all([
        alertApi.getAlerts({ status, priority }),
        disasterApi.getDisasters(),
      ])
      setItems(alertsRes.data.items)
      setDisasters(disastersRes.data.items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [status, priority])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await alertApi.createAlert(values)
      notifySuccess('Alert raised')
      setModalOpen(false)
      reset()
      load()
    } catch (err) {
      notifyError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const advanceStatus = async (alert) => {
    const next = alert.status === 'Open' ? 'Acknowledged' : 'Resolved'
    try {
      await alertApi.updateAlertStatus(alert.id, next)
      notifySuccess(`Alert marked ${next}`)
      load()
    } catch (err) {
      notifyError(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold">Alerts</h1>
          <p className="text-sm text-ink-500 mt-1">Live feed of operational alerts across all incidents.</p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>Raise Alert</Button>
      </div>

      <Card>
        <Filters>
          <Dropdown value={priority} onChange={setPriority} options={Object.values(PRIORITY)} placeholder="All priorities" />
          <Dropdown value={status} onChange={setStatus} options={Object.values(ALERT_STATUS)} placeholder="All statuses" />
        </Filters>

        {error ? (
          <ErrorComponent message={error} onRetry={load} />
        ) : loading ? (
          <Loader label="Loading alerts..." />
        ) : items.length === 0 ? (
          <EmptyState message="No alerts match your filters" icon={BellRing} />
        ) : (
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3.5 rounded-lg border border-white/[0.05] hover:bg-white/[0.02]">
                <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
                  <BellRing size={14} className="text-ink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-ink-100 font-medium">{a.title}</p>
                    <StatusBadge status={a.priority} />
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs text-ink-500 mt-1">{a.description}</p>
                  <p className="text-[11px] text-ink-700 font-mono mt-1">{timeAgo(a.createdAt)} · {formatDateTime(a.createdAt)}</p>
                </div>
                {a.status !== 'Resolved' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={a.status === 'Open' ? Check : CheckCheck}
                    onClick={() => advanceStatus(a)}
                    className="shrink-0"
                  >
                    {a.status === 'Open' ? 'Acknowledge' : 'Resolve'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Raise Alert"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Raise Alert</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Alert title" value={values.title} onChange={handleChange('title')} error={errors.title} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Priority</label>
              <select value={values.priority} onChange={(e) => handleChange('priority')(e.target.value)} className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100">
                {Object.values(PRIORITY).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Related disaster</label>
              <select value={values.disasterId} onChange={(e) => handleChange('disasterId')(e.target.value)} className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100">
                <option value="">None</option>
                {disasters.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <Input label="Description" textarea value={values.description} onChange={handleChange('description')} error={errors.description} />
        </form>
      </Modal>
    </div>
  )
}
