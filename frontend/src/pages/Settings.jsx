import { useState } from 'react'
import { Bell, Moon, Globe, Users, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { ROLE_LIST } from '../constants'
import Card, { CardHeader } from '../components/common/Card'
import Button from '../components/common/Button'
import Dropdown from '../components/common/Dropdown'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-signal-info' : 'bg-white/10'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0">
      <div className="flex items-start gap-3">
        <Icon size={16} className="text-ink-500 mt-0.5" />
        <div>
          <p className="text-sm text-ink-100">{title}</p>
          <p className="text-xs text-ink-500 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, hasRole } = useAuth()
  const { notifySuccess } = useUI()
  const [criticalAlerts, setCriticalAlerts] = useState(true)
  const [dailyDigest, setDailyDigest] = useState(false)
  const [language, setLanguage] = useState('English')
  const [demoRole, setDemoRole] = useState(user?.role || '')

  const handleSave = () => notifySuccess('Preferences saved')

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold">Settings</h1>
        <p className="text-sm text-ink-500 mt-1">Notification and platform preferences.</p>
      </div>

      <Card>
        <CardHeader title="Notifications" />
        <SettingRow icon={Bell} title="Critical alerts" description="Get notified immediately for Critical priority alerts">
          <Toggle checked={criticalAlerts} onChange={setCriticalAlerts} />
        </SettingRow>
        <SettingRow icon={Bell} title="Daily digest" description="A daily summary of allocations, alerts, and shelter status">
          <Toggle checked={dailyDigest} onChange={setDailyDigest} />
        </SettingRow>
      </Card>

      <Card>
        <CardHeader title="Preferences" />
        <SettingRow icon={Globe} title="Language" description="Interface display language">
          <Dropdown value={language} onChange={setLanguage} options={['English', 'Hindi']} className="w-32" />
        </SettingRow>
        <SettingRow icon={Moon} title="Theme" description="Aegis currently ships as a dark command interface only">
          <span className="text-xs text-ink-500 font-mono">Dark (default)</span>
        </SettingRow>
      </Card>

      {hasRole('Admin') && (
        <Card>
          <CardHeader title="Role Management" subtitle="Admin only — preview of role assignment, backend-ready" />
          <SettingRow icon={Users} title="Your role" description="Changing this is illustrative only until the backend is connected">
            <Dropdown value={demoRole} onChange={setDemoRole} options={ROLE_LIST} className="w-40" />
          </SettingRow>
        </Card>
      )}

      <div className="flex justify-end">
        <Button icon={Save} onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  )
}
