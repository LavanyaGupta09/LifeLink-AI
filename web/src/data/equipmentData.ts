// ============================================
// LIFELINK — MEDICAL EQUIPMENT MODULE
// Mock Data for Marketplace & B2B Dashboard
// ============================================

export type EquipmentCategory = 'Home Recovery' | 'Respiratory' | 'Patient Care';
export type EquipmentStatus = 'available' | 'rented' | 'sold' | 'maintenance';
export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered';
export type RentalStatus = 'active' | 'overdue' | 'returning' | 'returned';
export type MaintenanceStage = 'returned' | 'inspection' | 'sanitization' | 'maintenance' | 'cleared';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  serialNumber: string;
  condition: string;
  emoji: string;
  rentPrice: number; // per month
  buyPrice: number;
  securityDeposit: number;
  rating: number;
  reviewCount: number;
  status: EquipmentStatus;
  description: string;
  warranty: string;
  specs: string[];
  insuranceAdvisory: boolean;
}

export interface EquipmentOrder {
  id: string;
  equipmentId: string;
  equipmentName: string;
  customerName: string;
  customerPhone: string;
  orderType: 'rent' | 'buy';
  status: OrderStatus;
  amount: number;
  deposit: number;
  address: string;
  orderDate: string;
  deliveryDate: string;
  rentalDuration?: string;
}

export interface ActiveRental {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentEmoji: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  monthlyRate: number;
  deposit: number;
  status: RentalStatus;
}

export interface MaintenanceItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentEmoji: string;
  stage: MaintenanceStage;
  returnedDate: string;
  assignedTo: string;
  notes: string;
  damageReport: string;
  sanitizationCert: boolean;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  status: 'available' | 'on_delivery' | 'off_duty';
  currentDeliveryId?: string;
  rating: number;
}

export interface ProviderProfile {
  businessName: string;
  ownerName: string;
  gstNumber: string;
  licenseNumber: string;
  serviceAreas: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  joinedDate: string;
  rating: number;
  totalOrders: number;
  documentsUploaded: boolean;
}

