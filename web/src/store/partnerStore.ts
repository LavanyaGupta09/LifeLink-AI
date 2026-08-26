import { create } from 'zustand';
import { format, subDays, addDays } from 'date-fns';

export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  type: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Rescheduled';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  medicalId: string;
  lastVisit: string;
  avatar?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'pharmacy' | 'lab' | 'equipment';
  quantity: number;
  minQuantity: number;
  unit: string;
  price?: number;
  supplier?: string;
  expiryDate?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Maintenance Due';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface PartnerState {
  facility: {
    name: string;
    type: 'Hospital' | 'Laboratory' | 'Pharmacy';
    verified: boolean;
  };
  appointments: Appointment[];
  patients: Patient[];
  inventory: InventoryItem[];
  notifications: Notification[];
  
  // Actions
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updateInventoryStock: (id: string, quantityDelta: number) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const today = format(new Date(), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

export const usePartnerStore = create<PartnerState>((set) => ({
  facility: {
    name: 'CityCare Hospital',
    type: 'Hospital',
    verified: true,
  },
  
  appointments: [
    { id: '1', patientName: 'Rahul Sharma', patientId: 'P001', doctorName: 'Dr. Arjun Kapoor', department: 'Cardiology', date: today, time: '10:00 AM', type: 'Consultation', status: 'Confirmed' },
    { id: '2', patientName: 'Priya Patel', patientId: 'P002', doctorName: 'Dr. Sneha Iyer', department: 'Orthopedics', date: today, time: '11:30 AM', type: 'Consultation', status: 'Confirmed' },
    { id: '3', patientName: 'Amit Kumar', patientId: 'P003', doctorName: 'Dr. Rohan Das', department: 'General Medicine', date: today, time: '01:00 PM', type: 'Follow-up', status: 'Pending' },
    { id: '4', patientName: 'Neha Gupta', patientId: 'P004', doctorName: 'Dr. Meera Nair', department: 'Pediatrics', date: today, time: '02:30 PM', type: 'Checkup', status: 'Pending' },
    { id: '5', patientName: 'Vikram Singh', patientId: 'P005', doctorName: 'Dr. Arjun Kapoor', department: 'Cardiology', date: tomorrow, time: '09:00 AM', type: 'Consultation', status: 'Confirmed' },
    { id: '6', patientName: 'Anjali Desai', patientId: 'P006', doctorName: 'Dr. Sneha Iyer', department: 'Orthopedics', date: yesterday, time: '04:00 PM', type: 'Follow-up', status: 'Completed' },
  ],
  
  patients: [
    { id: 'P001', name: 'Rahul Sharma', age: 45, gender: 'Male', phone: '+91 9876543210', medicalId: 'MED-78901', lastVisit: yesterday },
    { id: 'P002', name: 'Priya Patel', age: 32, gender: 'Female', phone: '+91 9876543211', medicalId: 'MED-78902', lastVisit: format(subDays(new Date(), 5), 'yyyy-MM-dd') },
    { id: 'P003', name: 'Amit Kumar', age: 28, gender: 'Male', phone: '+91 9876543212', medicalId: 'MED-78903', lastVisit: format(subDays(new Date(), 12), 'yyyy-MM-dd') },
    { id: 'P004', name: 'Neha Gupta', age: 8, gender: 'Female', phone: '+91 9876543213', medicalId: 'MED-78904', lastVisit: format(subDays(new Date(), 30), 'yyyy-MM-dd') },
  ],

  inventory: [
    { id: 'I001', name: 'Paracetamol (500mg)', category: 'pharmacy', quantity: 45, minQuantity: 100, unit: 'strips', status: 'Low Stock' },
    { id: 'I002', name: 'Surgical Masks', category: 'pharmacy', quantity: 450, minQuantity: 200, unit: 'pcs', status: 'In Stock' },
    { id: 'I003', name: 'Hand Sanitizer', category: 'pharmacy', quantity: 120, minQuantity: 50, unit: 'bottles', status: 'In Stock' },
    { id: 'I004', name: 'Gloves (M)', category: 'pharmacy', quantity: 80, minQuantity: 100, unit: 'boxes', status: 'Low Stock' },
    { id: 'I005', name: 'CBC Test Kits', category: 'lab', quantity: 30, minQuantity: 50, unit: 'kits', status: 'Low Stock' },
    { id: 'I006', name: 'MRI Machine', category: 'equipment', quantity: 1, minQuantity: 1, unit: 'unit', status: 'Maintenance Due' },
  ],

  notifications: [
    { id: 'N1', title: 'Low stock alert', message: 'Paracetamol (500mg) is running low.', type: 'critical', timestamp: new Date(Date.now() - 1000 * 60 * 10), read: false, link: '/partner/inventory/pharmacy' },
    { id: 'N2', title: 'Lab test completed', message: '5 test reports are ready to view.', type: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 25), read: false, link: '/partner/inventory/lab' },
    { id: 'N3', title: 'New appointment', message: 'New appointment booked by Ravi Verma', type: 'info', timestamp: new Date(Date.now() - 1000 * 60 * 40), read: false, link: '/partner/appointments' },
    { id: 'N4', title: 'Payment received', message: 'Payment of ₹2,450 received', type: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 60), read: true, link: '/partner/payments' },
  ],

  addAppointment: (apt) => set((state) => ({
    appointments: [...state.appointments, { ...apt, id: Math.random().toString(36).substr(2, 9) }]
  })),

  updateAppointmentStatus: (id, status) => set((state) => ({
    appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a)
  })),

  addPatient: (patient) => set((state) => ({
    patients: [...state.patients, { ...patient, id: `P00${state.patients.length + 1}` }]
  })),

  updateInventoryStock: (id, quantityDelta) => set((state) => {
    return {
      inventory: state.inventory.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + quantityDelta;
          let newStatus = item.status;
          if (newQty <= 0) newStatus = 'Out of Stock';
          else if (newQty < item.minQuantity) newStatus = 'Low Stock';
          else newStatus = 'In Stock';
          return { ...item, quantity: newQty, status: newStatus };
        }
        return item;
      })
    };
  }),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),

  addNotification: (notif) => set((state) => ({
    notifications: [{ ...notif, id: Math.random().toString(36).substr(2, 9), timestamp: new Date(), read: false }, ...state.notifications]
  })),

}));
