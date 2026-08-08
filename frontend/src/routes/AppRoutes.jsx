import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import PrivateRoute from './PrivateRoute'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import DisasterMap from '../pages/DisasterMap'
import Resources from '../pages/Resources'
import Shelters from '../pages/Shelters'
import Allocation from '../pages/Allocation'
import RescueTeams from '../pages/RescueTeams'
import Alerts from '../pages/Alerts'
import Analytics from '../pages/Analytics'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'
import NotFound from '../pages/NotFound'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Private routes */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/disaster-map" element={<DisasterMap />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/shelters" element={<Shelters />} />
        <Route path="/allocation" element={<Allocation />} />
        <Route path="/rescue-teams" element={<RescueTeams />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