// ============================================
// EQUIPMENT CATALOG (~15 items)
// ============================================
export const EQUIPMENT_CATALOG: Equipment[] = [
  // --- HOME RECOVERY ---
  {
    id: 'eq-001', name: 'Electric Hospital Bed', category: 'Home Recovery',
    brand: 'MedPro', serialNumber: 'MPB-2024-0891', condition: 'Excellent',
    emoji: '🛏️', rentPrice: 4500, buyPrice: 30000, securityDeposit: 5000,
    rating: 4.8, reviewCount: 124, status: 'available',
    description: 'Fully motorized hospital bed with adjustable head/foot sections, side rails, and IV pole attachment.',
    warranty: '2 Year Manufacturer Warranty',
    specs: ['Motor: Dual-actuator', 'Load: 200kg', 'Height: Adjustable 40-80cm', 'Rails: Collapsible'],
    insuranceAdvisory: true,
  },
  {
    id: 'eq-002', name: 'Manual Hospital Bed', category: 'Home Recovery',
    brand: 'CareFirst', serialNumber: 'CFB-2024-0432', condition: 'Good',
    emoji: '🛏️', rentPrice: 2500, buyPrice: 18000, securityDeposit: 3000,
    rating: 4.5, reviewCount: 89, status: 'available',
    description: 'Manual crank hospital bed with 3-section adjustment, detachable headboard, and castor wheels.',
    warranty: '1 Year Warranty',
    specs: ['Crank: 3-position', 'Load: 180kg', 'Mattress: Included', 'Wheels: Lockable'],
    insuranceAdvisory: true,
  },
  {
    id: 'eq-003', name: 'Lightweight Wheelchair', category: 'Home Recovery',
    brand: 'MobiCare', serialNumber: 'MCW-2024-1203', condition: 'Excellent',
    emoji: '🦽', rentPrice: 1500, buyPrice: 12000, securityDeposit: 2000,
    rating: 4.7, reviewCount: 201, status: 'available',
    description: 'Foldable aluminum wheelchair with padded armrests, footrests, and anti-tip wheels.',
    warranty: '1 Year Warranty',
    specs: ['Weight: 11kg', 'Load: 120kg', 'Width: 18"', 'Foldable: Yes'],
    insuranceAdvisory: true,
  },
  {
    id: 'eq-004', name: 'Foldable Walker', category: 'Home Recovery',
    brand: 'StepAid', serialNumber: 'SAW-2024-0567', condition: 'Good',
    emoji: '🚶', rentPrice: 800, buyPrice: 4500, securityDeposit: 1000,
    rating: 4.6, reviewCount: 156, status: 'available',
    description: 'Height-adjustable foldable walker with rubber-tipped legs and ergonomic hand grips.',
    warranty: '6 Month Warranty',
    specs: ['Height: 32-38"', 'Weight: 3kg', 'Load: 130kg', 'Grip: Foam padded'],
    insuranceAdvisory: false,
  },
  {
    id: 'eq-005', name: 'Commode Chair', category: 'Home Recovery',
    brand: 'CareFirst', serialNumber: 'CFC-2024-0789', condition: 'Excellent',
    emoji: '🪑', rentPrice: 1200, buyPrice: 7500, securityDeposit: 1500,
    rating: 4.4, reviewCount: 78, status: 'rented',
    description: 'Adjustable height commode chair with padded seat, splash guard, and removable bucket.',
    warranty: '6 Month Warranty',
    specs: ['Height: Adjustable', 'Load: 150kg', 'Bucket: Removable', 'Armrests: Padded'],
    insuranceAdvisory: false,
  },
  {
    id: 'eq-006', name: 'Patient Recliner', category: 'Home Recovery',
    brand: 'RestWell', serialNumber: 'RWR-2024-0234', condition: 'Good',
    emoji: '💺', rentPrice: 3000, buyPrice: 22000, securityDeposit: 4000,
    rating: 4.6, reviewCount: 65, status: 'available',
    description: 'Medical-grade recliner with infinite position lock, tray table, and side pockets.',
    warranty: '1 Year Warranty',
    specs: ['Recline: 0-180°', 'Load: 160kg', 'Tray: Detachable', 'Material: PU Leather'],
    insuranceAdvisory: true,
  },
  // --- RESPIRATORY ---
  {
    id: 'eq-007', name: '5L Oxygen Concentrator', category: 'Respiratory',
    brand: 'OxyPure', serialNumber: 'OPC-2024-1567', condition: 'Excellent',
    emoji: '🫁', rentPrice: 6000, buyPrice: 45000, securityDeposit: 8000,
    rating: 4.9, reviewCount: 312, status: 'available',
    description: 'Medical-grade 5L/min oxygen concentrator with adjustable flow, low noise operation, and oxygen purity alarm.',
    warranty: '3 Year Manufacturer Warranty',
    specs: ['Flow: 1-5 L/min', 'Purity: 93%±3%', 'Noise: <45dB', 'Weight: 14kg'],
    insuranceAdvisory: true,
  },
  {
    id: 'eq-008', name: 'Oxygen Cylinder (10L)', category: 'Respiratory',
    brand: 'MedGas', serialNumber: 'MGC-2024-0891', condition: 'Good',
    emoji: '🧪', rentPrice: 2000, buyPrice: 8000, securityDeposit: 3000,
    rating: 4.3, reviewCount: 95, status: 'available',
    description: 'Portable 10L medical oxygen cylinder with regulator, flow meter, and humidifier bottle.',
    warranty: 'Regulator: 1 Year',
    specs: ['Capacity: 10L', 'Pressure: 150 bar', 'Regulator: Included', 'Cart: Included'],
    insuranceAdvisory: true,
  },
  {
    id: 'eq-009', name: 'CPAP Machine', category: 'Respiratory',
    brand: 'SleepRight', serialNumber: 'SRC-2024-0345', condition: 'Excellent',
    emoji: '😴', rentPrice: 5000, buyPrice: 35000, securityDeposit: 6000,
    rating: 4.7, reviewCount: 178, status: 'rented',
    description: 'Auto-titrating CPAP machine with heated humidifier, ramp function, and data recording for sleep apnea therapy.',
    warranty: '2 Year Warranty',
    specs: ['Pressure: 4-20 cmH₂O', 'Mode: Auto/Fixed', 'Humidifier: Heated', 'Data: SD Card'],
    insuranceAdvisory: true,
  },
  {
    id: 'eq-010', name: 'BiPAP Machine', category: 'Respiratory',
    brand: 'SleepRight', serialNumber: 'SRB-2024-0678', condition: 'Good',
    emoji: '💨', rentPrice: 8000, buyPrice: 55000, securityDeposit: 10000,
    rating: 4.8, reviewCount: 92, status: 'maintenance',
    description: 'Bi-level positive airway pressure device with S/T mode, leak compensation, and compliance tracking.',
    warranty: '2 Year Warranty',
    specs: ['IPAP: 4-30 cmH₂O', 'EPAP: 4-25 cmH₂O', 'Mode: S/T/CPAP', 'Display: Color LCD'],
    insuranceAdvisory: true,
  },
  // --- PATIENT CARE ---
  {
    id: 'eq-011', name: 'Patient Monitor', category: 'Patient Care',
    brand: 'VitalTrack', serialNumber: 'VTM-2024-0912', condition: 'Excellent',
    emoji: '📟', rentPrice: 3500, buyPrice: 28000, securityDeposit: 5000,
    rating: 4.6, reviewCount: 143, status: 'available',
    description: 'Multi-parameter patient monitor tracking SpO2, ECG, NIBP, temperature, and respiration rate.',
    warranty: '2 Year Warranty',
    specs: ['Screen: 8" Color', 'SpO2: Finger probe', 'ECG: 3-lead', 'Battery: 4hr backup'],
    insuranceAdvisory: true,
  },
  {
    id: 'eq-012', name: 'Suction Machine', category: 'Patient Care',
    brand: 'MedPro', serialNumber: 'MPS-2024-0456', condition: 'Good',
    emoji: '🔧', rentPrice: 2500, buyPrice: 15000, securityDeposit: 3000,
    rating: 4.5, reviewCount: 67, status: 'available',
    description: 'Portable suction machine with adjustable vacuum pressure, overflow protection, and autoclavable jar.',
    warranty: '1 Year Warranty',
    specs: ['Vacuum: 0-80 kPa', 'Jar: 1000ml', 'Noise: <60dB', 'Weight: 5kg'],
    insuranceAdvisory: false,
  },
  {
    id: 'eq-013', name: 'Anti-Decubitus Air Mattress', category: 'Patient Care',
    brand: 'CareFirst', serialNumber: 'CFM-2024-1089', condition: 'Excellent',
    emoji: '🛌', rentPrice: 2000, buyPrice: 12000, securityDeposit: 2500,
    rating: 4.7, reviewCount: 198, status: 'available',
    description: 'Alternating pressure air mattress with adjustable pump, low-air-loss cells, and CPR quick-release valve.',
    warranty: '1 Year Warranty',
    specs: ['Cells: 20 tubular', 'Cycle: 10 min', 'Pump: Quiet <30dB', 'Load: 150kg'],
    insuranceAdvisory: true,
  },
  {
    id: 'eq-014', name: 'Nebulizer Machine', category: 'Patient Care',
    brand: 'BreathEZ', serialNumber: 'BEN-2024-0234', condition: 'Good',
    emoji: '🌬️', rentPrice: 800, buyPrice: 3500, securityDeposit: 800,
    rating: 4.4, reviewCount: 256, status: 'available',
    description: 'Compressor nebulizer with adult and child masks, medicine cup, and air tube.',
    warranty: '1 Year Warranty',
    specs: ['Type: Compressor', 'Rate: 0.2ml/min', 'Particle: <5μm', 'Masks: Adult+Child'],
    insuranceAdvisory: false,
  },
  {
    id: 'eq-015', name: 'Pulse Oximeter (Tabletop)', category: 'Patient Care',
    brand: 'VitalTrack', serialNumber: 'VTO-2024-0567', condition: 'Excellent',
    emoji: '💓', rentPrice: 600, buyPrice: 4000, securityDeposit: 800,
    rating: 4.5, reviewCount: 320, status: 'sold',
    description: 'Tabletop pulse oximeter with large color display, audio/visual alarms, and trend recording.',
    warranty: '1 Year Warranty',
    specs: ['SpO2 Range: 0-100%', 'PR Range: 30-250bpm', 'Display: 3.5" LCD', 'Alarm: Adjustable'],
    insuranceAdvisory: false,
  },
];

