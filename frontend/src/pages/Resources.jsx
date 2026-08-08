import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Boxes } from 'lucide-react'
import * as resourceApi from '../api/resourceApi'
import { useUI } from '../context/UIContext'
import { useDebounce } from '../hooks/useDebounce'
import { usePagination } from '../hooks/usePagination'
import { useForm } from '../hooks/useForm'
import { required, isPositiveNumber } from '../utils/validators'
import { RESOURCE_CATEGORIES } from '../constants'
import { sortByKey, formatDateTime } from '../utils/helpers'
import Card from '../components/common/Card'
import SearchBar from '../components/common/SearchBar'
import Dropdown from '../components/common/Dropdown'
import Filters from '../components/common/Filters'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import StatusBadge from '../components/common/StatusBadge'
import ErrorComponent from '../components/common/ErrorComponent'

const STATUS_OPTIONS = ['Available', 'Allocated', 'In Transit', 'Depleted']

export default function Resources() {
  const { notifySuccess, notifyError } = useUI()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [saving, setSaving] = useState(false)

  const { values, errors, handleChange, validate, reset, setValues } = useForm(
    { name: '', category: RESOURCE_CATEGORIES[0], quantity: '', unit: '', status: 'Available', warehouse: '' },
    {
      name: [required],
      category: [required],
      quantity: [required, isPositiveNumber],
      unit: [required],
      warehouse: [required],
    },
  )

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await resourceApi.getResources({ search: debouncedSearch, category, status })
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
  }, [debouncedSearch, category, status])

  const sorted = sortByKey(items, sortKey, sortDir)
  const { page, totalPages, pageItems, goTo, next, prev } = usePagination(sorted)

  const handleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const openCreate = () => {
    setEditingId(null)
    reset()
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setValues({ ...item, quantity: String(item.quantity) })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { ...values, quantity: Number(values.quantity) }
      if (editingId) {
        await resourceApi.updateResource(editingId, payload)
        notifySuccess('Resource updated')
      } else {
        await resourceApi.createResource(payload)
        notifySuccess('Resource created')
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
      await resourceApi.deleteResource(deletingItem.id)
      notifySuccess('Resource deleted')
      setDeletingItem(null)
      load()
    } catch (err) {
      notifyError(err.message)
    }
  }

  const columns = [
    { key: 'name', header: 'Resource', sortable: true, render: (r) => <span className="text-ink-100 font-medium">{r.name}</span> },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'quantity', header: 'Quantity', sortable: true, render: (r) => <span className="font-mono">{r.quantity.toLocaleString()} {r.unit}</span> },
    { key: 'warehouse', header: 'Warehouse', sortable: false },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'updatedAt', header: 'Updated', sortable: true, render: (r) => <span className="font-mono text-xs">{formatDateTime(r.updatedAt)}</span> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(r)} aria-label="Edit" />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeletingItem(r)} aria-label="Delete" className="hover:text-signal-critical" />
        </div>
      ),
      className: 'text-right',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold">Resources</h1>
          <p className="text-sm text-ink-500 mt-1">Track inventory across every warehouse and relief depot.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Resource</Button>
      </div>

      <Card>
        <Filters>
          <SearchBar value={search} onChange={setSearch} placeholder="Search resources..." className="w-64" />
          <Dropdown value={category} onChange={setCategory} options={RESOURCE_CATEGORIES} placeholder="All categories" />
          <Dropdown value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="All statuses" />
        </Filters>

        {error ? (
          <ErrorComponent message={error} onRetry={load} />
        ) : (
          <>
            <Table
              columns={columns}
              rows={pageItems}
              loading={loading}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              emptyMessage="No resources match your filters"
            />
            <Pagination page={page} totalPages={totalPages} onPrev={prev} onNext={next} onGoTo={goTo} />
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Resource' : 'Add Resource'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingId ? 'Save Changes' : 'Create Resource'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Resource name" value={values.name} onChange={handleChange('name')} error={errors.name} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Category</label>
              <select
                value={values.category}
                onChange={(e) => handleChange('category')(e.target.value)}
                className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100"
              >
                {RESOURCE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1.5">Status</label>
              <select
                value={values.status}
                onChange={(e) => handleChange('status')(e.target.value)}
                className="w-full bg-base-800 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-ink-100"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" value={values.quantity} onChange={handleChange('quantity')} error={errors.quantity} />
            <Input label="Unit (e.g. kits, cans)" value={values.unit} onChange={handleChange('unit')} error={errors.unit} />
          </div>
          <Input label="Warehouse / Depot" value={values.warehouse} onChange={handleChange('warehouse')} error={errors.warehouse} />
        </form>
      </Modal>

      <Modal
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Delete Resource"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeletingItem(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-signal-critical/10 flex items-center justify-center shrink-0">
            <Boxes size={16} className="text-signal-critical" />
          </div>
          <p className="text-sm text-ink-300">
            Remove <span className="text-ink-100 font-medium">{deletingItem?.name}</span> from inventory? This cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}
