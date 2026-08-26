import { create } from 'zustand';

export type ProviderStatus = 'pending' | 'verified' | 'rejected' | 'suspended' | 'action_required';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type ProviderType = 'Doctor' | 'Hospital' | 'Lab' | 'Pharmacy' | 'Ambulance' | 'Blood Partner' | 'Physiotherapy' | 'Home Healthcare' | 'Medical Equipment';

export interface AdminProvider {
  id: string;
  name: string;
  type: ProviderType;
  location: string;
  registrationId: string;
  status: ProviderStatus;
  submittedDate: string;
  lastActive: string;
  email: string;
  phone: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  registrationDate: string;
  lastActive: string;
  status: UserStatus;
}

export interface SystemActivity {
  id: string;
  time: string;
  user: string;
  action: string;
  category: 'Security' | 'Provider' | 'User' | 'System' | 'Inventory';
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface SecurityAlert {
  id: string;
  time: string;
  title: string;
  description: string;
  status: 'active' | 'resolved';
  severity: 'high' | 'medium' | 'low';
}

export interface ComplaintReport {
  id: string;
  reporter: string;
  entity: string;
  category: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  status: 'New' | 'Under Review' | 'Resolved' | 'Closed';
}

interface AdminState {
  providers: AdminProvider[];
  users: AdminUser[];
  activities: SystemActivity[];
  alerts: SecurityAlert[];
  reports: ComplaintReport[];
  
  // Actions
  updateProviderStatus: (id: string, status: ProviderStatus) => void;
  updateUserStatus: (id: string, status: UserStatus) => void;
  resolveAlert: (id: string) => void;
  updateReportStatus: (id: string, status: ComplaintReport['status']) => void;
  addActivity: (activity: Omit<SystemActivity, 'id' | 'time'>) => void;
}

const mockProviders: AdminProvider[] = [
  { id: 'PRV-101', name: 'CityCare Hospital', type: 'Hospital', location: 'New Delhi', registrationId: 'HSP-10293', status: 'pending', submittedDate: '2026-08-18', lastActive: '2026-08-20', email: 'admin@citycare.in', phone: '+91 9876543210' },
  { id: 'PRV-102', name: 'Dr. Arjun Kapoor', type: 'Doctor', location: 'Mumbai', registrationId: 'MCI-8472', status: 'verified', submittedDate: '2026-07-15', lastActive: '2026-08-21', email: 'arjun.k@doc.in', phone: '+91 9876543211' },
  { id: 'PRV-103', name: 'HealthPlus Diagnostics', type: 'Lab', location: 'Bangalore', registrationId: 'LAB-9921', status: 'action_required', submittedDate: '2026-08-19', lastActive: '2026-08-20', email: 'hello@healthplus.in', phone: '+91 9876543212' },
  { id: 'PRV-104', name: 'MediLife Pharmacy', type: 'Pharmacy', location: 'Chennai', registrationId: 'PHR-1102', status: 'rejected', submittedDate: '2026-08-10', lastActive: '2026-08-11', email: 'medilife@phr.in', phone: '+91 9876543213' },
  { id: 'PRV-105', name: 'QuickRescue Ambulance', type: 'Ambulance', location: 'Hyderabad', registrationId: 'AMB-3341', status: 'verified', submittedDate: '2026-06-20', lastActive: '2026-08-21', email: 'dispatch@quickrescue.in', phone: '+91 9876543214' },
];

const mockUsers: AdminUser[] = [
  { id: 'USR-201', name: 'Rahul Sharma', email: 'rahul.s@email.com', phone: '+91 9123456780', role: 'Patient', registrationDate: '2026-01-10', lastActive: '2026-08-21', status: 'active' },
  { id: 'USR-202', name: 'Sneha Iyer', email: 'sneha.i@email.com', phone: '+91 9123456781', role: 'Patient', registrationDate: '2026-03-22', lastActive: '2026-08-15', status: 'inactive' },
  { id: 'USR-203', name: 'Amit Kumar', email: 'amit.k@email.com', phone: '+91 9123456782', role: 'First Responder', registrationDate: '2026-05-11', lastActive: '2026-08-20', status: 'active' },
  { id: 'USR-204', name: 'Priya Patel', email: 'priya.p@email.com', phone: '+91 9123456783', role: 'Patient', registrationDate: '2026-08-01', lastActive: '2026-08-02', status: 'suspended' },
];

const mockActivities: SystemActivity[] = [
  { id: 'ACT-1', time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: 'Dr. Arjun Kapoor', action: 'Doctor verified successfully', category: 'Provider', status: 'success' },
  { id: 'ACT-2', time: new Date(Date.now() - 1000 * 60 * 25).toISOString(), user: 'System', action: 'High CPU load detected on Auth Node 3', category: 'System', status: 'warning' },
  { id: 'ACT-3', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), user: '192.168.1.45', action: 'Failed login attempt - USR-204', category: 'Security', status: 'error' },
  { id: 'ACT-4', time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), user: 'Rahul Sharma', action: 'Created new appointment APT-9921', category: 'User', status: 'info' },
];