// ============================================
// ACTIVE ORDERS
// ============================================
export const MOCK_ORDERS: EquipmentOrder[] = [
  {
    id: 'ORD-3001', equipmentId: 'eq-001', equipmentName: 'Electric Hospital Bed',
    customerName: 'Rajesh Kumar', customerPhone: '+91 98765 43210',
    orderType: 'rent', status: 'new', amount: 4500, deposit: 5000,
    address: '42, MG Road, Bengaluru 560001',
    orderDate: '2026-08-19', deliveryDate: '2026-08-21', rentalDuration: '1 month',
  },
  {
    id: 'ORD-3002', equipmentId: 'eq-007', equipmentName: '5L Oxygen Concentrator',
    customerName: 'Priya Sharma', customerPhone: '+91 87654 32109',
    orderType: 'rent', status: 'confirmed', amount: 6000, deposit: 8000,
    address: '15, Sector 22, Noida 201301',
    orderDate: '2026-08-18', deliveryDate: '2026-08-20', rentalDuration: '3 months',
  },
  {
    id: 'ORD-3003', equipmentId: 'eq-003', equipmentName: 'Lightweight Wheelchair',
    customerName: 'Amit Patel', customerPhone: '+91 76543 21098',
    orderType: 'buy', status: 'preparing', amount: 12000, deposit: 0,
    address: '78, Park Street, Kolkata 700016',
    orderDate: '2026-08-17', deliveryDate: '2026-08-22',
  },
  {
    id: 'ORD-3004', equipmentId: 'eq-011', equipmentName: 'Patient Monitor',
    customerName: 'Dr. Meena Iyer', customerPhone: '+91 65432 10987',
    orderType: 'rent', status: 'dispatched', amount: 3500, deposit: 5000,
    address: '33, Anna Nagar, Chennai 600040',
    orderDate: '2026-08-16', deliveryDate: '2026-08-19', rentalDuration: '15 days',
  },
  {
    id: 'ORD-3005', equipmentId: 'eq-013', equipmentName: 'Anti-Decubitus Air Mattress',
    customerName: 'Sunita Devi', customerPhone: '+91 54321 09876',
    orderType: 'buy', status: 'delivered', amount: 12000, deposit: 0,
    address: '101, Civil Lines, Jaipur 302006',
    orderDate: '2026-08-14', deliveryDate: '2026-08-17',
  },
];

