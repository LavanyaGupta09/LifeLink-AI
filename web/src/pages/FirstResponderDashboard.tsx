import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   FIRST RESPONDER COMMAND CENTER — Full Interactive Dashboard
   ═══════════════════════════════════════════════════════════════ */

/* ── Types ── */
interface Incident {
  id: string; title: string; location: string; time: string; priority: 'Critical'|'High'|'Medium'|'Low';
  type: 'accident'|'fire'|'medical'|'police'|'other'; status: 'Active'|'Dispatched'|'Resolved';
  description: string; assignedUnits: string[]; reporter: string; lat: number; lng: number;
}

interface Unit {
  id: string; callsign: string; type: 'ambulance'|'fire'|'police'|'bike';
  status: 'Available'|'On Mission'|'Returning'|'Maintenance'; crew: string[];
  location: string; currentIncident?: string;
}

interface Message {
  id: string; from: string; to: string; text: string; time: string;
  type: 'incoming'|'outgoing'|'broadcast'; priority: 'normal'|'urgent';
}

interface Alert {
  id: string; title: string; message: string; time: string; severity: 'critical'|'warning'|'info';
  read: boolean;
}

/* ── Dummy Data ── */
const INCIDENTS: Incident[] = [
  { id: 'INC-001', title: 'Major Accident', location: 'MG Road, Near Metro Station', time: '2 min ago', priority: 'Critical', type: 'accident', status: 'Active', description: 'Multi-vehicle collision involving 3 cars and a bus. Multiple injuries reported. Road blocked both directions.', assignedUnits: ['AMB-01','AMB-03','POL-02','POL-05'], reporter: 'Patrol Unit 12', lat: 28.632, lng: 77.219 },
  { id: 'INC-002', title: 'Fire Reported', location: 'Connaught Place, Block A', time: '8 min ago', priority: 'High', type: 'fire', status: 'Dispatched', description: 'Commercial building fire on 3rd floor. Smoke visible. Building evacuation in progress.', assignedUnits: ['FIR-01','FIR-03','AMB-02'], reporter: 'Civilian Call', lat: 28.633, lng: 77.220 },
  { id: 'INC-003', title: 'Medical Emergency', location: 'AIIMS Gate No. 3', time: '12 min ago', priority: 'Medium', type: 'medical', status: 'Dispatched', description: 'Elderly person collapsed near gate. Conscious but disoriented. Possible cardiac event.', assignedUnits: ['AMB-04'], reporter: 'Security Guard', lat: 28.567, lng: 77.210 },
  { id: 'INC-004', title: 'Theft in Progress', location: 'Karol Bagh Market', time: '15 min ago', priority: 'Medium', type: 'police', status: 'Active', description: 'Armed robbery at jewelry store. 2 suspects, one with firearm. Hostage situation possible.', assignedUnits: ['POL-01','POL-03','POL-07'], reporter: 'Store Owner', lat: 28.652, lng: 77.190 },
  { id: 'INC-005', title: 'Traffic Jam', location: 'Ring Road, Dhaula Kuan', time: '18 min ago', priority: 'Low', type: 'other', status: 'Active', description: 'Heavy congestion due to waterlogging. Signal malfunction at intersection.', assignedUnits: ['POL-08'], reporter: 'Traffic Camera AI', lat: 28.593, lng: 77.165 },
  { id: 'INC-006', title: 'Gas Leak', location: 'Dwarka Sector 12', time: '25 min ago', priority: 'High', type: 'fire', status: 'Dispatched', description: 'LPG pipeline leak in residential complex. Area cordoned. 50+ residents evacuated.', assignedUnits: ['FIR-02','AMB-05'], reporter: 'Resident', lat: 28.592, lng: 77.047 },
  { id: 'INC-007', title: 'Drowning Report', location: 'Yamuna River, ITO Bridge', time: '32 min ago', priority: 'Critical', type: 'medical', status: 'Dispatched', description: 'Person seen jumping into river. Rescue boat deployed. Crowd gathering at bridge.', assignedUnits: ['AMB-06','POL-04'], reporter: 'Bystander', lat: 28.628, lng: 77.248 },
  { id: 'INC-008', title: 'Building Collapse', location: 'Laxmi Nagar, Main Road', time: '45 min ago', priority: 'Critical', type: 'accident', status: 'Active', description: 'Partial collapse of under-construction building. Workers trapped. Heavy machinery needed.', assignedUnits: ['FIR-04','AMB-07','AMB-08','POL-06'], reporter: 'Construction Foreman', lat: 28.631, lng: 77.277 },
  { id: 'INC-009', title: 'Road Accident', location: 'NH-44, Singhu Border', time: '1 hr ago', priority: 'Medium', type: 'accident', status: 'Resolved', description: 'Truck overturned. Driver extracted. Minor injuries. Road partially cleared.', assignedUnits: ['AMB-09'], reporter: 'Highway Patrol', lat: 28.742, lng: 77.155 },
  { id: 'INC-010', title: 'Domestic Dispute', location: 'Rohini Sector 7', time: '1.5 hr ago', priority: 'Low', type: 'police', status: 'Resolved', description: 'Noise complaint. Officers mediated. Situation de-escalated.', assignedUnits: ['POL-09'], reporter: 'Neighbor', lat: 28.725, lng: 77.115 },
  { id: 'INC-011', title: 'Heart Attack', location: 'Saket Metro Station', time: '2 hr ago', priority: 'High', type: 'medical', status: 'Resolved', description: 'Male, 55, chest pain. CPR administered by bystander. Transported to Max Hospital.', assignedUnits: ['AMB-10'], reporter: 'Metro Security', lat: 28.527, lng: 77.214 },
  { id: 'INC-012', title: 'Electrical Fire', location: 'Nehru Place', time: '3 hr ago', priority: 'Medium', type: 'fire', status: 'Resolved', description: 'Small electrical fire in server room. Contained with extinguisher. No injuries.', assignedUnits: ['FIR-05'], reporter: 'Office Manager', lat: 28.548, lng: 77.252 },
];

