import { useState } from 'react'
import { Save, Phone, MapPin, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { useForm } from '../hooks/useForm'
import { required, isEmail } from '../utils/validators'
import Card, { CardHeader } from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

export default function Profile() {
  const { user } = useAuth()
  const { notifySuccess } = useUI()
  const [saving, setSaving] = useState(false)

  const { values, errors, handleChange, validate } = useForm(
    { name: user?.name || '', email: user?.email || '', phone: user?.phone || '', region: user?.region || '' },
    { name: [required], email: [required, isEmail] },
  )

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    // Placeholder: PUT /users/:id — will persist against the real backend later.
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)
    notifySuccess('Profile updated')
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold">Profile</h1>
        <p className="text-sm text-ink-500 mt-1">Your account details and role within the platform.</p>
      </div>

      <Card className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-signal-info/15 text-signal-info flex items-center justify-center text-xl font-semibold font-mono">
          {user?.avatar}
        </div>
        <div>
          <p className="font-display text-lg font-semibold">{user?.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border border-signal-info/30 bg-signal-info/15 text-signal-info">
              <ShieldCheck size={12} /> {user?.role}
            </span>
            <span className="text-xs text-ink-500 flex items-center gap-1"><MapPin size={11} /> {user?.region}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Contact Details" subtitle="Used for coordination and emergency dispatch" />
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Full name" value={values.name} onChange={handleChange('name')} error={errors.name} />
          <Input label="Email address" type="email" value={values.email} onChange={handleChange('email')} error={errors.email} />
          <Input label="Phone number" value={values.phone} onChange={handleChange('phone')} error={errors.phone} />
          <Input label="Region / Assignment" value={values.region} onChange={handleChange('region')} error={errors.region} />
          <div className="flex justify-end">
            <Button type="submit" icon={Save} loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