// ============================================
// ACTIVE RENTALS
// ============================================
export const MOCK_RENTALS: ActiveRental[] = [
  {
    id: 'RNT-5001', equipmentId: 'eq-005', equipmentName: 'Commode Chair', equipmentEmoji: '🪑',
    customerName: 'Vikram Singh', customerPhone: '+91 99887 76655',
    startDate: '2026-07-20', endDate: '2026-08-20', daysRemaining: 1,
    monthlyRate: 1200, deposit: 1500, status: 'active',
  },
  {
    id: 'RNT-5002', equipmentId: 'eq-009', equipmentName: 'CPAP Machine', equipmentEmoji: '😴',
    customerName: 'Anita Desai', customerPhone: '+91 88776 65544',
    startDate: '2026-08-01', endDate: '2026-10-31', daysRemaining: 73,
    monthlyRate: 5000, deposit: 6000, status: 'active',
  },
  {
    id: 'RNT-5003', equipmentId: 'eq-001', equipmentName: 'Electric Hospital Bed', equipmentEmoji: '🛏️',
    customerName: 'Mohan Lal', customerPhone: '+91 77665 54433',
    startDate: '2026-07-01', endDate: '2026-08-15', daysRemaining: -4,
    monthlyRate: 4500, deposit: 5000, status: 'overdue',
  },
  {
    id: 'RNT-5004', equipmentId: 'eq-007', equipmentName: '5L Oxygen Concentrator', equipmentEmoji: '🫁',
    customerName: 'Kavita Reddy', customerPhone: '+91 66554 43322',
    startDate: '2026-08-05', endDate: '2026-09-05', daysRemaining: 17,
    monthlyRate: 6000, deposit: 8000, status: 'active',
  },
];