const UNITS: Unit[] = [
  { id: 'AMB-01', callsign: 'Alpha-1', type: 'ambulance', status: 'On Mission', crew: ['Dr. Priya Sharma','EMT Ravi Kumar'], location: 'MG Road', currentIncident: 'INC-001' },
  { id: 'AMB-02', callsign: 'Alpha-2', type: 'ambulance', status: 'On Mission', crew: ['Dr. Sneha Patel','EMT Ajay Singh'], location: 'Connaught Place', currentIncident: 'INC-002' },
  { id: 'AMB-03', callsign: 'Alpha-3', type: 'ambulance', status: 'On Mission', crew: ['Dr. Amit Das','EMT Neha Gupta'], location: 'MG Road', currentIncident: 'INC-001' },
  { id: 'AMB-04', callsign: 'Alpha-4', type: 'ambulance', status: 'On Mission', crew: ['Dr. Kavita Reddy','EMT Mohit Jha'], location: 'AIIMS', currentIncident: 'INC-003' },
  { id: 'AMB-05', callsign: 'Alpha-5', type: 'ambulance', status: 'On Mission', crew: ['Dr. Rahul Mehra','EMT Suman Pal'], location: 'Dwarka', currentIncident: 'INC-006' },
  { id: 'AMB-06', callsign: 'Alpha-6', type: 'ambulance', status: 'Returning', crew: ['Dr. Ankit Soni','EMT Pooja Verma'], location: 'ITO Bridge' },
  { id: 'AMB-07', callsign: 'Alpha-7', type: 'ambulance', status: 'On Mission', crew: ['Dr. Deepak Roy','EMT Kiran Nair'], location: 'Laxmi Nagar', currentIncident: 'INC-008' },
  { id: 'AMB-08', callsign: 'Alpha-8', type: 'ambulance', status: 'On Mission', crew: ['Dr. Meena Iyer','EMT Rajesh Yadav'], location: 'Laxmi Nagar', currentIncident: 'INC-008' },
  { id: 'AMB-09', callsign: 'Alpha-9', type: 'ambulance', status: 'Available', crew: ['Dr. Vikram Joshi','EMT Aruna Bhat'], location: 'Base Station North' },
  { id: 'AMB-10', callsign: 'Alpha-10', type: 'ambulance', status: 'Available', crew: ['Dr. Shalini Kapoor','EMT Manoj Tiwari'], location: 'Base Station South' },
  { id: 'AMB-11', callsign: 'Alpha-11', type: 'ambulance', status: 'Maintenance', crew: [], location: 'Service Bay' },
  { id: 'AMB-12', callsign: 'Alpha-12', type: 'ambulance', status: 'Available', crew: ['Dr. Tarun Grover','EMT Sapna Das'], location: 'Base Station Central' },
  { id: 'FIR-01', callsign: 'Blaze-1', type: 'fire', status: 'On Mission', crew: ['Capt. Raj Malhotra','FF Sunil','FF Deepa','FF Karan'], location: 'Connaught Place', currentIncident: 'INC-002' },
  { id: 'FIR-02', callsign: 'Blaze-2', type: 'fire', status: 'On Mission', crew: ['Capt. Vikram Gill','FF Mohan','FF Preet','FF Asha'], location: 'Dwarka', currentIncident: 'INC-006' },
  { id: 'FIR-03', callsign: 'Blaze-3', type: 'fire', status: 'On Mission', crew: ['Capt. Arjun Negi','FF Sita','FF Ram','FF Lata'], location: 'Connaught Place', currentIncident: 'INC-002' },
  { id: 'FIR-04', callsign: 'Blaze-4', type: 'fire', status: 'On Mission', crew: ['Capt. Dev Sharma','FF Gopi','FF Maya'], location: 'Laxmi Nagar', currentIncident: 'INC-008' },
  { id: 'FIR-05', callsign: 'Blaze-5', type: 'fire', status: 'Available', crew: ['Capt. Neeraj Bose','FF Tina','FF Raju'], location: 'Fire Station Central' },
  { id: 'FIR-06', callsign: 'Blaze-6', type: 'fire', status: 'Available', crew: ['Capt. Hemant Jha','FF Uma','FF Keshav'], location: 'Fire Station South' },
  { id: 'FIR-07', callsign: 'Blaze-7', type: 'fire', status: 'Maintenance', crew: [], location: 'Service Bay' },
  { id: 'FIR-08', callsign: 'Blaze-8', type: 'fire', status: 'Available', crew: ['Capt. Sanjay Rawat','FF Rekha','FF Vijay'], location: 'Fire Station West' },
  { id: 'POL-01', callsign: 'Shield-1', type: 'police', status: 'On Mission', crew: ['SI Anil Sharma','Const. Rakesh'], location: 'Karol Bagh', currentIncident: 'INC-004' },
  { id: 'POL-02', callsign: 'Shield-2', type: 'police', status: 'On Mission', crew: ['SI Geeta Rani','Const. Mohit'], location: 'MG Road', currentIncident: 'INC-001' },
  { id: 'POL-03', callsign: 'Shield-3', type: 'police', status: 'On Mission', crew: ['SI Pavan Kumar','Const. Sunita'], location: 'Karol Bagh', currentIncident: 'INC-004' },
  { id: 'POL-04', callsign: 'Shield-4', type: 'police', status: 'On Mission', crew: ['SI Manoj Tomar','Const. Pooja'], location: 'ITO Bridge', currentIncident: 'INC-007' },
  { id: 'POL-05', callsign: 'Shield-5', type: 'police', status: 'On Mission', crew: ['SI Ravi Verma','Const. Anita'], location: 'MG Road', currentIncident: 'INC-001' },
  { id: 'POL-06', callsign: 'Shield-6', type: 'police', status: 'On Mission', crew: ['SI Dinesh Pal','Const. Kavita'], location: 'Laxmi Nagar', currentIncident: 'INC-008' },
  { id: 'POL-07', callsign: 'Shield-7', type: 'police', status: 'On Mission', crew: ['SI Kamla Devi','Const. Suresh'], location: 'Karol Bagh', currentIncident: 'INC-004' },
  { id: 'POL-08', callsign: 'Shield-8', type: 'police', status: 'On Mission', crew: ['SI Rajendra Singh','Const. Meena'], location: 'Dhaula Kuan', currentIncident: 'INC-005' },
  { id: 'POL-09', callsign: 'Shield-9', type: 'police', status: 'Available', crew: ['SI Alok Mishra','Const. Priya'], location: 'Police Station Rohini' },
  { id: 'POL-10', callsign: 'Shield-10', type: 'police', status: 'Available', crew: ['SI Neelam Kaur','Const. Dev'], location: 'Police Station South' },
  { id: 'BIK-01', callsign: 'Rapid-1', type: 'bike', status: 'Available', crew: ['Const. Aditya Roy'], location: 'Patrol Zone A' },
  { id: 'BIK-02', callsign: 'Rapid-2', type: 'bike', status: 'On Mission', crew: ['Const. Sanjay Misra'], location: 'NH-48', currentIncident: 'INC-009' },
  { id: 'BIK-03', callsign: 'Rapid-3', type: 'bike', status: 'Available', crew: ['Const. Ritu Panwar'], location: 'Patrol Zone B' },
  { id: 'BIK-04', callsign: 'Rapid-4', type: 'bike', status: 'Available', crew: ['Const. Yash Chauhan'], location: 'Patrol Zone C' },
  { id: 'BIK-05', callsign: 'Rapid-5', type: 'bike', status: 'Available', crew: ['Const. Nidhi Garg'], location: 'Patrol Zone D' },
];

const MESSAGES: Message[] = [
  { id: 'MSG-01', from: 'Unit 12', to: 'Control', text: 'Reached the location. Situation under control. 2 injured transported.', time: '2 min ago', type: 'incoming', priority: 'normal' },
  { id: 'MSG-02', from: 'Control', to: 'All Units', text: 'Avoid MG Road area. Heavy traffic reported. Use alternate routes via Barakhamba Road.', time: '5 min ago', type: 'broadcast', priority: 'urgent' },
  { id: 'MSG-03', from: 'Unit 7', to: 'Control', text: 'Medical assistance needed at CP Block A. Fire victims with smoke inhalation.', time: '10 min ago', type: 'incoming', priority: 'urgent' },
  { id: 'MSG-04', from: 'Control', to: 'Blaze-1', text: 'Additional fire unit dispatched to your location. ETA 4 minutes.', time: '12 min ago', type: 'outgoing', priority: 'normal' },
  { id: 'MSG-05', from: 'Shield-1', to: 'Control', text: 'Suspects cornered at Karol Bagh. Requesting backup and negotiator.', time: '14 min ago', type: 'incoming', priority: 'urgent' },
  { id: 'MSG-06', from: 'Control', to: 'Shield-3', text: 'Proceed to Karol Bagh to support Shield-1. Armed suspect situation.', time: '14 min ago', type: 'outgoing', priority: 'urgent' },
  { id: 'MSG-07', from: 'Alpha-6', to: 'Control', text: 'Drowning victim rescued from Yamuna. Performing CPR. En route to LHMC.', time: '18 min ago', type: 'incoming', priority: 'urgent' },
  { id: 'MSG-08', from: 'Blaze-2', to: 'Control', text: 'Gas leak contained at Dwarka. Residents can return in 30 minutes.', time: '22 min ago', type: 'incoming', priority: 'normal' },
  { id: 'MSG-09', from: 'Control', to: 'All Units', text: 'Weather alert: Heavy rain expected in 2 hours. Prepare for waterlogging situations.', time: '30 min ago', type: 'broadcast', priority: 'normal' },
  { id: 'MSG-10', from: 'Alpha-9', to: 'Control', text: 'Unit back at base. Available for deployment.', time: '35 min ago', type: 'incoming', priority: 'normal' },
];

