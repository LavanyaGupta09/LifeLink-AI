// ============================================
// MOCK DATA — Realistic Indian healthcare data
// ============================================

import type {
  User, HealthProfile, EmergencyContact, Hospital, Doctor,
  FamilyMember, MedicalRecord, BloodDonor, Pharmacy, Lab, Ambulance,
  ERDashboard, PreArrivalAlert, HospitalRoute
} from '../types/health.types';

export const MOCK_USER: User = {
  id: 'usr_001',
  fullName: 'Priya Sharma',
  phone: '+91 98765 43210',
  email: 'priya.sharma@gmail.com',
  photoUrl: undefined,
  dateOfBirth: '1976-04-15',
  gender: 'female',
  role: 'patient',
  isVerified: true,
};

export const MOCK_HEALTH_PROFILE: HealthProfile = {
  userId: 'usr_001',
  bloodGroup: 'B+',
  allergies: ['Penicillin', 'Sulfa drugs', 'Shellfish'],
  chronicConditions: ['Mild Asthma'],
  currentMedications: ['Salbutamol inhaler (as needed)', 'Vitamin D3 60,000 IU (weekly)'],
  organDonor: true,
  insuranceProvider: 'Star Health Insurance',
  insuranceNumber: 'SHI-2024-883721',
  qrToken: 'LLQR-B29FX-PRIYA-2024',
};

export const MOCK_AUDIT_REMINDER = {
  id: 'audit_rem_001',
  title: 'Health Audit Required',
  message: 'Your medical reports may be out of date. Please complete a 90-day health audit to ensure emergency responders have accurate data.',
  actionUrl: '/audit',
};

export const MOCK_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'ec_001', userId: 'usr_001', name: 'Rahul Sharma', relationship: 'Husband', phone: '+91 98765 11111', notifyOnSOS: true, isPrimary: true },
  { id: 'ec_002', userId: 'usr_001', name: 'Asha Sharma', relationship: 'Daughter', phone: '+91 98765 22222', notifyOnSOS: true, isPrimary: false }
];

export const MOCK_HOSPITALS: HospitalExtended[] = [];

export const MOCK_DOCTORS: Doctor[] = [
  { id: 'doc_001', name: 'Dr. Anand Rao', specialty: 'General Physician', hospital: 'Apollo Hospitals', rating: 4.8, experienceYears: 15, isAvailableNow: true, distanceKm: 2.5, phone: '+91 98765 33333' },
  { id: 'doc_002', name: 'Dr. Preethi Suresh', specialty: 'Cardiologist', hospital: 'Fortis Escorts', rating: 4.9, experienceYears: 20, isAvailableNow: false, distanceKm: 5.1, phone: '+91 98765 44444' }
];

export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'fm_001', userId: 'usr_001', name: 'Arun Sharma', relation: 'Father', age: 72, bloodGroup: 'O-', healthStatus: 'fair', lastCheckup: '2024-05-12', chronicConditions: ['Hypertension', 'Diabetes Type 2'] },
  { id: 'fm_002', userId: 'usr_001', name: 'Meena Sharma', relation: 'Mother', age: 68, bloodGroup: 'B+', healthStatus: 'good', lastCheckup: '2024-06-20', chronicConditions: ['Arthritis'] }
];

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [];

export const MOCK_AMBULANCES: Ambulance[] = [];

export const MOCK_BLOOD_DONORS: BloodDonor[] = [];

export const GENERIC_MAP: Record<string, string> = {
  'ventolin': 'Salbutamol Inhaler',
  'crocin': 'Paracetamol 500mg',
  'augmentin': 'Amoxicillin 500mg',
  'glucophage': 'Metformin 500mg',
  'pan40': 'Pantoprazole 40mg',
};

export const MOCK_PHARMACIES: Pharmacy[] = [];

export const MOCK_LABS: Lab[] = [];

export const MOCK_ER_DASHBOARDS: ERDashboard[] = MOCK_HOSPITALS.map(h => ({
  hospitalId: h.id,
  hospitalName: h.name,
  erBedsTotal: h.erBedsTotal,
  erBedsAvailable: h.erBedsAvailable,
  erOccupancyPercent: Math.round(((h.erBedsTotal - h.erBedsAvailable) / h.erBedsTotal) * 100),
  icuBedsTotal: h.icuBedsTotal,
  icuBedsAvailable: h.icuBedsAvailable,
  icuOccupancyPercent: Math.round(((h.icuBedsTotal - h.icuBedsAvailable) / h.icuBedsTotal) * 100),
  erWaitMinutes: h.erWaitMinutes,
  availabilityStatus: (h.erBedsAvailable / h.erBedsTotal) >= 0.5 ? 'high' : (h.erBedsAvailable / h.erBedsTotal) >= 0.25 ? 'medium' : 'critical',
  onCallSpecialists: h.onCallSpecialists,
  traumaLevel: h.traumaLevel,
  hasHelipad: h.hasHelipad,
  hasBloodBank: h.hasBloodBank,
  lastUpdated: new Date().toISOString(),
}));