// ============================================
// MAINTENANCE PIPELINE
// ============================================
export const MOCK_MAINTENANCE: MaintenanceItem[] = [
  {
    id: 'MNT-7001', equipmentId: 'eq-002', equipmentName: 'Manual Hospital Bed', equipmentEmoji: '🛏️',
    stage: 'returned', returnedDate: '2026-08-18', assignedTo: 'Tech Team A',
    notes: 'Customer reported squeaky wheels', damageReport: 'Minor wheel bearing wear',
    sanitizationCert: false,
  },
  {
    id: 'MNT-7002', equipmentId: 'eq-004', equipmentName: 'Foldable Walker', equipmentEmoji: '🚶',
    stage: 'inspection', returnedDate: '2026-08-16', assignedTo: 'Ravi Kumar',
    notes: 'Routine return — 3 month rental ended', damageReport: 'No visible damage',
    sanitizationCert: false,
  },
  {
    id: 'MNT-7003', equipmentId: 'eq-012', equipmentName: 'Suction Machine', equipmentEmoji: '🔧',
    stage: 'sanitization', returnedDate: '2026-08-14', assignedTo: 'Hygiene Team',
    notes: 'Deep clean required — used in home ICU setting', damageReport: 'Jar hinge slightly loose',
    sanitizationCert: false,
  },
  {
    id: 'MNT-7004', equipmentId: 'eq-014', equipmentName: 'Nebulizer Machine', equipmentEmoji: '🌬️',
    stage: 'maintenance', returnedDate: '2026-08-12', assignedTo: 'Tech Team B',
    notes: 'Compressor motor servicing', damageReport: 'Motor running slow — needs part replacement',
    sanitizationCert: true,
  },
  {
    id: 'MNT-7005', equipmentId: 'eq-006', equipmentName: 'Patient Recliner', equipmentEmoji: '💺',
    stage: 'cleared', returnedDate: '2026-08-10', assignedTo: 'Quality Check',
    notes: 'All checks passed — ready for next rental', damageReport: 'None',
    sanitizationCert: true,
  },
];