const ALERTS: Alert[] = [
  { id: 'ALR-01', title: 'CRITICAL: Building Collapse', message: 'Partial building collapse at Laxmi Nagar. Multiple casualties feared. All available units needed.', time: '45 min ago', severity: 'critical', read: false },
  { id: 'ALR-02', title: 'HIGH: Armed Robbery', message: 'Armed suspects at Karol Bagh jewelry store. Possible hostage situation. Armed response authorized.', time: '15 min ago', severity: 'critical', read: false },
  { id: 'ALR-03', title: 'Weather Warning', message: 'IMD issues orange alert for Delhi NCR. Heavy rainfall expected. Flash flood risk in low-lying areas.', time: '1 hr ago', severity: 'warning', read: false },
  { id: 'ALR-04', title: 'Unit Maintenance Required', message: 'AMB-11 and FIR-07 overdue for scheduled maintenance. Take offline immediately.', time: '2 hr ago', severity: 'warning', read: true },
  { id: 'ALR-05', title: 'Shift Change Reminder', message: 'Night shift begins at 22:00. 12 units transitioning. Ensure handover protocols are followed.', time: '3 hr ago', severity: 'info', read: true },
  { id: 'ALR-06', title: 'System Update', message: 'GPS tracking system updated to v4.2. New features: improved indoor positioning, battery optimization.', time: '5 hr ago', severity: 'info', read: true },
  { id: 'ALR-07', title: 'Resource Low: Blood Bank', message: 'O-negative blood stock critically low at AIIMS and Safdarjung. Urgent donor drive needed.', time: '6 hr ago', severity: 'warning', read: true },
];

