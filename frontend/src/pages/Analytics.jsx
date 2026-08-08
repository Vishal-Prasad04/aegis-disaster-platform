import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import * as analyticsApi from '../api/analyticsApi'
import Card, { CardHeader } from '../components/common/Card'
import Loader from '../components/common/Loader'
import ErrorComponent from '../components/common/ErrorComponent'

const tooltipStyle = { background: '#121B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }
const axisProps = { stroke: '#4B5A74', fontSize: 11, tickLine: false, axisLine: false }

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [rt, usage, occ, perf, trend] = await Promise.all([
        analyticsApi.getResponseTimeTrend(),
        analyticsApi.getResourceUsage(),
        analyticsApi.getShelterOccupancyTrend(),
        analyticsApi.getTeamPerformance(),
        analyticsApi.getDisasterTrends(),
      ])
      setData({
        responseTime: rt.data.trend,
        usage: usage.data.usage,
        occupancy: occ.data.trend,
        performance: perf.data.performance,
        trend: trend.data.trend,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <Loader label="Crunching analytics..." />
  if (error) return <Card><ErrorComponent message={error} onRetry={load} /></Card>

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-ink-500 mt-1">Operational performance across response, resources, and teams.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Response Time" subtitle="Avg minutes to first dispatch" />
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.responseTime}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="minutes" stroke="#3EA6FF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Shelter Occupancy" subtitle="Percent of rated capacity, last 7 days" />
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.occupancy}>
                <defs>
                  <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F2B341" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#F2B341" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} width={32} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="occupancy" stroke="#F2B341" fill="url(#occGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Resource Usage" subtitle="Allocated vs. available by category" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.usage}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="category" {...axisProps} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis {...axisProps} width={32} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="allocated" fill="#3EA6FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Team Performance" subtitle="Tasks completed by unit" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.performance}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="team" {...axisProps} />
                <YAxis {...axisProps} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="tasksCompleted" fill="#FF5A36" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Disaster Trends" subtitle="Incidents logged per month" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5A36" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#FF5A36" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#FF5A36" fill="url(#trendGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
