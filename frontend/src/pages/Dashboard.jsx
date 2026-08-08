import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Boxes, Home, Users, BellRing, ArrowRight, Plus } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Card, { CardHeader } from '../components/common/Card'
import StatusBadge from '../components/common/StatusBadge'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import { timeAgo, percentage } from '../utils/helpers'
import analytics from '../mock/analytics.json'

function StatCard({ icon: Icon, label, value, sub, tone = 'info' }) {
  const tones = {
    info: 'text-signal-info bg-signal-info/10',
    critical: 'text-signal-critical bg-signal-critical/10',
    safe: 'text-signal-safe bg-signal-safe/10',
    warning: 'text-signal-warning bg-signal-warning/10',
  }
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-xs text-ink-500 mb-1.5">{label}</p>
        <p className="font-display text-2xl font-semibold text-ink-100">{value}</p>
        {sub && <p className="text-xs text-ink-500 mt-1">{sub}</p>}
      </div>
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        <Icon size={17} />
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { disasters, resources, shelters, alerts, loading, fetchAll } = useData()

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isLoading = loading.disasters || loading.resources || loading.shelters || loading.alerts

  const activeDisasters = disasters.filter((d) => d.status === 'Active').length
  const availableResources = resources.filter((r) => r.status === 'Available').length
  const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0)
  const totalOccupancy = shelters.reduce((sum, s) => sum + s.occupancy, 0)
  const openAlerts = alerts.filter((a) => a.status !== 'Resolved')

  if (isLoading) return <Loader label="Loading command dashboard..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-ink-500 mt-1">Here's the current operational picture across all active zones.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Plus} onClick={() => navigate('/disaster-map')}>
            View Map
          </Button>
          <Button icon={Plus} onClick={() => navigate('/allocation')}>
            New Allocation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BellRing} label="Active Disasters" value={activeDisasters} sub={`${disasters.length} total tracked`} tone="critical" />
        <StatCard icon={Boxes} label="Available Resources" value={availableResources} sub={`${resources.length} inventory lines`} tone="safe" />
        <StatCard
          icon={Home}
          label="Shelter Occupancy"
          value={`${percentage(totalOccupancy, totalCapacity)}%`}
          sub={`${totalOccupancy.toLocaleString()} / ${totalCapacity.toLocaleString()} beds`}
          tone="warning"
        />
        <StatCard icon={Users} label="Open Alerts" value={openAlerts.length} sub={`${alerts.length} raised total`} tone="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Response Time Trend" subtitle="Average minutes to first dispatch, last 7 days" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.responseTimeTrend}>
                <defs>
                  <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3EA6FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3EA6FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#4B5A74" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5A74" fontSize={11} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  contentStyle={{ background: '#121B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#E7ECF3' }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#3EA6FF" fill="url(#respGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Alerts" action={<Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/alerts')}>All</Button>} />
          <div className="space-y-3">
            {openAlerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.05] last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm text-ink-100 truncate">{alert.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5 font-mono">{timeAgo(alert.createdAt)}</p>
                </div>
                <StatusBadge status={alert.priority} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Resource Summary by Category" subtitle="Allocated vs. available units" />
          <div className="space-y-3">
            {analytics.resourceUsageByCategory.map((r) => (
              <div key={r.category}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-300">{r.category}</span>
                  <span className="text-ink-500 font-mono">{r.allocated} allocated / {r.available} available</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-signal-info rounded-full"
                    style={{ width: `${percentage(r.allocated, r.allocated + r.available)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Disaster Status" subtitle="Current tracked incidents" />
          <div className="space-y-2.5">
            {disasters.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="text-ink-100 truncate">{d.name}</p>
                  <p className="text-xs text-ink-500">{d.location}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