const mockAlerts: SecurityAlert[] = [
  { id: 'ALR-1', time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), title: 'Multiple Failed Logins', description: 'User USR-204 attempted to log in 5 times with incorrect password.', status: 'active', severity: 'high' },
  { id: 'ALR-2', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), title: 'Suspicious Provider Upload', description: 'Provider PRV-104 uploaded a document containing malware signature.', status: 'resolved', severity: 'high' },
  { id: 'ALR-3', time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), title: 'Unusual Account Activity', description: 'Admin account logged in from new location (IP: 45.33.2.11).', status: 'active', severity: 'medium' },
];

const mockReports: ComplaintReport[] = [
  { id: 'REP-101', reporter: 'Rahul Sharma', entity: 'Dr. Arjun Kapoor', category: 'Appointment', date: '2026-08-19', priority: 'medium', status: 'New' },
  { id: 'REP-102', reporter: 'Sneha Iyer', entity: 'MediLife Pharmacy', category: 'Pharmacy', date: '2026-08-18', priority: 'high', status: 'Under Review' },
];

export const useAdminStore = create<AdminState>((set) => ({
  providers: mockProviders,
  users: mockUsers,
  activities: mockActivities,
  alerts: mockAlerts,
  reports: mockReports,

  updateProviderStatus: (id, status) => set((state) => ({
    providers: state.providers.map(p => p.id === id ? { ...p, status } : p),
    activities: [
      {
        id: `ACT-${Date.now()}`,
        time: new Date().toISOString(),
        user: 'Admin',
        action: `Changed provider ${id} status to ${status}`,
        category: 'Provider',
        status: status === 'rejected' ? 'error' : status === 'verified' ? 'success' : 'warning'
      },
      ...state.activities
    ]
  })),

  updateUserStatus: (id, status) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, status } : u),
    activities: [
      {
        id: `ACT-${Date.now()}`,
        time: new Date().toISOString(),
        user: 'Admin',
        action: `Changed user ${id} status to ${status}`,
        category: 'User',
        status: status === 'suspended' ? 'error' : 'success'
      },
      ...state.activities
    ]
  })),

  resolveAlert: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, status: 'resolved' as const } : a),
    activities: [
      {
        id: `ACT-${Date.now()}`,
        time: new Date().toISOString(),
        user: 'Admin',
        action: `Resolved security alert ${id}`,
        category: 'Security',
        status: 'success'
      },
      ...state.activities
    ]
  })),

  updateReportStatus: (id, status) => set((state) => ({
    reports: state.reports.map(r => r.id === id ? { ...r, status } : r)
  })),

  addActivity: (activity) => set((state) => ({
    activities: [{ id: `ACT-${Date.now()}`, time: new Date().toISOString(), ...activity }, ...state.activities]
  }))
}));
