// ============================================
// LIFELINK AI — TypeScript Types & Interfaces
// ============================================

export type TriageLevel = 'low' | 'medium' | 'high' | 'critical';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UserRole = 'patient' | 'doctor' | 'driver' | 'hospital_admin' | 'pharmacy_manager' | 'lab_tech' | 'admin' | 'super_admin';
export type SOSTrigger = 'button' | 'voice' | 'hardware';
export type SOSStatus = 'active' | 'resolved' | 'false_alarm' | 'cancelled';
export type AmbulanceStatus = 'available' | 'dispatched' | 'en_route' | 'at_scene' | 'returning';
export type DoctorStatus = 'available' | 'busy' | 'offline';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  photoUrl?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  role: UserRole;
  isVerified: boolean;
  verificationStatus?: 'pending_approval' | 'verified' | 'rejected';
  licenseId?: string;
  easyModeEnabled?: boolean;
}

export interface HealthProfile {
  userId: string;
  bloodGroup: BloodGroup;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  organDonor: boolean;
  insuranceProvider?: string;
  insuranceNumber?: string;
  qrToken?: string;
  bloodPressure?: string;
  dailyMood?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isFamilyMember: boolean;
  linkedUserId?: string;
  notifyOnSOS: boolean;
}

export interface SOSEvent {
  id: string;
  userId: string;
  status: SOSStatus;
  triageLevel: TriageLevel;
  triggerMethod: SOSTrigger;
  lat: number;
  lng: number;
  address: string;
  ambulanceId?: string;
  doctorSessionId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface TriageSession {
  id: string;
  userId: string;
  symptomsInput: string;
  urgency: 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';
  possibleFactors: string[];
  recommendation: string;
  createdAt: string;
  sources?: { name: string; url?: string; confidence: number }[];
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  driverName: string;
  hospitalName: string;
  status: AmbulanceStatus;
  lat: number;
  lng: number;
  etaMinutes?: number;
  equipment: string[];
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  erBedsTotal: number;
  erBedsAvailable: number;
  activeSpecialists: string[];
  rating: number;
  distanceKm?: number;
  isPartner: boolean;
}

export type HospitalType = 'private' | 'government';
export type TraumaLevel = 'I' | 'II' | 'III';

export interface OnCallSpecialist {
  name: string;
  specialization: string;
  availableSince: string;
}

export interface HospitalExtended extends Hospital {
  type: HospitalType;
  specialties: string[];
  acceptedInsurance: string[];
  icuBedsTotal: number;
  icuBedsAvailable: number;
  erWaitMinutes: number;
  traumaLevel: TraumaLevel;
  hasHelipad: boolean;
  hasBloodBank: boolean;
  onCallSpecialists: OnCallSpecialist[];
}

export interface ERDashboard {
  hospitalId: string;
  hospitalName: string;
  erBedsTotal: number;
  erBedsAvailable: number;
  erOccupancyPercent: number;
  icuBedsTotal: number;
  icuBedsAvailable: number;
  icuOccupancyPercent: number;
  erWaitMinutes: number;
  availabilityStatus: 'high' | 'medium' | 'critical';
  onCallSpecialists: OnCallSpecialist[];
  traumaLevel: TraumaLevel;
  hasHelipad: boolean;
  hasBloodBank: boolean;
  lastUpdated: string;
}

export interface PreArrivalAlert {
  alertId: string;
  hospitalId: string;
  hospitalName: string;
  status: 'sent' | 'acknowledged';
  prepTeam: string[];
  erBayAssigned: string;
  estimatedArrival: string;
  transportMode: string;
  triageLevel: string;
  acknowledgedAt: string;
}

export interface HospitalRoute {
  hospitalId: string;
  hospitalName: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  distanceKm: number;
  durationMinutes: number;
  trafficCondition: 'clear' | 'moderate' | 'heavy';
  googleMapsUrl: string;
}

export interface Doctor {
  id: string;
  name: string;
  photoUrl?: string;
  specialization: string;
  licenseNumber: string;
  hospitalName: string;
  isOnCall: boolean;
  status: DoctorStatus;
  consultationFee: number;
  rating: number;
  videoCallAvailable: boolean;
  experienceYears: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  photoUrl?: string;
  bloodGroup?: BloodGroup;
  age?: number;
  phone?: string;
  status: 'safe' | 'sos' | 'unknown';
  lastSeen?: string;
  lat?: number;
  lng?: number;
  hasActiveSOSId?: string;
  familyDoctorId?: string;
  easyModeEnabled?: boolean;
}

export interface MedicalRecord {
  id: string;
  fileName: string;
  fileType: 'report' | 'prescription' | 'scan' | 'insurance' | 'other';
  uploadDate: string;
  description: string;
  isSharedWithDoctor: boolean;
  fileSize: string;
  iconColor: string;
}

export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  lastDonation: string;
  isAvailable: boolean;
  city: string;
  phone: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  is24h: boolean;
  phone: string;
  rating: number;
  medicines: MedicineStock[];
}

export interface MedicineStock {
  name: string;
  available: boolean;
  quantity?: number;
  price?: number;
}

export interface Lab {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  rating: number;
  phone: string;
  tests: LabTest[];
  openTime: string;
  closeTime: string;
}

export interface LabTest {
  id: string;
  name: string;
  price: number;
  turnaround: string;
  available: boolean;
}

export interface UberEstimate {
  lowFare: number;
  highFare: number;
  currency: string;
  etaMinutes: number;
  productName: string;
}

export interface VoiceCommand {
  intent: 'sos' | 'symptom_check' | 'find_hospital' | 'call_doctor' | 'blood_request' | 'navigate' | 'unknown';
  confidence: number;
  rawText: string;
  params?: Record<string, string>;
}

export interface ReminderTimeSlot {
  time: string; // HH:MM
  timing: 'Before Food' | 'After Food' | 'Anytime';
}

export interface MedicineReminder {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timeSlots: ReminderTimeSlot[];
  isCritical: boolean;
  currentStock: number;
  active: boolean;
}

export interface AdherenceLog {
  id: string;
  reminderId: string;
  medicineName: string;
  status: 'taken' | 'snoozed' | 'missed';
  loggedAt: string;
  scheduledTime: string;
}
