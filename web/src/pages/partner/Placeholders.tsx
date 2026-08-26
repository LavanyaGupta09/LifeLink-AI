import React from 'react';

const PlaceholderPage: React.FC<{ title: string; mockData: any[] }> = ({ title, mockData }) => (
  <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full h-full">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <p className="text-sm text-slate-400 mt-1">Manage and view {title.toLowerCase()}</p>
      </div>
      <button className="bg-[#131b2f] border border-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all w-full md:w-auto">
        + Add New
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar">
      {mockData.map((item, i) => (
        <div key={i} className="bg-[#0B1221] border border-slate-800 rounded-2xl p-5 flex flex-col gap-2 hover:border-slate-700 transition-colors">
          <div className="font-bold text-white text-base">{item.title}</div>
          <div className="text-sm text-slate-400">{item.desc}</div>
          {item.status && (
            <div className="mt-2 inline-flex px-2 py-1 rounded bg-[#131b2f] text-xs font-bold text-slate-300 w-max border border-slate-700">
              {item.status}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const AppointmentsPage = () => <PlaceholderPage title="Appointments Management" mockData={[]} />;
export const PatientsPage = () => <PlaceholderPage title="Patient Directory" mockData={[]} />;
export const ServicesPage = () => <PlaceholderPage title="Services & Departments" mockData={[
  { title: 'Cardiology', desc: 'Heart and vascular care', status: 'Active' },
  { title: 'Orthopedics', desc: 'Bone and joint care', status: 'Active' },
  { title: 'Pediatrics', desc: 'Child health care', status: 'Active' }
]} />;
export const StaffPage = () => <PlaceholderPage title="Staff Management" mockData={[
  { title: 'Dr. Arjun Kapoor', desc: 'Senior Cardiologist', status: 'On Duty' },
  { title: 'Dr. Sneha Iyer', desc: 'Orthopedic Surgeon', status: 'Off Duty' },
  { title: 'Nurse Rita', desc: 'Head Nurse - ICU', status: 'On Duty' }
]} />;
export const PharmacyInventoryPage = () => <PlaceholderPage title="Pharmacy Inventory" mockData={[]} />;
export const LabInventoryPage = () => <PlaceholderPage title="Lab Consumables" mockData={[
  { title: 'Blood Test Tubes (Red)', desc: '100 units remaining', status: 'Low Stock' },
  { title: 'Petri Dishes', desc: '450 units remaining', status: 'In Stock' },
  { title: 'Microscope Slides', desc: '50 units remaining', status: 'Out of Stock' }
]} />;
export const EquipmentPage = () => <PlaceholderPage title="Medical Equipment" mockData={[
  { title: 'MRI Scanner', desc: 'Siemens Healthineers', status: 'Operational' },
  { title: 'Ultrasound Machine', desc: 'GE Healthcare', status: 'Maintenance Due' },
  { title: 'Defibrillator', desc: 'Philips', status: 'Operational' }
]} />;
export const AlertsPage = () => <PlaceholderPage title="Stock Alerts" mockData={[
  { title: 'Low Stock: Paracetamol', desc: 'Current: 45 strips, Min: 100', status: 'Warning' },
  { title: 'Low Stock: CBC Kits', desc: 'Current: 30 kits, Min: 50', status: 'Warning' }
]} />;
export const BillingPage = () => <PlaceholderPage title="Billing & Invoices" mockData={[]} />;
export const PaymentsPage = () => <PlaceholderPage title="Payments & Revenue" mockData={[
  { title: 'Payment Recv - INV-001', desc: 'Amount: ₹2450', status: 'Completed' },
  { title: 'Payment Recv - INV-003', desc: 'Amount: ₹1200', status: 'Completed' },
  { title: 'Pending - INV-002', desc: 'Amount: ₹8500', status: 'Pending' }
]} />;
export const InsuranceClaimsPage = () => <PlaceholderPage title="Insurance Claims" mockData={[
  { title: 'Claim #C-99120', desc: 'Patient: Rahul Sharma, Provider: HDFC ERGO', status: 'Approved' },
  { title: 'Claim #C-99121', desc: 'Patient: Priya Patel, Provider: Star Health', status: 'Processing' }
]} />;
export const ReportsPage = () => <PlaceholderPage title="Reports & Analytics" mockData={[
  { title: 'Monthly Revenue Report', desc: 'Generated on Aug 1, 2026', status: 'Ready' },
  { title: 'Patient Demographics', desc: 'Generated on Aug 15, 2026', status: 'Ready' }
]} />;
export const FacilityProfilePage = () => <PlaceholderPage title="Facility Profile" mockData={[
  { title: 'CityCare Hospital', desc: 'Main Branch - Downtown', status: 'Verified' },
  { title: 'Licenses & Certifications', desc: 'NABH Accredited', status: 'Active' }
]} />;
export const SettingsPage = () => <PlaceholderPage title="Facility Settings" mockData={[
  { title: 'Notification Preferences', desc: 'Manage email and SMS alerts', status: 'Enabled' },
  { title: 'User Access Control', desc: 'Manage roles and permissions', status: 'Configured' }
]} />;