/* ── Sidebar Nav Items ── */
const NAV = [
  { id: 'overview', label: 'Overview', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id: 'incidents', label: 'Incidents', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
  { id: 'units', label: 'Units', icon: 'M1 3h15v13H1zM16 8h4l3 3v5h-7z' },
  { id: 'map', label: 'Map', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
  { id: 'alerts', label: 'Alerts', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' },
  { id: 'messages', label: 'Messages', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  { id: 'reports', label: 'Reports', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
  { id: 'analytics', label: 'Analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
  { id: 'resources', label: 'Resources', icon: 'M12 2C6.48 2 2 4.02 2 6.5v11C2 19.98 6.48 22 12 22s10-2.02 10-4.5v-11C22 4.02 17.52 2 12 2z' },
  { id: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
];

/* ── Helper: colors ── */
const COLORS = {
  priority: { Critical: { text: '#fca5a5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' }, High: { text: '#fca5a5', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' }, Medium: { text: '#fcd34d', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.15)' }, Low: { text: '#94a3b8', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.15)' } },
  type: { accident: '#ef4444', fire: '#f59e0b', medical: '#22c55e', police: '#3b82f6', other: '#a855f7' },
  status: { Available: '#22c55e', 'On Mission': '#f59e0b', Returning: '#3b82f6', Maintenance: '#64748b', Active: '#ef4444', Dispatched: '#f59e0b', Resolved: '#22c55e' },
  unitType: { ambulance: '#22c55e', fire: '#f59e0b', police: '#3b82f6', bike: '#a855f7' },
};

const typeEmoji = { accident: '🚨', fire: '🔥', medical: '🏥', police: '🔵', other: '🚗' };
const unitEmoji = { ambulance: '🚑', fire: '🚒', police: '🚔', bike: '🏍️' };

/* ════════════════════════════════════════════════════════════════ */
export default function FirstResponderDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const [activeNav, setActiveNav] = useState('overview');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [alertList, setAlertList] = useState(ALERTS);
  const [msgInput, setMsgInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ── Shared Styles ── */
  const glass = { background: 'linear-gradient(135deg, rgba(15,23,42,0.75) 0%, rgba(10,18,35,0.85) 100%)', border: '1px solid rgba(56,97,150,0.2)', borderRadius: 14, backdropFilter: 'blur(16px)' };
  const sectionTitle = { fontSize: 13, fontWeight: 700 as const, letterSpacing: 1, color: '#94a3b8', textTransform: 'uppercase' as const };
  const badge = (color: string, bgA = 0.12) => ({ fontSize: 10, fontWeight: 700 as const, padding: '3px 10px', borderRadius: 6, color, background: color.replace(')', `,${bgA})`).replace('rgb', 'rgba'), border: `1px solid ${color.replace(')', ',0.25)').replace('rgb', 'rgba')}` });

  /* ── Reusable: Status Badge ── */
  const StatusBadge = ({ label, color }: { label: string; color: string }) => (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6, color, background: `${color}18`, border: `1px solid ${color}30`, whiteSpace: 'nowrap' }}>{label}</span>
  );

  /* ── Reusable: Section Header ── */
  const SectionHeader = ({ title, count, action, onAction }: { title: string; count?: number; action?: string; onAction?: () => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
        {title} {count !== undefined && <span style={{ fontSize: 14, color: '#475569', fontWeight: 600 }}>({count})</span>}
      </h2>
      {action && <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', background: 'none', border: 'none', padding: '6px 12px', borderRadius: 8 }}>{action}</button>}
    </div>
  );

  /* ── Table Row Hover ── */
  const rowHover = { cursor: 'pointer', transition: 'background 0.15s' };

  /* ═══════════════════════════════════════════════════════════
     VIEW: OVERVIEW (Dashboard Home)
     ═══════════════════════════════════════════════════════════ */
  const renderOverview = () => {
    const activeIncidents = INCIDENTS.filter(i => i.status !== 'Resolved');
    return (
      <>
        {/* KPI Cards */}
        <div className="fr-kpi-grid">
          {[
            { label: 'Active Incidents', value: String(activeIncidents.length), trend: `▲ 2`, color: '#ef4444' },
            { label: 'Units Deployed', value: String(UNITS.filter(u => u.status === 'On Mission').length), trend: '▲ 4', color: '#f59e0b' },
            { label: 'Responders', value: '96', trend: 'Online', color: '#3b82f6' },
            { label: 'Resolved Today', value: String(INCIDENTS.filter(i => i.status === 'Resolved').length), trend: '▲ 6', color: '#22c55e' },
            { label: 'Avg. Response Time', value: '07:28', trend: '▼ 1:15', color: '#a855f7' },
          ].map((kpi, i) => (
            <div key={i} className="fr-kpi-card" style={{ ...glass, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setActiveNav(i === 0 ? 'incidents' : i === 1 ? 'units' : i === 4 ? 'analytics' : 'overview')}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${kpi.color}15`, border: `1px solid ${kpi.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {['⚠️','🚒','📡','✅','⏱️'][i]}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', letterSpacing: 0.5, marginBottom: 2 }}>{kpi.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{kpi.value}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: kpi.color }}>{kpi.trend} <span style={{ color: '#475569', fontWeight: 500 }}>{kpi.trend !== 'Online' ? 'vs last 24h' : ''}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map + Incidents */}
        <div className="fr-main-grid">
          {/* Map */}
          <div className="fr-map-container" style={{ ...glass, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
              <span style={sectionTitle}>LIVE INCIDENT MAP</span>
            </div>
            <div style={{ flex: 1, position: 'relative', margin: '8px 12px 0' }}>
              <svg viewBox="0 0 800 380" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
                <defs><radialGradient id="mbg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#0d1b2a"/><stop offset="100%" stopColor="#060d1a"/></radialGradient></defs>
                <rect width="800" height="380" fill="url(#mbg)"/>
                {[...Array(16)].map((_,i) => <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="380" stroke="rgba(56,97,150,0.06)" strokeWidth="0.5"/>)}
                {[...Array(8)].map((_,i) => <line key={`h${i}`} x1="0" y1={i*50} x2="800" y2={i*50} stroke="rgba(56,97,150,0.06)" strokeWidth="0.5"/>)}
                <path d="M0 300 Q200 280, 400 300 Q600 320, 800 280" fill="none" stroke="rgba(30,64,120,0.25)" strokeWidth="28" strokeLinecap="round"/>
                <line x1="0" y1="190" x2="800" y2="190" stroke="rgba(100,130,170,0.12)" strokeWidth="3"/>
                <line x1="400" y1="0" x2="400" y2="380" stroke="rgba(100,130,170,0.12)" strokeWidth="3"/>
                <line x1="200" y1="0" x2="200" y2="380" stroke="rgba(100,130,170,0.06)" strokeWidth="1.5"/>
                <line x1="600" y1="0" x2="600" y2="380" stroke="rgba(100,130,170,0.06)" strokeWidth="1.5"/>
                {[[120,55,50,30],[180,55,35,25],[500,50,45,30],[560,50,30,25],[110,135,50,25],[500,130,45,25],[110,210,40,25],[510,205,40,30],[120,330,35,18],[530,330,40,18]].map(([x,y,w,h],i)=>(
                  <rect key={`b${i}`} x={x} y={y} width={w} height={h} rx="2" fill="rgba(30,45,70,0.35)" stroke="rgba(56,97,150,0.1)" strokeWidth="0.5"/>
                ))}
                <text x="150" y="38" fill="rgba(148,163,184,0.3)" fontSize="9" fontWeight="600" letterSpacing="3">CIVIL LINES</text>
                <text x="530" y="38" fill="rgba(148,163,184,0.3)" fontSize="9" fontWeight="600" letterSpacing="3">CONNAUGHT PLACE</text>
                <text x="520" y="170" fill="rgba(148,163,184,0.3)" fontSize="9" fontWeight="600" letterSpacing="3">CENTRAL DELHI</text>
                <text x="130" y="270" fill="rgba(148,163,184,0.3)" fontSize="9" fontWeight="600" letterSpacing="3">LINCOLN PARK</text>
                {/* Markers */}
                {activeIncidents.slice(0,6).map((inc,i) => {
                  const positions = [[380,200],[560,75],[500,220],[200,95],[630,340],[180,225]];
                  const [cx,cy] = positions[i] || [400,200];
                  const c = COLORS.type[inc.type];
                  const isMain = i === 0;
                  return (
                    <g key={inc.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedIncident(inc); setActiveNav('incidents'); }}>
                      {isMain && <><circle cx={cx} cy={cy} r="35" fill="none" stroke={`${c}20`} strokeWidth="1.5" opacity="0.6"/><circle cx={cx} cy={cy} r="24" fill="none" stroke={`${c}30`} strokeWidth="1"/></>}
                      <circle cx={cx} cy={cy} r={isMain ? 18 : 10} fill={`${c}15`} stroke={`${c}40`} strokeWidth="1"/>
                      <circle cx={cx} cy={cy} r={isMain ? 12 : 6} fill={c}/>
                      <text x={cx} y={cy + (isMain ? 4 : 3)} fill="#fff" fontSize={isMain ? 10 : 7} fontWeight="800" textAnchor="middle">{isMain ? '!' : '•'}</text>
                      {isMain && <>
                        <rect x={cx+20} y={cy-14} width="105" height="30" rx="7" fill="rgba(10,15,25,0.85)" stroke={`${c}40`} strokeWidth="1"/>
                        <text x={cx+28} y={cy+1} fill="#fca5a5" fontSize="10" fontWeight="700">{inc.title}</text>
                        <text x={cx+28} y={cy+12} fill="#64748b" fontSize="8" fontWeight="500">{inc.time}</text>
                      </>}
                    </g>
                  );
                })}
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '8px 18px 12px', borderTop: '1px solid rgba(56,97,150,0.08)' }}>
              {Object.entries(COLORS.type).map(([k,c])=>(
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#64748b', textTransform: 'capitalize' }}>{k}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Incident List */}
          <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(56,97,150,0.1)' }}>
              <span style={sectionTitle}>INCIDENTS ({INCIDENTS.length})</span>
              <button onClick={() => setActiveNav('incidents')} style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', background: 'none', border: 'none' }}>View All</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }} className="fr-scroll">
              {INCIDENTS.slice(0,6).map((inc) => (
                <div key={inc.id} onClick={() => { setSelectedIncident(inc); setActiveNav('incidents'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', cursor: 'pointer', borderBottom: '1px solid rgba(56,97,150,0.06)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,41,59,0.4)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `${COLORS.type[inc.type]}12`, border: `1px solid ${COLORS.type[inc.type]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{typeEmoji[inc.type]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>{inc.title}</div>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, marginTop: 1 }}>{inc.location}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, marginBottom: 3 }}>{inc.time}</div>
                    <StatusBadge label={inc.priority} color={COLORS.priority[inc.priority].text} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="fr-bottom-grid">
          {/* Unit Status */}
          <div style={{ ...glass, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={sectionTitle}>UNIT STATUS</span>
              <button onClick={() => setActiveNav('units')} style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', background: 'none', border: 'none' }}>View All</button>
            </div>
            {(['ambulance','fire','police','bike'] as const).map(type => {
              const units = UNITS.filter(u => u.type === type);
              const deployed = units.filter(u => u.status === 'On Mission').length;
              const label = type === 'ambulance' ? 'Ambulances' : type === 'fire' ? 'Fire Trucks' : type === 'police' ? 'Police Units' : 'Bikes';
              return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>{unitEmoji[type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>{label}</span>
                      <span style={{ fontSize: 10, color: '#64748b' }}>{deployed}/{units.length}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(30,41,59,0.6)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: `${(deployed/units.length)*100}%`, background: COLORS.unitType[type], boxShadow: `0 0 8px ${COLORS.unitType[type]}30` }} />
                    </div>
                  </div>
                  <StatusBadge label={deployed > 0 ? 'On Mission' : 'Available'} color={deployed > 0 ? '#f59e0b' : '#22c55e'} />
                </div>
              );
            })}
          </div>

          {/* Response Time Chart */}
          <div style={{ ...glass, padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={sectionTitle}>RESPONSE TIME <span style={{ color: '#475569', fontWeight: 500 }}>(Last 24h)</span></span>
              <button onClick={() => setActiveNav('analytics')} style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', background: 'none', border: 'none' }}>View Report</button>
            </div>
            <div style={{ flex: 1, minHeight: 120 }}>
              <svg viewBox="0 0 500 140" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
                {[0,35,70,105,140].map((y,i) => <><line x1="40" y1={y} x2="490" y2={y} stroke="rgba(56,97,150,0.08)" strokeWidth="0.5"/><text x="32" y={y+4} fill="#475569" fontSize="8" textAnchor="end">{['15m','10m','5m','0m',''][i]}</text></>)}
                {[40,130,220,310,400,490].map((x,i)=><text key={i} x={x} y="138" fill="#475569" fontSize="8" textAnchor="middle">{['00:00','06:00','12:00','18:00','24:00',''][i]}</text>)}
                <defs><linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></linearGradient></defs>
                <path d="M40 90 Q85 95,130 80 Q175 65,220 70 Q265 75,280 50 Q310 35,350 45 Q390 55,400 60 Q430 50,460 65 L460 120 L40 120 Z" fill="url(#cf)" opacity="0.4"/>
                <path d="M40 90 Q85 95,130 80 Q175 65,220 70 Q265 75,280 50 Q310 35,350 45 Q390 55,400 60 Q430 50,460 65" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' }}/>
                <circle cx="280" cy="50" r="5" fill="#3b82f6" stroke="#0d1b2a" strokeWidth="2.5"/>
                <rect x="255" y="22" width="50" height="22" rx="6" fill="rgba(59,130,246,0.9)"/>
                <text x="280" y="37" fill="#fff" fontSize="10" fontWeight="700" textAnchor="middle">07:28</text>
              </svg>
            </div>
          </div>

          {/* Comms Feed */}
          <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(56,97,150,0.1)' }}>
              <span style={sectionTitle}>COMMS FEED</span>
              <button onClick={() => setActiveNav('messages')} style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', background: 'none', border: 'none' }}>View All</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px' }} className="fr-scroll">
              {MESSAGES.slice(0,3).map((msg, i) => (
                <div key={msg.id} style={{ display: 'flex', gap: 12, marginBottom: i < 2 ? 16 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: msg.priority === 'urgent' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)', border: `1px solid ${msg.priority === 'urgent' ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>📡</div>
                    {i < 2 && <div style={{ width: 1, flex: 1, background: 'rgba(56,97,150,0.15)', marginTop: 4 }} />}
                  </div>
                  <div style={{ flex: 1, paddingTop: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{msg.from} → {msg.to}</span>
                      <span style={{ fontSize: 10, color: '#475569' }}>{msg.time}</span>
                    </div>
                    <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     VIEW: INCIDENTS (Full list + Detail Panel)
     ═══════════════════════════════════════════════════════════ */
  const renderIncidents = () => {
    const detail = selectedIncident;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 400px' : '1fr', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(56,97,150,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionHeader title="All Incidents" count={INCIDENTS.length} />
            <div style={{ display: 'flex', gap: 8 }}>
              {['All','Active','Dispatched','Resolved'].map(f => (
                <button key={f} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid rgba(56,97,150,0.15)', background: f === 'All' ? 'rgba(59,130,246,0.12)' : 'transparent', color: f === 'All' ? '#60a5fa' : '#64748b', cursor: 'pointer' }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }} className="fr-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(56,97,150,0.1)' }}>
                  {['ID','Type','Incident','Location','Time','Priority','Status','Units'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INCIDENTS.map(inc => (
                  <tr key={inc.id} onClick={() => setSelectedIncident(inc)} style={{ ...rowHover, borderBottom: '1px solid rgba(56,97,150,0.06)', background: selectedIncident?.id === inc.id ? 'rgba(59,130,246,0.06)' : 'transparent' }}
                    onMouseEnter={e => { if (selectedIncident?.id !== inc.id) e.currentTarget.style.background = 'rgba(30,41,59,0.3)'; }}
                    onMouseLeave={e => { if (selectedIncident?.id !== inc.id) e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{inc.id}</td>
                    <td style={{ padding: '10px 14px', fontSize: 16 }}>{typeEmoji[inc.type]}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{inc.title}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#94a3b8' }}>{inc.location}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#64748b' }}>{inc.time}</td>
                    <td style={{ padding: '10px 14px' }}><StatusBadge label={inc.priority} color={COLORS.priority[inc.priority].text} /></td>
                    <td style={{ padding: '10px 14px' }}><StatusBadge label={inc.status} color={COLORS.status[inc.status]} /></td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#94a3b8' }}>{inc.assignedUnits.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {detail && (
          <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(56,97,150,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{detail.title}</h3>
              <button onClick={() => setSelectedIncident(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }} className="fr-scroll">
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <StatusBadge label={detail.priority} color={COLORS.priority[detail.priority].text} />
                <StatusBadge label={detail.status} color={COLORS.status[detail.status]} />
                <StatusBadge label={detail.type.toUpperCase()} color={COLORS.type[detail.type]} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>LOCATION</div>
              <p style={{ fontSize: 13, color: '#e2e8f0', margin: '0 0 16px', fontWeight: 500 }}>{detail.location}</p>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>DESCRIPTION</div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 16px' }}>{detail.description}</p>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>REPORTER</div>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px' }}>{detail.reporter} • {detail.time}</p>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>ASSIGNED UNITS ({detail.assignedUnits.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {detail.assignedUnits.map(uid => {
                  const u = UNITS.find(u => u.id === uid);
                  return u ? (
                    <div key={uid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(15,23,42,0.5)', borderRadius: 8, border: '1px solid rgba(56,97,150,0.1)' }}>
                      <span style={{ fontSize: 16 }}>{unitEmoji[u.type]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{u.callsign}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{u.crew.join(', ')}</div>
                      </div>
                      <StatusBadge label={u.status} color={COLORS.status[u.status]} />
                    </div>
                  ) : <div key={uid} style={{ fontSize: 11, color: '#64748b' }}>{uid}</div>;
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     VIEW: UNITS
     ═══════════════════════════════════════════════════════════ */
  const renderUnits = () => (
    <div style={{ display: 'grid', gridTemplateColumns: selectedUnit ? '1fr 380px' : '1fr', gap: 16, flex: 1, minHeight: 0 }}>
      <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(56,97,150,0.1)' }}>
          <SectionHeader title="All Units" count={UNITS.length} />
          <div style={{ display: 'flex', gap: 12 }}>
            {(['ambulance','fire','police','bike'] as const).map(type => {
              const count = UNITS.filter(u => u.type === type).length;
              const active = UNITS.filter(u => u.type === type && u.status === 'On Mission').length;
              return (
                <div key={type} style={{ ...glass, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <span style={{ fontSize: 22 }}>{unitEmoji[type]}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{active}<span style={{ fontSize: 12, color: '#475569' }}>/{count}</span></div>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, textTransform: 'capitalize' }}>{type === 'fire' ? 'Fire Trucks' : type + 's'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }} className="fr-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid rgba(56,97,150,0.1)' }}>
              {['','ID','Callsign','Type','Status','Location','Crew','Incident'].map(h => (
                <th key={h} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {UNITS.map(u => (
                <tr key={u.id} onClick={() => setSelectedUnit(u)} style={{ ...rowHover, borderBottom: '1px solid rgba(56,97,150,0.06)', background: selectedUnit?.id === u.id ? 'rgba(59,130,246,0.06)' : 'transparent' }}
                  onMouseEnter={e => { if (selectedUnit?.id !== u.id) e.currentTarget.style.background = 'rgba(30,41,59,0.3)'; }}
                  onMouseLeave={e => { if (selectedUnit?.id !== u.id) e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ padding: '8px 12px', fontSize: 18 }}>{unitEmoji[u.type]}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{u.id}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{u.callsign}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>{u.type}</td>
                  <td style={{ padding: '8px 12px' }}><StatusBadge label={u.status} color={COLORS.status[u.status]} /></td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#94a3b8' }}>{u.location}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: '#64748b' }}>{u.crew.length}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: u.currentIncident ? '#fca5a5' : '#475569', fontFamily: 'monospace' }}>{u.currentIncident || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedUnit && (
        <div style={{ ...glass, padding: 20, overflowY: 'auto' }} className="fr-scroll">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{selectedUnit.callsign}</h3>
            <button onClick={() => setSelectedUnit(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <StatusBadge label={selectedUnit.status} color={COLORS.status[selectedUnit.status]} />
            <StatusBadge label={selectedUnit.type.toUpperCase()} color={COLORS.unitType[selectedUnit.type]} />
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Unit ID</div>
          <p style={{ fontSize: 13, color: '#e2e8f0', margin: '0 0 14px', fontFamily: 'monospace' }}>{selectedUnit.id}</p>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Location</div>
          <p style={{ fontSize: 13, color: '#e2e8f0', margin: '0 0 14px' }}>{selectedUnit.location}</p>
          {selectedUnit.currentIncident && <>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Active Incident</div>
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, marginBottom: 14, cursor: 'pointer' }}
              onClick={() => { const inc = INCIDENTS.find(i => i.id === selectedUnit.currentIncident); if (inc) { setSelectedIncident(inc); setActiveNav('incidents'); } }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fca5a5' }}>{selectedUnit.currentIncident}</span>
              <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>{INCIDENTS.find(i => i.id === selectedUnit.currentIncident)?.title}</span>
            </div>
          </>}
          <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>CREW ({selectedUnit.crew.length})</div>
          {selectedUnit.crew.map((c,i) => <div key={i} style={{ padding: '8px 12px', background: 'rgba(15,23,42,0.5)', borderRadius: 8, border: '1px solid rgba(56,97,150,0.1)', marginBottom: 6, fontSize: 12, color: '#e2e8f0' }}>{c}</div>)}
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     VIEW: MAP (Full-screen)
     ═══════════════════════════════════════════════════════════ */
  const renderMap = () => (
    <div style={{ ...glass, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(56,97,150,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span style={sectionTitle}>LIVE CITY MAP — ALL INCIDENTS & UNITS</span>
        </div>
        <span style={{ fontSize: 12, color: '#64748b' }}>{INCIDENTS.filter(i => i.status !== 'Resolved').length} active incidents • {UNITS.filter(u => u.status === 'On Mission').length} units deployed</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,13,26,0.6)' }}>
        <svg viewBox="0 0 900 500" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
          <rect width="900" height="500" fill="#080f1e"/>
          {[...Array(18)].map((_,i) => <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="500" stroke="rgba(56,97,150,0.05)" strokeWidth="0.5"/>)}
          {[...Array(10)].map((_,i) => <line key={`h${i}`} x1="0" y1={i*50} x2="900" y2={i*50} stroke="rgba(56,97,150,0.05)" strokeWidth="0.5"/>)}
          <path d="M0 400 Q150 370, 300 410 Q450 440, 600 390 Q750 360, 900 380" fill="none" stroke="rgba(30,64,120,0.2)" strokeWidth="35" strokeLinecap="round"/>
          <line x1="0" y1="250" x2="900" y2="250" stroke="rgba(100,130,170,0.1)" strokeWidth="4"/>
          <line x1="450" y1="0" x2="450" y2="500" stroke="rgba(100,130,170,0.1)" strokeWidth="4"/>
          {INCIDENTS.filter(i => i.status !== 'Resolved').map((inc,i) => {
            const positions = [[420,250],[620,100],[500,300],[200,120],[700,420],[180,280],[380,350],[600,180]];
            const [cx,cy] = positions[i] || [450 + Math.random()*200-100, 250 + Math.random()*150-75];
            const c = COLORS.type[inc.type];
            return (
              <g key={inc.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedIncident(inc); setActiveNav('incidents'); }}>
                <circle cx={cx} cy={cy} r="20" fill={`${c}08`} stroke={`${c}25`} strokeWidth="1"/>
                <circle cx={cx} cy={cy} r="10" fill={c} opacity="0.9"/>
                <text x={cx} y={cy+4} fill="#fff" fontSize="8" fontWeight="800" textAnchor="middle">{typeEmoji[inc.type]}</text>
                <text x={cx+16} y={cy-8} fill="#94a3b8" fontSize="8" fontWeight="600">{inc.title}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     VIEW: ALERTS
     ═══════════════════════════════════════════════════════════ */
  const renderAlerts = () => (
    <div style={{ ...glass, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(56,97,150,0.1)' }}>
        <SectionHeader title="Alerts & Notifications" count={alertList.length} action={`Mark all read (${alertList.filter(a => !a.read).length} unread)`} onAction={() => setAlertList(prev => prev.map(a => ({ ...a, read: true })))} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="fr-scroll">
        {alertList.map(a => {
          const sevColor = a.severity === 'critical' ? '#ef4444' : a.severity === 'warning' ? '#f59e0b' : '#3b82f6';
          return (
            <div key={a.id} onClick={() => setAlertList(prev => prev.map(x => x.id === a.id ? { ...x, read: true } : x))}
              style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: '1px solid rgba(56,97,150,0.06)', cursor: 'pointer', background: a.read ? 'transparent' : 'rgba(59,130,246,0.03)', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,41,59,0.3)')} onMouseLeave={e => (e.currentTarget.style.background = a.read ? 'transparent' : 'rgba(59,130,246,0.03)')}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.read ? 'transparent' : sevColor, marginTop: 6, flexShrink: 0, border: a.read ? `1px solid ${sevColor}40` : 'none' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: a.read ? 500 : 700, color: a.read ? '#94a3b8' : '#f1f5f9' }}>{a.title}</span>
                  <span style={{ fontSize: 10, color: '#475569' }}>{a.time}</span>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{a.message}</p>
              </div>
              <StatusBadge label={a.severity} color={sevColor} />
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     VIEW: MESSAGES
     ═══════════════════════════════════════════════════════════ */
  const renderMessages = () => (
    <div style={{ ...glass, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(56,97,150,0.1)' }}>
        <SectionHeader title="Communication Log" count={MESSAGES.length} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }} className="fr-scroll">
        {MESSAGES.map((msg, i) => (
          <div key={msg.id} style={{ display: 'flex', gap: 14, marginBottom: 16, flexDirection: msg.type === 'outgoing' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: msg.type === 'broadcast' ? 'rgba(245,158,11,0.12)' : msg.type === 'outgoing' ? 'rgba(59,130,246,0.12)' : 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
              {msg.type === 'broadcast' ? '📢' : msg.type === 'outgoing' ? '📤' : '📥'}
            </div>
            <div style={{ flex: 1, maxWidth: '75%', padding: '12px 16px', borderRadius: 12, background: msg.type === 'outgoing' ? 'rgba(59,130,246,0.08)' : 'rgba(15,23,42,0.5)', border: `1px solid ${msg.type === 'outgoing' ? 'rgba(59,130,246,0.15)' : 'rgba(56,97,150,0.1)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{msg.from} → {msg.to}</span>
                {msg.priority === 'urgent' && <StatusBadge label="URGENT" color="#ef4444" />}
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{msg.text}</p>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 6, textAlign: msg.type === 'outgoing' ? 'right' : 'left' }}>{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(56,97,150,0.1)', display: 'flex', gap: 10 }}>
        <input value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="Type a broadcast message..."
          style={{ flex: 1, background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(56,97,150,0.15)', borderRadius: 10, padding: '10px 16px', color: '#e2e8f0', fontSize: 13, outline: 'none' }}
          onKeyDown={e => { if (e.key === 'Enter' && msgInput.trim()) setMsgInput(''); }}/>
        <button onClick={() => setMsgInput('')} style={{ padding: '10px 20px', borderRadius: 10, background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     VIEW: REPORTS
     ═══════════════════════════════════════════════════════════ */
  const renderReports = () => {
    const reports = [
      { id: 'RPT-001', title: 'Daily Operations Summary', date: 'Aug 19, 2026', type: 'Daily', status: 'Ready', pages: 12 },
      { id: 'RPT-002', title: 'Weekly Incident Analysis', date: 'Aug 18, 2026', type: 'Weekly', status: 'Ready', pages: 28 },
      { id: 'RPT-003', title: 'Monthly Performance Metrics', date: 'Aug 1, 2026', type: 'Monthly', status: 'Ready', pages: 45 },
      { id: 'RPT-004', title: 'Unit Deployment Efficiency', date: 'Aug 15, 2026', type: 'Special', status: 'Ready', pages: 18 },
      { id: 'RPT-005', title: 'Resource Utilization Q3', date: 'Jul 31, 2026', type: 'Quarterly', status: 'Ready', pages: 62 },
      { id: 'RPT-006', title: 'Critical Incident Post-Mortem: INC-001', date: 'Aug 19, 2026', type: 'Incident', status: 'Draft', pages: 8 },
    ];
    return (
      <div style={{ ...glass, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(56,97,150,0.1)' }}><SectionHeader title="Reports" count={reports.length} action="Generate New Report" /></div>
        <div style={{ flex: 1, overflowY: 'auto' }} className="fr-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid rgba(56,97,150,0.1)' }}>
              {['ID','Report Title','Date','Type','Pages','Status','Action'].map(h => <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(56,97,150,0.06)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,41,59,0.3)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{r.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{r.title}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#94a3b8' }}>{r.date}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge label={r.type} color="#3b82f6" /></td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#64748b' }}>{r.pages} pages</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge label={r.status} color={r.status === 'Ready' ? '#22c55e' : '#f59e0b'} /></td>
                  <td style={{ padding: '12px 16px' }}><button style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>📥 Download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     VIEW: ANALYTICS
     ═══════════════════════════════════════════════════════════ */
  const renderAnalytics = () => (
    <>
      <SectionHeader title="Analytics Dashboard" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        {[
          { label: 'Total Incidents (Month)', value: '342', change: '+8%', color: '#ef4444' },
          { label: 'Avg Response Time', value: '07:28', change: '-12%', color: '#22c55e' },
          { label: 'Units Utilization', value: '73%', change: '+5%', color: '#3b82f6' },
          { label: 'Resolution Rate', value: '94.2%', change: '+2.1%', color: '#a855f7' },
        ].map((s, i) => (
          <div key={i} style={{ ...glass, padding: '20px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{s.value}</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: s.change.startsWith('+') && s.label.includes('Response') ? '#ef4444' : '#22c55e' }}>{s.change} vs last month</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
        <div style={{ ...glass, padding: '18px' }}>
          <span style={sectionTitle}>INCIDENTS BY TYPE (This Month)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 20 }}>
            <svg viewBox="0 0 120 120" style={{ width: 120, height: 120 }}>
              {[{ pct: 35, c: '#ef4444', off: 0 },{ pct: 25, c: '#f59e0b', off: 35 },{ pct: 20, c: '#22c55e', off: 60 },{ pct: 15, c: '#3b82f6', off: 80 },{ pct: 5, c: '#a855f7', off: 95 }].map((s,i) => (
                <circle key={i} cx="60" cy="60" r="50" fill="none" stroke={s.c} strokeWidth="18" strokeDasharray={`${s.pct * 3.14} ${314 - s.pct * 3.14}`} strokeDashoffset={-s.off * 3.14} transform="rotate(-90 60 60)" opacity="0.85"/>
              ))}
              <text x="60" y="56" fill="#f1f5f9" fontSize="18" fontWeight="800" textAnchor="middle">342</text>
              <text x="60" y="70" fill="#64748b" fontSize="8" fontWeight="600" textAnchor="middle">TOTAL</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Accidents','35%','#ef4444'],['Fire','25%','#f59e0b'],['Medical','20%','#22c55e'],['Police','15%','#3b82f6'],['Other','5%','#a855f7']].map(([l,p,c])=>(
                <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c as string }} />
                  <span style={{ fontSize: 12, color: '#94a3b8', width: 70 }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ ...glass, padding: '18px' }}>
          <span style={sectionTitle}>RESPONSE TIME TREND (7 Days)</span>
          <div style={{ marginTop: 16 }}>
            <svg viewBox="0 0 400 160" style={{ width: '100%' }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => (
                <g key={d}>
                  <rect x={i*55+20} y={160 - [85,72,90,65,78,95,70][i]} width="35" height={[85,72,90,65,78,95,70][i]} rx="4" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.25)" strokeWidth="0.5"/>
                  <rect x={i*55+20} y={160 - [85,72,90,65,78,95,70][i]} width="35" height={[85,72,90,65,78,95,70][i] * 0.7} rx="4" fill="#3b82f6" opacity="0.7"/>
                  <text x={i*55+37} y="158" fill="#475569" fontSize="9" textAnchor="middle">{d}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </>
  );

  /* ═══════════════════════════════════════════════════════════
     VIEW: RESOURCES
     ═══════════════════════════════════════════════════════════ */
  const renderResources = () => {
    const resources = [
      { name: 'Fuel Reserves', current: 8500, max: 12000, unit: 'liters', status: 'OK', color: '#22c55e' },
      { name: 'Medical Supplies', current: 340, max: 500, unit: 'kits', status: 'Low', color: '#f59e0b' },
      { name: 'Firefighting Foam', current: 2200, max: 3000, unit: 'liters', status: 'OK', color: '#22c55e' },
      { name: 'Body Armor Vests', current: 18, max: 50, unit: 'units', status: 'Critical', color: '#ef4444' },
      { name: 'Communication Radios', current: 85, max: 100, unit: 'units', status: 'OK', color: '#22c55e' },
      { name: 'Stretchers', current: 22, max: 30, unit: 'units', status: 'OK', color: '#22c55e' },
      { name: 'Generator Fuel', current: 150, max: 500, unit: 'liters', status: 'Low', color: '#f59e0b' },
      { name: 'First Aid Kits', current: 120, max: 200, unit: 'kits', status: 'OK', color: '#22c55e' },
    ];
    return (
      <div style={{ ...glass, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(56,97,150,0.1)' }}><SectionHeader title="Resource Inventory" count={resources.length} action="Request Supplies" /></div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="fr-scroll">
          {resources.map((r, i) => (
            <div key={i} style={{ padding: '16px 18px', background: 'rgba(15,23,42,0.5)', borderRadius: 12, border: `1px solid ${r.color}20` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{r.name}</span>
                <StatusBadge label={r.status} color={r.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>{r.current.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>/ {r.max.toLocaleString()} {r.unit}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(30,41,59,0.6)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, width: `${(r.current/r.max)*100}%`, background: r.color, boxShadow: `0 0 8px ${r.color}30` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     VIEW: SETTINGS
     ═══════════════════════════════════════════════════════════ */
  const renderSettings = () => (
    <div style={{ ...glass, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(56,97,150,0.1)' }}><SectionHeader title="System Settings" /></div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, maxWidth: 600 }} className="fr-scroll">
        {[
          { label: 'Auto-dispatch nearest unit', value: true },
          { label: 'Critical incident alerts (audio)', value: true },
          { label: 'Weather warnings overlay on map', value: true },
          { label: 'Dark mode (always on)', value: true },
          { label: 'Unit GPS tracking (real-time)', value: true },
          { label: 'Broadcast all-hands for Critical incidents', value: false },
          { label: 'Auto-generate post-incident reports', value: true },
          { label: 'Night mode (reduced brightness)', value: false },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(56,97,150,0.08)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{s.label}</span>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: s.value ? '#22c55e' : 'rgba(100,116,139,0.3)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: s.value ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     ROUTER
     ═══════════════════════════════════════════════════════════ */
  const renderContent = () => {
    switch (activeNav) {
      case 'overview': return renderOverview();
      case 'incidents': return renderIncidents();
      case 'units': return renderUnits();
      case 'map': return renderMap();
      case 'alerts': return renderAlerts();
      case 'messages': return renderMessages();
      case 'reports': return renderReports();
      case 'analytics': return renderAnalytics();
      case 'resources': return renderResources();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: 'linear-gradient(135deg, #040810 0%, #0a1628 50%, #060d1a 100%)', color: '#e2e8f0', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fr-glow{0%,100%{box-shadow:0 0 8px rgba(239,68,68,.3)}50%{box-shadow:0 0 20px rgba(239,68,68,.5)}}
        @keyframes fr-blink{0%,100%{opacity:1}50%{opacity:.4}}
        .fr-scroll::-webkit-scrollbar{width:4px}.fr-scroll::-webkit-scrollbar-track{background:transparent}.fr-scroll::-webkit-scrollbar-thumb{background:rgba(100,120,160,0.3);border-radius:4px}
        
        /* RESPONSIVE LAYOUTS */
        .fr-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
        .fr-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 16px; flex: 1; min-height: 0; }
        .fr-bottom-grid { display: grid; grid-template-columns: 1fr 1.5fr 1.5fr; gap: 16px; }
        .fr-sidebar { width: 200px; background: rgba(10,18,32,0.95); border-right: 1px solid rgba(56,97,150,0.15); display: flex; flex-direction: column; flex-shrink: 0; transition: width 0.3s; }
        .fr-bottom-nav { display: none; }
        .fr-mobile-fab { display: none; }
        .fr-mobile-header-content { display: none; }
        .fr-desktop-header-content { display: flex; align-items: center; gap: 12px; }
        .fr-map-container { min-height: 340px; }
        .fr-main-wrapper { flex: 1; overflow: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }

        @media (max-width: 1199px) {
          .fr-kpi-grid { grid-template-columns: repeat(3, 1fr); }
          .fr-main-grid { grid-template-columns: 1fr 280px; }
          .fr-bottom-grid { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 767px) {
          .fr-kpi-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 12px; padding-bottom: 8px; margin-bottom: -8px; min-height: 90px; flex-shrink: 0; }
          .fr-kpi-grid::-webkit-scrollbar { display: none; }
          .fr-kpi-card { min-width: 150px; scroll-snap-align: start; flex-shrink: 0; }
          .fr-main-grid { display: flex; flex-direction: column; flex: none; min-height: auto; }
          .fr-bottom-grid { display: flex; flex-direction: column; flex: none; }
          .fr-sidebar { display: none !important; }
          .fr-main-wrapper { padding: 12px; padding-bottom: 80px; }
          .fr-bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; height: 64px; background: rgba(10,18,32,0.95); border-top: 1px solid rgba(56,97,150,0.15); backdrop-filter: blur(20px); z-index: 100; justify-content: space-around; align-items: center; padding-bottom: env(safe-area-inset-bottom); }
          .fr-mobile-fab { display: flex; position: fixed; bottom: 84px; right: 20px; width: 56px; height: 56px; border-radius: 28px; background: linear-gradient(135deg, #dc2626, #ef4444); box-shadow: 0 4px 20px rgba(239,68,68,0.5); z-index: 100; align-items: center; justify-content: center; flex-direction: column; animation: fr-glow 2s infinite; border: 2px solid #fca5a5; color: white; text-decoration: none; }
          .fr-desktop-header-content { display: none !important; }
          .fr-mobile-header-content { display: flex; }
          .fr-mobile-header-row { display: flex; flex-direction: row; width: 100%; justify-content: space-between; align-items: center; }
          .fr-map-container { min-height: 55vh !important; }
          .fr-app-container { flex-direction: column !important; }
        }
      `}</style>

      {/* HEADER */}
      <header className="fr-header" style={{ height: 56, background: 'rgba(8,16,32,0.92)', borderBottom: '1px solid rgba(56,97,150,0.18)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, zIndex: 50, flexShrink: 0 }}>
        
        {/* Mobile Header Layout */}
        <div className="fr-mobile-header-row fr-mobile-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🛡️</div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: '#f1f5f9' }}>COMMAND CENTER</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 28, height: 28, borderRadius: '50%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(56,97,150,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
              🔔<span style={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>AS</div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Desktop Header Layout */}
        <div className="fr-desktop-header-content w-full flex-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 8px 0 0' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(59,130,246,0.25)', fontSize: 16 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1.5, color: '#f1f5f9' }}>FIRST RESPONDER</div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, color: '#64748b' }}>COMMAND CENTER</div>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div className="desktop-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '8px 20px', animation: 'fr-glow 3s ease-in-out infinite' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #dc2626, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>⚠️</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.5, color: '#fca5a5' }}>ACTIVE INCIDENT</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Major Accident on MG Road</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: '#fca5a5', background: 'rgba(239,68,68,0.15)', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', animation: 'fr-blink 1.5s infinite' }} />High Priority
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <div className="desktop-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[{ icon: '🔔', badge: true },{ icon: '💬' },{ icon: '⚙️' }].map((b,i)=>(
              <button key={i} onClick={() => setActiveNav(i === 0 ? 'alerts' : i === 1 ? 'messages' : 'settings')}
                style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(56,97,150,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, position: 'relative' }}>
                {b.icon}
                {b.badge && <span style={{ position: 'absolute', top: 6, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '2px solid #0a1628' }} />}
              </button>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(56,97,150,0.15)', borderRadius: 12, padding: '5px 12px 5px 5px', marginLeft: 6 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>AS</div>
                <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #0a1628' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Arjun Singh</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Control Officer</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, transition: 'all 0.2s', marginLeft: 6 }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="fr-app-container" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* MOBILE ACTIVE INCIDENT BANNER */}
        <div className="fr-mobile-header-content" style={{ padding: '12px 16px', background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))', borderBottom: '1px solid rgba(239,68,68,0.2)', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #dc2626, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚠️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Major Accident — MG Road</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#fca5a5' }}><span style={{ color: '#ef4444' }}>●</span> High Priority · 2 min ago</div>
          </div>
        </div>

        {/* SIDEBAR */}
        {isSidebarOpen && (
        <aside className="fr-sidebar">
          <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }} className="fr-scroll">
            {NAV.map(item => {
              const active = activeNav === item.id;
              return (
                <div key={item.id} onClick={() => { setActiveNav(item.id); setSelectedIncident(null); setSelectedUnit(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', margin: '2px 10px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 500, color: active ? '#60a5fa' : '#94a3b8', background: active ? 'rgba(59,130,246,0.12)' : 'transparent', border: active ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; e.currentTarget.style.color = '#cbd5e1'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}}>
                  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={item.icon}/></svg>
                  <span>{item.label}</span>
                  {item.id === 'alerts' && alertList.filter(a => !a.read).length > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 6px', minWidth: 16, textAlign: 'center' }}>{alertList.filter(a => !a.read).length}</span>
                  )}
                </div>
              );
            })}
          </nav>
          <div style={{ margin: '12px 12px 16px', background: 'linear-gradient(135deg, #991b1b, #dc2626, #b91c1c)', borderRadius: 14, padding: '16px 14px', textAlign: 'center', boxShadow: '0 0 30px rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
              <span>📞</span><span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>EMERGENCY CALL</span>
            </div>
            <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: 2, marginBottom: 2 }}>112</div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, opacity: 0.8 }}>SOS</div>
          </div>
        </aside>
        )}

        {/* MAIN */}
        <main className="fr-scroll fr-main-wrapper">
          {renderContent()}
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="fr-bottom-nav">
          {[
            { id: 'overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Home' },
            { id: 'incidents', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', label: 'Incidents' },
            { id: 'map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', label: 'Map' },
            { id: 'alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Alerts' },
            { id: 'more', icon: 'M4 6h16M4 12h16M4 18h16', label: 'More' }
          ].map(item => {
            const active = activeNav === item.id || (item.id === 'more' && !['overview','incidents','map','alerts'].includes(activeNav));
            return (
              <div key={item.id} onClick={() => setActiveNav(item.id === 'more' ? 'resources' : item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', color: active ? '#60a5fa' : '#64748b', cursor: 'pointer', transition: 'color 0.2s' }}>
                <div style={{ position: 'relative' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={item.icon}/></svg>
                  {item.id === 'alerts' && alertList.filter(a => !a.read).length > 0 && <span style={{ position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid #0a1628' }} />}
                </div>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 600 }}>{item.label}</span>
                {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#60a5fa', position: 'absolute', bottom: 4 }} />}
              </div>
            );
          })}
        </nav>

        {/* MOBILE FLOATING EMERGENCY BUTTON */}
        <a href="tel:112" className="fr-mobile-fab">
          <span style={{ fontSize: 20 }}>📞</span>
        </a>
      </div>
    </div>
  );
}