// ============================================
// DELIVERY PERSONNEL
// ============================================
export const MOCK_DELIVERY_PERSONNEL: DeliveryPerson[] = [
  { id: 'DLV-01', name: 'Suresh Yadav', phone: '+91 98765 00001', vehicleType: 'Cargo Van', vehicleNumber: 'DL-4C-AB-1234', status: 'available', rating: 4.8 },
  { id: 'DLV-02', name: 'Rahul Mehra', phone: '+91 98765 00002', vehicleType: 'Tempo', vehicleNumber: 'MH-02-CD-5678', status: 'on_delivery', currentDeliveryId: 'ORD-3004', rating: 4.6 },
  { id: 'DLV-03', name: 'Deepak Joshi', phone: '+91 98765 00003', vehicleType: 'Cargo Van', vehicleNumber: 'KA-01-EF-9012', status: 'available', rating: 4.9 },
  { id: 'DLV-04', name: 'Manoj Tiwari', phone: '+91 98765 00004', vehicleType: 'Pickup Truck', vehicleNumber: 'UP-32-GH-3456', status: 'off_duty', rating: 4.5 },
];

// ============================================
// REVENUE & ANALYTICS
// ============================================
export const MOCK_REVENUE = {
  totalRentalRevenue: 245000,
  totalSalesRevenue: 189000,
  activeDeposits: 87000,
  pendingRefunds: 12500,
  todayRevenue: 18500,
  monthlyBreakdown: [
    { month: 'Mar', rental: 32000, sales: 24000 },
    { month: 'Apr', rental: 38000, sales: 18000 },
    { month: 'May', rental: 41000, sales: 35000 },
    { month: 'Jun', rental: 45000, sales: 28000 },
    { month: 'Jul', rental: 48000, sales: 42000 },
    { month: 'Aug', rental: 41000, sales: 42000 },
  ],
  topRentedItems: [
    { name: 'Electric Hospital Bed', count: 45 },
    { name: '5L Oxygen Concentrator', count: 38 },
    { name: 'CPAP Machine', count: 32 },
    { name: 'Wheelchair', count: 28 },
    { name: 'Air Mattress', count: 24 },
  ],
  topPurchasedItems: [
    { name: 'Nebulizer Machine', count: 67 },
    { name: 'Pulse Oximeter', count: 54 },
    { name: 'Foldable Walker', count: 41 },
    { name: 'Wheelchair', count: 35 },
    { name: 'Commode Chair', count: 29 },
  ],
};

export const MOCK_REVIEWS = [
  { id: 'r1', customerName: 'Rajesh K.', rating: 5, text: 'The hospital bed was delivered within 24 hours. Excellent setup service!', date: '2026-08-15', equipmentName: 'Electric Hospital Bed' },
  { id: 'r2', customerName: 'Priya S.', rating: 4, text: 'Oxygen concentrator works perfectly. Slightly noisy at night but manageable.', date: '2026-08-12', equipmentName: '5L Oxygen Concentrator' },
  { id: 'r3', customerName: 'Amit P.', rating: 5, text: 'Wheelchair is lightweight and folds easily. Very happy with the purchase.', date: '2026-08-10', equipmentName: 'Lightweight Wheelchair' },
  { id: 'r4', customerName: 'Sunita D.', rating: 4, text: 'Air mattress has been a lifesaver for my father. Quiet pump operation.', date: '2026-08-08', equipmentName: 'Anti-Decubitus Air Mattress' },
];

// ============================================
// PROVIDER PROFILE
// ============================================
export const MOCK_PROVIDER: ProviderProfile = {
  businessName: 'MedEquip Solutions Pvt. Ltd.',
  ownerName: 'Dr. Arjun Kapoor',
  gstNumber: '29AABCU9603R1ZM',
  licenseNumber: 'MHLC-KA-2024-0892',
  serviceAreas: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli-Dharwad'],
  verificationStatus: 'verified',
  joinedDate: '2025-11-15',
  rating: 4.7,
  totalOrders: 1284,
  documentsUploaded: true,
};

// ============================================
// RENTAL DURATION OPTIONS
// ============================================
export const RENTAL_DURATIONS = [
  { label: '7 Days', value: '7d', multiplier: 0.3 },
  { label: '15 Days', value: '15d', multiplier: 0.55 },
  { label: '1 Month', value: '1m', multiplier: 1 },
  { label: '3 Months', value: '3m', multiplier: 2.7 },
];
