import { useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Shield, LogIn, AlertCircle, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useForm } from '../hooks/useForm'
import { required, isEmail } from '../utils/validators'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@aegis.gov', password: 'admin123' },
  { role: 'Coordinator', email: 'coordinator@aegis.gov', password: 'coord123' },
  { role: 'Field Officer', email: 'field@aegis.gov', password: 'field123' },
  { role: 'Volunteer', email: 'volunteer@aegis.gov', password: 'vol123' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('sessionExpired') === '1'
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const { values, errors, handleChange, validate, setValues } = useForm(
    { email: '', password: '' },
    { email: [required, isEmail], password: [required] },
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return
    setSubmitting(true)
    const result = await login(values.email, values.password)
    setSubmitting(false)
    if (result.success) {
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } else {
      setFormError(result.message)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-signal-info/15 flex items-center justify-center mb-3">
          <Shield size={22} className="text-signal-info" />
        </div>
        <h1 className="font-display text-xl font-semibold">Aegis Command</h1>
        <p className="text-sm text-ink-500 mt-1">Disaster Resource Allocation Platform</p>
      </div>

      <form onSubmit={handleSubmit} className="panel p-6 space-y-4">
        {sessionExpired && !formError && (
          <div className="flex items-center gap-2 text-sm text-signal-warning bg-signal-warning/10 border border-signal-warning/20 rounded-lg px-3 py-2">
            <Clock size={15} />
            Your session expired. Please sign in again.
          </div>
        )}
        <Input
          label="Email address"
          type="email"
          placeholder="you@aegis.gov"
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange('password')}
          error={errors.password}
        />

        {formError && (
          <div className="flex items-center gap-2 text-sm text-signal-critical bg-signal-critical/10 border border-signal-critical/20 rounded-lg px-3 py-2">
            <AlertCircle size={15} />
            {formError}
          </div>
        )}

        <Button type="submit" icon={LogIn} loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="panel p-4 mt-4">
        <p className="text-xs font-medium text-ink-500 mb-2 font-mono">DEMO ACCOUNTS (password matches role, e.g. admin123)</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => {
                setValues({ email: acc.email, password: acc.password })
              }}
              className="text-left px-2.5 py-2 rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-xs"
            >
              <p className="text-ink-100 font-medium">{acc.role}</p>
              <p className="text-ink-500 font-mono truncate">{acc.email}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
