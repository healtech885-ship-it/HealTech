import type { AppProfile, ModuleRecord, UserRole } from "@/types/app.types";

export const demoProfiles: Record<UserRole, AppProfile> = {
  admin: { id: "demo-admin", full_name: "Dr. Nadia Hassan", email: "admin@healtech.local", role: "admin", status: "active" },
  reception: { id: "demo-reception", full_name: "Mona Salem", email: "reception@healtech.local", role: "reception", status: "active" },
  doctor: { id: "demo-doctor", full_name: "Dr. Ahmed Kareem", email: "doctor@healtech.local", role: "doctor", status: "active" },
  lab: { id: "demo-lab", full_name: "Youssef Labib", email: "lab@healtech.local", role: "lab", status: "active" },
  pharmacy: { id: "demo-pharmacy", full_name: "Sara Amin", email: "pharmacy@healtech.local", role: "pharmacy", status: "active" },
  patient: { id: "demo-patient", full_name: "Omar Samir", email: "patient@healtech.local", role: "patient", status: "active" },
};

export const demoStats = [
  { label: "Patients", value: "1,284", helper: "+18 this week", tone: "info" },
  { label: "Visits today", value: "42", helper: "9 waiting", tone: "neutral" },
  { label: "Pending lab orders", value: "16", helper: "4 ready for review", tone: "warning" },
  { label: "Medicine orders", value: "23", helper: "7 partially dispensed", tone: "success" },
];

export const recordsByModule: Record<string, ModuleRecord[]> = {
  patients: [
    { MRN: "MRN-10042", Name: "Omar Samir", Department: "Engineering", Phone: "01000000001", Status: "active" },
    { MRN: "MRN-10043", Name: "Laila Adel", Department: "Business", Phone: "01000000002", Status: "active" },
    { MRN: "MRN-10044", Name: "Karim Nabil", Department: "Science", Phone: "01000000003", Status: "active" },
  ],
  visits: [
    { Code: "V-20260504-A1B2C3", Patient: "Omar Samir", Doctor: "Dr. Ahmed Kareem", Priority: "normal", Status: "queued" },
    { Code: "V-20260504-D4E5F6", Patient: "Laila Adel", Doctor: "Dr. Ahmed Kareem", Priority: "urgent", Status: "waiting_lab" },
    { Code: "V-20260504-G7H8I9", Patient: "Karim Nabil", Doctor: "Dr. Rana Fouad", Priority: "normal", Status: "completed" },
  ],
  employees: [
    { Code: "EMP-001", Name: "Dr. Ahmed Kareem", Role: "doctor", Department: "General Medicine", Status: "active" },
    { Code: "EMP-002", Name: "Mona Salem", Role: "reception", Department: "Administration", Status: "active" },
    { Code: "EMP-003", Name: "Sara Amin", Role: "pharmacy", Department: "Pharmacy", Status: "active" },
  ],
  departments: [
    { Name: "General Medicine", Employees: 8, Status: "active" },
    { Name: "Laboratory", Employees: 5, Status: "active" },
    { Name: "Pharmacy", Employees: 4, Status: "active" },
  ],
  "leave-requests": [
    { Employee: "Sara Amin", Type: "Annual", Dates: "May 10-12, 2026", Status: "pending" },
    { Employee: "Youssef Labib", Type: "Sick", Dates: "May 2, 2026", Status: "approved" },
  ],
  store: [
    { Item: "Digital Thermometer", Category: "Clinical Equipment", Available: 18, Status: "active" },
    { Item: "Blood Pressure Cuff", Category: "Clinical Equipment", Available: 9, Status: "active" },
  ],
  lab: [
    { Order: "LAB-2041", Patient: "Laila Adel", Tests: "CBC, FBG", Status: "pending_review" },
    { Order: "LAB-2042", Patient: "Omar Samir", Tests: "Urine Analysis", Status: "ordered" },
  ],
  pharmacy: [
    { Order: "MED-3301", Patient: "Karim Nabil", Items: "Paracetamol 500mg", Status: "ordered" },
    { Order: "MED-3302", Patient: "Omar Samir", Items: "ORS, Paracetamol", Status: "partially_dispensed" },
  ],
  medicines: [
    { Medicine: "Paracetamol 500mg", Category: "Analgesic", Stock: 230, Expiry: "2027-03-01", Status: "in_stock" },
    { Medicine: "Amoxicillin 500mg", Category: "Antibiotic", Stock: 8, Expiry: "2026-07-01", Status: "in_stock" },
    { Medicine: "Expired Cough Syrup", Category: "Respiratory", Stock: 0, Expiry: "2026-01-10", Status: "expired" },
  ],
  "lab-results": [
    { Visit: "V-20260504-D4E5F6", Test: "CBC", Result: "Submitted", Visible: "No", Status: "submitted" },
    { Visit: "V-20260422-Z9Y8X7", Test: "FBG", Result: "92 mg/dL", Visible: "Yes", Status: "reviewed" },
  ],
  "appointment-requests": [
    { Department: "General Medicine", Preferred: "May 12, 2026", Reason: "Follow-up", Status: "pending" },
  ],
};