export const MOCK_PRE_ARRIVAL_ALERT: PreArrivalAlert = {
  alertId: 'alert_001',
  hospitalId: 'hosp_001',
  hospitalName: 'Apollo Hospitals',
  status: 'acknowledged',
  prepTeam: ['Dr. Preethi Suresh (Cardiologist)', 'Nurse Ravi Kumar', 'Dr. Anand Rao (Neurologist)'],
  erBayAssigned: 'ER Bay 3-B',
  estimatedArrival: '4 mins',
  transportMode: 'Ambulance',
  triageLevel: 'critical',
  acknowledgedAt: new Date(Date.now() - 60000).toISOString(),
};

export const MOCK_HOSPITAL_ROUTES: HospitalRoute[] = [
  {
    hospitalId: 'hosp_001',
    hospitalName: 'Apollo Hospitals',
    distanceKm: 4.2,
    durationMinutes: 12,
    trafficCondition: 'moderate',
    googleMapsUrl: 'https://maps.google.com/?q=Apollo+Hospitals',
    coordinates: []
  },
  {
    hospitalId: 'hosp_002',
    hospitalName: 'Fortis Escorts',
    distanceKm: 6.8,
    durationMinutes: 18,
    trafficCondition: 'heavy',
    googleMapsUrl: 'https://maps.google.com/?q=Fortis+Escorts',
    coordinates: []
  }
];

// AI Triage response templates
export const TRIAGE_RESPONSES = {
  critical: {
    level: 'critical' as const,
    title: 'Critical Emergency',
    message: 'Symptoms indicate a potentially life-threatening condition. Immediate emergency care is required.',
    action: 'Dispatching nearest ambulance. Connecting you to an on-call emergency physician.',
    specialist: 'Emergency Medicine',
    color: '#FF4757',
  },
  high: {
    level: 'high' as const,
    title: 'High Priority',
    message: 'Your symptoms require urgent medical attention within the next 2 hours.',
    action: 'Dispatching ambulance. Notifying your family doctor and emergency contacts.',
    specialist: 'Emergency Medicine',
    color: '#FF6348',
  },
  medium: {
    level: 'medium' as const,
    title: 'Moderate Concern',
    message: 'Your symptoms suggest you need to see a doctor today but do not require emergency services.',
    action: 'Booking an appointment with General Practice. Keep monitoring your symptoms.',
    specialist: 'General Practice',
    color: '#FFA502',
  },
  low: {
    level: 'low' as const,
    title: 'Routine Care',
    message: 'Your symptoms appear mild. Rest and hydration recommended.',
    action: 'Monitor for 24 hours. Contact a doctor if symptoms worsen.',
    specialist: 'General Practice',
    color: '#2ED573',
  }
};

export const MOCK_HEALTH_RECORDS = [
  {
    id: 'rec_001',
    fileName: 'CBC_Blood_Test_Aug2026.pdf',
    fileType: 'report',
    description: 'Complete Blood Count Results',
    uploadDate: 'Aug 02, 2026',
    fileSize: '1.2 MB',
    iconColor: '#FF4757',
    isSharedWithDoctor: true
  },
  {
    id: 'rec_002',
    fileName: 'Cardiology_Consult_DrRao.pdf',
    fileType: 'prescription',
    description: 'Post-consultation Prescription',
    uploadDate: 'Jul 15, 2026',
    fileSize: '840 KB',
    iconColor: '#2ED573',
    isSharedWithDoctor: true
  },
  {
    id: 'rec_003',
    fileName: 'Chest_XRay_Report.pdf',
    fileType: 'scan',
    description: 'Annual Checkup Chest X-Ray',
    uploadDate: 'Jan 10, 2026',
    fileSize: '4.5 MB',
    iconColor: '#3D91FF',
    isSharedWithDoctor: false
  },
  {
    id: 'rec_004',
    fileName: 'Apollo_Insurance_Card.png',
    fileType: 'insurance',
    description: 'Health Insurance E-Card',
    uploadDate: 'Dec 05, 2025',
    fileSize: '2.1 MB',
    iconColor: '#FFA502',
    isSharedWithDoctor: false
  }
];
