export const ROLES = {
  ADMIN: 'Admin',
  COORDINATOR: 'Coordinator',
  FIELD_OFFICER: 'Field Officer',
  VOLUNTEER: 'Volunteer',
}

export const ROLE_LIST = Object.values(ROLES)

// Roles allowed into /admin/* routes
export const ADMIN_ONLY_ROLES = [ROLES.ADMIN]

export const DISASTER_STATUS = {
  ACTIVE: 'Active',
  MONITORING: 'Monitoring',
  CONTAINED: 'Contained',
  RESOLVED: 'Resolved',
}

export const PRIORITY = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

export const RESOURCE_STATUS = {
  AVAILABLE: 'Available',
  ALLOCATED: 'Allocated',
  IN_TRANSIT: 'In Transit',
  DEPLETED: 'Depleted',
}

export const ALLOCATION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
}

export const TEAM_STATUS = {
  ON_DUTY: 'On Duty',
  DEPLOYED: 'Deployed',
  STANDBY: 'Standby',
  OFF_DUTY: 'Off Duty',
}

export const ALERT_STATUS = {
  OPEN: 'Open',
  ACKNOWLEDGED: 'Acknowledged',
  RESOLVED: 'Resolved',
}

export const RESOURCE_CATEGORIES = [
  'Food',
  'Water',
  'Medical',
  'Shelter Material',
  'Vehicles',
  'Equipment',
  'Clothing',
]

export const PAGE_SIZE = 8

export const STATUS_COLOR_MAP = {
  // Priority / severity
  Critical: 'critical',
  High: 'warning',
  Medium: 'info',
  Low: 'safe',
  // Disaster
  Active: 'critical',
  Monitoring: 'warning',
  Contained: 'info',
  Resolved: 'safe',
  // Resource
  Available: 'safe',
  Allocated: 'info',
  'In Transit': 'warning',
  Depleted: 'critical',
  // Allocation
  Pending: 'warning',
  Approved: 'info',
  'In Progress': 'info',
  Completed: 'safe',
  Rejected: 'critical',
  // Team
  'On Duty': 'safe',
  Deployed: 'info',
  Standby: 'warning',
  'Off Duty': 'critical',
  // Alert
  Open: 'critical',
  Acknowledged: 'warning',
  Resolved: 'safe',
}
