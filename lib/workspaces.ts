import type { UserRole } from "@/types/app.types";

export type FieldType = "text" | "email" | "password" | "number" | "date" | "time" | "textarea" | "select" | "checkbox";
export type ReferenceKey = "patients" | "doctors" | "profiles" | "employees" | "departments" | "visits" | "labOrders" | "labTests" | "labOrderItems" | "medicineNames" | "medicineOrderItems" | "storeItems";
export type WorkspaceFilterOperator = "eq" | "lte" | "lt";

export type WorkspaceFilter = {
  column: string;
  operator: WorkspaceFilterOperator;
  value: string | number | boolean;
};

export type WorkspaceField = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: string[];
  reference?: ReferenceKey;
  placeholder?: string;
  step?: string;
};

export type WorkspaceAction =
  | { kind: "none" }
  | { kind: "insert"; table: string; success: string }
  | { kind: "update"; table: string; idField: string; success: string }
  | { kind: "function"; name: string; success: string };

export type WorkspaceMode = "list" | "create" | "details" | "edit" | "settings" | "reports" | "store-request-details" | "patient-details" | "appointment-request-details" | "create-visit";

export type WorkspaceConfig = {
  title: string;
  eyebrow: string;
  description: string;
  table: string;
  select: string;
  orderBy?: string;
  mode?: WorkspaceMode;
  recordId?: string;
  recordIdField?: string;
  detailSelect?: string;
  rowLink?: {
    hrefBase: string;
    idField?: string;
    label: string;
  };
  hiddenColumns?: string[];
  columnLabels?: Record<string, string>;
  actionLabel: string;
  action: WorkspaceAction;
  fields: WorkspaceField[];
  filters?: WorkspaceFilter[];
  dashboard?: boolean;
  readonly?: boolean;
};

const defaultByRole: Record<UserRole, WorkspaceConfig> = {
  admin: {
    title: "Administration Dashboard",
    eyebrow: "System overview",
    description: "Live operational counters, employees, patients, visits, stock, and pending work.",
    table: "profiles",
    select: "id,full_name,email,role,status,created_at",
    orderBy: "created_at",
    actionLabel: "Create Employee",
    action: { kind: "function", name: "create-employee", success: "Employee account created" },
    fields: employeeFields(),
    dashboard: true,
  },
  reception: {
    title: "Reception Dashboard",
    eyebrow: "Front desk workflow",
    description: "Register patients, search records, create visits, and manage the waiting queue.",
    table: "visits",
    select: receptionVisitSelect(),
    orderBy: "created_at",
    hiddenColumns: ["id", "patient_id", "doctor_id"],
    columnLabels: receptionVisitColumnLabels(),
    actionLabel: "Create Visit",
    action: { kind: "function", name: "create-visit", success: "Visit created and assigned" },
    fields: visitFields(),
    dashboard: true,
  },
  doctor: {
    title: "Doctor Dashboard",
    eyebrow: "Clinical queue",
    description: "Open assigned visits, record diagnosis, order labs or medicines, and complete visits.",
    table: "visits",
    select: "id,visit_code,patient_id,doctor_id,status,priority,chief_complaint,symptoms,diagnosis,disease,doctor_instructions,created_at",
    orderBy: "created_at",
    actionLabel: "Save Visit Progress",
    action: { kind: "function", name: "update-visit", success: "Visit updated" },
    fields: updateVisitFields(),
    dashboard: true,
  },
  lab: {
    title: "Laboratory Dashboard",
    eyebrow: "Diagnostic workflow",
    description: "View lab orders, enter result values, and submit completed diagnostic work.",
    table: "lab_orders",
    select: "id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at",
    orderBy: "created_at",
    actionLabel: "Submit Lab Results",
    action: { kind: "function", name: "submit-lab-results", success: "Lab results submitted" },
    fields: labResultFields(),
    dashboard: true,
  },
  pharmacy: {
    title: "Pharmacy Dashboard",
    eyebrow: "Stock and dispensing",
    description: "Manage medicine catalog, stock batches, medicine orders, and safe dispensing.",
    table: "medicine_orders",
    select: "id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at",
    orderBy: "created_at",
    actionLabel: "Dispense Medicine",
    action: { kind: "function", name: "dispense-medicine", success: "Medicine dispensed and stock reduced" },
    fields: dispenseFields(),
    dashboard: true,
  },
  patient: {
    title: "Patient Portal",
    eyebrow: "Personal health access",
    description: "View your profile, visit status, approved lab results, prescribed medicines, and appointment requests.",
    table: "visits",
    select: "id,visit_code,patient_id,doctor_id,status,priority,doctor_instructions,created_at,completed_at",
    orderBy: "created_at",
    actionLabel: "Request Appointment",
    action: { kind: "insert", table: "appointment_requests", success: "Appointment request submitted" },
    fields: appointmentFields(),
    dashboard: true,
  },
};

export function getWorkspaceConfig(role: UserRole, segments?: string[]): WorkspaceConfig {
  const base = defaultByRole[role];
  const path = (segments ?? ["dashboard"]).join("/");
  const first = segments?.[0] ?? "dashboard";
  const employeeId = role === "admin" && segments?.[0] === "employees" && segments[1] !== "new" && segments[1] !== "edit" ? segments[1] : undefined;
  const editEmployeeId = role === "admin" && segments?.[0] === "employees" && segments[1] === "edit" ? segments[2] : undefined;
  const storeRequestId = role === "admin" && segments?.[0] === "store" && segments[1] === "requests" ? segments[2] : undefined;
  const receptionPatientId = role === "reception" && segments?.[0] === "patients" && segments[1] !== "new" ? segments[1] : undefined;
  const receptionAppointmentRequestId = role === "reception" && segments?.[0] === "appointment-requests" ? segments[1] : undefined;

  if (first === "dashboard") return base;

  const overrides: Record<string, WorkspaceConfig> = {
    "admin/employees": { ...base, title: "Employees", table: "employees", select: employeeSelect(), detailSelect: employeeSelect(), orderBy: "created_at", mode: "list", rowLink: { hrefBase: "/admin/employees", idField: "id", label: "Open" }, hiddenColumns: ["id", "profile_id", "department_id"], columnLabels: employeeColumnLabels(), actionLabel: "Create Employee", action: { kind: "function", name: "create-employee", success: "Employee account created" }, fields: employeeFields(), dashboard: false },
    "admin/employees/new": { ...base, title: "Add Employee", table: "employees", select: employeeSelect(), detailSelect: employeeSelect(), mode: "create", actionLabel: "Create Employee", action: { kind: "function", name: "create-employee", success: "Employee account created" }, fields: employeeFields(), dashboard: false },
    "admin/departments": { ...base, title: "Departments", table: "departments", select: `id,name,description,status,created_at`, actionLabel: "Add Department", action: { kind: "insert", table: "departments", success: "Department added" }, fields: departmentFields(), dashboard: false },
    "admin/patients": { ...base, title: "Patients", table: "patients", select: "id,full_name,student_id,mrn,gender,birth_date,phone,status,created_at", actionLabel: "Register Patient", action: { kind: "function", name: "create-patient", success: "Patient registered" }, fields: patientFields(), dashboard: false },
    "admin/visits": { ...base, title: "Visits", table: "visits", select: defaultByRole.doctor.select, actionLabel: "Create Visit", action: { kind: "function", name: "create-visit", success: "Visit created" }, fields: visitFields(), dashboard: false },
    "admin/leave-requests": { ...base, title: "Leave Requests", table: "leave_requests", select: "id,employee_profile_id,leave_type,start_date,end_date,reason,status,admin_comment,reviewed_by,reviewed_at,created_at", actionLabel: "Review Leave Request", action: { kind: "function", name: "review-leave-request", success: "Leave request reviewed" }, fields: reviewLeaveFields(), dashboard: false },
    "admin/store/items": { ...base, title: "Store Items", table: "store_items", select: "id,name,category,manufacturer,description,status,created_at", actionLabel: "Add Store Item", action: { kind: "insert", table: "store_items", success: "Store item added" }, fields: storeItemFields(), hiddenColumns: ["id"], columnLabels: storeItemColumnLabels(), dashboard: false },
    "admin/store/batches": { ...base, title: "Store Stock", table: "store_item_batches", select: "id,store_item_id,quantity,unit_price,receipt_number,created_by,created_at,store_items(name,category,status),profiles(full_name,email)", orderBy: "created_at", actionLabel: "Add Stock Batch", action: { kind: "function", name: "add-store-item-batch", success: "Store stock batch added" }, fields: storeBatchFields(), hiddenColumns: ["id", "store_item_id", "created_by"], columnLabels: storeBatchColumnLabels(), dashboard: false },
    "admin/store/assignments": { ...base, title: "Store Assignments", table: "store_assignments", select: "id,store_item_id,assigned_to,assigned_by,quantity,status,notes,assigned_at,returned_at,created_at", actionLabel: "Assign Store Item", action: { kind: "function", name: "assign-store-item", success: "Store item assigned" }, fields: assignStoreFields(), dashboard: false },
    "admin/store/requests": { ...base, title: "Store Requests", table: "store_requests", select: storeRequestSelect(), detailSelect: storeRequestSelect(), orderBy: "created_at", rowLink: { hrefBase: "/admin/store/requests", idField: "id", label: "Open" }, hiddenColumns: ["id", "requested_by", "store_item_id", "reviewed_by"], columnLabels: storeRequestColumnLabels(), actionLabel: "Create Store Request", action: { kind: "function", name: "create-store-request", success: "Store request created" }, fields: storeRequestFields(), dashboard: false },
    "admin/reports": { ...base, title: "Reports", table: "audit_logs", select: "id,actor_id,action,entity_type,entity_id,metadata,created_at", mode: "reports", actionLabel: "Reports are read-only", action: { kind: "none" }, fields: [], dashboard: false, readonly: true },
    "admin/audit-logs": { ...base, title: "Audit Logs", table: "audit_logs", select: "id,actor_id,action,entity_type,entity_id,metadata,created_at", actionLabel: "Audit logs are read-only", action: { kind: "none" }, fields: [], dashboard: false, readonly: true },
    "admin/settings": { ...base, title: "Clinic Settings", table: "clinic_settings", select: "key,value,updated_by,updated_at,profiles(full_name,email)", mode: "settings", actionLabel: "Save Settings", action: { kind: "function", name: "update-clinic-settings", success: "Clinic settings saved" }, fields: clinicSettingsFields(), filters: [{ column: "key", operator: "eq", value: "general" }], dashboard: false },

    "reception/patients": { ...defaultByRole.reception, title: "Patient Search and Registration", table: "patients", select: patientSelect(), detailSelect: patientSelect(), rowLink: { hrefBase: "/reception/patients", idField: "id", label: "Open" }, hiddenColumns: ["id", "profile_id", "department_id", "department", "departments", "dorm_info", "emergency_phone", "nationality", "blood_type", "address"], columnLabels: patientColumnLabels(), actionLabel: "Register Patient", action: { kind: "function", name: "create-patient", success: "Patient registered" }, fields: patientFields(), dashboard: false },
    "reception/patients/new": { ...defaultByRole.reception, title: "New Patient", table: "patients", select: patientSelect(), detailSelect: patientSelect(), hiddenColumns: ["id", "profile_id", "department_id", "department", "departments", "dorm_info", "emergency_phone", "nationality", "blood_type", "address"], columnLabels: patientColumnLabels(), actionLabel: "Register Patient", action: { kind: "function", name: "create-patient", success: "Patient registered" }, fields: patientFields(), dashboard: false },
    "reception/visits": { ...defaultByRole.reception, title: "Queued Visits", table: "visits", select: defaultByRole.reception.select, filters: [{ column: "status", operator: "eq", value: "queued" }], actionLabel: "Create Visit", action: { kind: "function", name: "create-visit", success: "Visit created" }, fields: visitFields(), dashboard: false },
    "reception/visits/new": { ...defaultByRole.reception, title: "Create Visit", description: "Create a queued visit for a registered patient and assign it to a doctor.", table: "visits", select: defaultByRole.reception.select, mode: "create-visit", actionLabel: "Create Visit", action: { kind: "function", name: "create-visit", success: "Visit created" }, fields: visitFields(), dashboard: false },
    "reception/appointment-requests": { ...defaultByRole.reception, title: "Appointment Requests", table: "appointment_requests", select: appointmentRequestSelect(), detailSelect: appointmentRequestSelect(), orderBy: "created_at", rowLink: { hrefBase: "/reception/appointment-requests", idField: "id", label: "Open" }, hiddenColumns: ["id", "patient_id", "requested_department_id", "reviewed_by"], columnLabels: appointmentRequestColumnLabels(), actionLabel: "Appointment requests are reviewed from details", action: { kind: "none" }, fields: [], dashboard: false, readonly: true },

    "doctor/visits": defaultByRole.doctor,
    "doctor/lab-orders": { ...defaultByRole.doctor, title: "Order Lab Tests", table: "lab_orders", select: "id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at", actionLabel: "Order Lab Tests", action: { kind: "function", name: "order-lab-tests", success: "Lab order created" }, fields: labOrderFields(), dashboard: false },
    "doctor/visits/completed": { ...defaultByRole.doctor, title: "Completed Visits", dashboard: false, filters: [{ column: "status", operator: "eq", value: "completed" }] },
    "doctor/lab-results": { ...defaultByRole.doctor, title: "Lab Results Review", table: "lab_order_items", select: "id,lab_order_id,lab_test_id,result_value,result_notes,status,visible_to_patient,entered_at,reviewed_at,created_at", actionLabel: "Approve For Patient", action: { kind: "function", name: "approve-lab-result-for-patient", success: "Lab results approved for patient portal" }, fields: approveLabFields(), dashboard: false },
    "doctor/medicine-orders": { ...defaultByRole.doctor, title: "Prescribe Medicines", table: "medicine_orders", select: "id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at", actionLabel: "Order Medicines", action: { kind: "function", name: "order-medicines", success: "Medicine order created" }, fields: medicineOrderFields(), dashboard: false },

    "lab/orders": defaultByRole.lab,
    "lab/orders/pending": { ...defaultByRole.lab, title: "Pending Lab Results", dashboard: false, filters: [{ column: "status", operator: "eq", value: "ordered" }] },
    "lab/orders/completed": { ...defaultByRole.lab, title: "Completed Lab Orders", dashboard: false, filters: [{ column: "status", operator: "eq", value: "completed" }] },
    "lab/tests": { ...defaultByRole.lab, title: "Lab Test Types", table: "lab_tests", select: "id,name,code,description,normal_range,unit,status,created_at", actionLabel: "Add Lab Test", action: { kind: "insert", table: "lab_tests", success: "Lab test type added" }, fields: labTestFields(), dashboard: false },

    "pharmacy/orders": defaultByRole.pharmacy,
    "pharmacy/medicines": { ...defaultByRole.pharmacy, title: "Medicine Stock", table: "medicine_batches", select: "id,medicine_name_id,batch_number,receipt_number,manufacturer,quantity,unit_price,expiry_date,status,created_at", actionLabel: "Add Medicine Batch", action: { kind: "insert", table: "medicine_batches", success: "Medicine batch added" }, fields: medicineBatchFields(), dashboard: false },
    "pharmacy/medicines/new": { ...defaultByRole.pharmacy, title: "New Medicine Batch", table: "medicine_batches", select: "id,medicine_name_id,batch_number,receipt_number,manufacturer,quantity,unit_price,expiry_date,status,created_at", actionLabel: "Add Medicine Batch", action: { kind: "insert", table: "medicine_batches", success: "Medicine batch added" }, fields: medicineBatchFields(), dashboard: false },
    "pharmacy/medicines/low-stock": { ...defaultByRole.pharmacy, title: "Low Stock Medicines", table: "medicine_batches", select: "id,medicine_name_id,batch_number,quantity,expiry_date,status,created_at", actionLabel: "Add Medicine Batch", action: { kind: "insert", table: "medicine_batches", success: "Medicine batch added" }, fields: medicineBatchFields(), dashboard: false, filters: [{ column: "quantity", operator: "lte", value: 10 }, { column: "status", operator: "eq", value: "in_stock" }] },
    "pharmacy/medicines/out-of-stock": { ...defaultByRole.pharmacy, title: "Out of Stock Medicines", table: "medicine_batches", select: "id,medicine_name_id,batch_number,quantity,expiry_date,status,created_at", actionLabel: "Add Medicine Batch", action: { kind: "insert", table: "medicine_batches", success: "Medicine batch added" }, fields: medicineBatchFields(), dashboard: false, filters: [{ column: "status", operator: "eq", value: "out_of_stock" }] },
    "pharmacy/medicines/expired": { ...defaultByRole.pharmacy, title: "Expired Medicines", table: "medicine_batches", select: "id,medicine_name_id,batch_number,quantity,expiry_date,status,created_at", actionLabel: "No action", action: { kind: "none" }, fields: [], dashboard: false, readonly: true, filters: [{ column: "expiry_date", operator: "lt", value: "today" }] },

    "patient/profile": { ...defaultByRole.patient, title: "My Profile", table: "patients", select: "id,profile_id,full_name,student_id,mrn,gender,birth_date,phone,emergency_phone,blood_type,address,status,created_at", actionLabel: "Update Contact Info", action: { kind: "update", table: "patients", idField: "id", success: "Profile updated" }, fields: patientContactFields(), dashboard: false },
    "patient/visits": { ...defaultByRole.patient, title: "My Visits", table: "visits", select: defaultByRole.patient.select, actionLabel: "Read-only", action: { kind: "none" }, fields: [], dashboard: false, readonly: true },
    "patient/lab-results": { ...defaultByRole.patient, title: "Approved Lab Results", table: "lab_order_items", select: "id,lab_order_id,lab_test_id,result_value,result_notes,status,visible_to_patient,reviewed_at,created_at", actionLabel: "Read-only", action: { kind: "none" }, fields: [], dashboard: false, readonly: true },
    "patient/medicines": { ...defaultByRole.patient, title: "My Medicines", table: "medicine_order_items", select: "id,medicine_order_id,medicine_name_id,requested_quantity,dispensed_quantity,dosage_instructions,status,dispensed_at,created_at", actionLabel: "Read-only", action: { kind: "none" }, fields: [], dashboard: false, readonly: true },
    "patient/appointment-requests": { ...defaultByRole.patient, title: "Appointment Requests", table: "appointment_requests", select: "id,patient_id,requested_department_id,preferred_date,reason,status,admin_comment,created_at", actionLabel: "Request Appointment", action: { kind: "insert", table: "appointment_requests", success: "Appointment request submitted" }, fields: appointmentFields(), dashboard: false },
    "patient/notifications": { ...defaultByRole.patient, title: "Notifications", table: "appointment_requests", select: "id,patient_id,preferred_date,reason,status,admin_comment,created_at", actionLabel: "Notifications are read-only", action: { kind: "none" }, fields: [], dashboard: false, readonly: true },
    "patient/account-settings": { ...defaultByRole.patient, title: "Account Settings", table: "profiles", select: "id,full_name,email,phone,role,status,created_at", actionLabel: "Update Profile", action: { kind: "update", table: "profiles", idField: "id", success: "Profile updated" }, fields: profileSettingsFields(), dashboard: false },
  };

  if (employeeId) {
    return {
      ...overrides["admin/employees"],
      title: "Employee Details",
      mode: "details",
      recordId: employeeId,
      recordIdField: "id",
      actionLabel: "Employee details are read-only",
      action: { kind: "none" },
      fields: [],
      readonly: true,
      dashboard: false,
    };
  }

  if (editEmployeeId) {
    return {
      ...overrides["admin/employees"],
      title: "Edit Employee",
      mode: "edit",
      recordId: editEmployeeId,
      recordIdField: "id",
      actionLabel: "Save Employee",
      action: { kind: "function", name: "update-employee", success: "Employee updated" },
      fields: employeeEditFields(),
      readonly: false,
      dashboard: false,
    };
  }

  if (storeRequestId) {
    return {
      ...overrides["admin/store/requests"],
      title: "Store Request Details",
      mode: "store-request-details",
      recordId: storeRequestId,
      recordIdField: "id",
      actionLabel: "Store request details are read-only",
      action: { kind: "none" },
      fields: [],
      readonly: true,
      dashboard: false,
    };
  }

  if (receptionPatientId) {
    return {
      ...overrides["reception/patients"],
      title: "Patient Details",
      mode: "patient-details",
      recordId: receptionPatientId,
      recordIdField: "id",
      actionLabel: "Patient details are read-only",
      action: { kind: "none" },
      fields: [],
      readonly: true,
      dashboard: false,
    };
  }

  if (receptionAppointmentRequestId) {
    return {
      ...overrides["reception/appointment-requests"],
      title: "Appointment Request Details",
      mode: "appointment-request-details",
      recordId: receptionAppointmentRequestId,
      recordIdField: "id",
      actionLabel: "Appointment request details are read-only",
      action: { kind: "none" },
      fields: [],
      readonly: true,
      dashboard: false,
    };
  }

  const exact = overrides[`${role}/${path}`];
  if (exact) return exact;
  if (role === "admin" && path.startsWith("leave-requests/")) return { ...overrides["admin/leave-requests"], title: "Leave Request Details" };
  if (role === "doctor" && path.startsWith("visits/")) return { ...defaultByRole.doctor, title: "Visit Details", dashboard: false };
  if (role === "lab" && path.startsWith("orders/")) return { ...defaultByRole.lab, title: "Lab Order Details", dashboard: false };
  if (role === "pharmacy" && path.startsWith("orders/")) return { ...defaultByRole.pharmacy, title: "Dispense Medicines", dashboard: false };
  if (role === "pharmacy" && path.startsWith("medicines/")) return { ...overrides["pharmacy/medicines"], title: "Medicine Details", dashboard: false };
  if (role === "patient" && path.startsWith("visits/")) return { ...overrides["patient/visits"], title: "Visit Details" };
  return { ...base, title: `${base.title} / ${path}` };
}

function employeeSelect() {
  return "id,profile_id,department_id,job_title,employee_code,hire_date,status,created_at,profiles(full_name,email,phone,role,status),departments(name)";
}

function employeeColumnLabels() {
  return {
    full_name: "Full name",
    email: "Email",
    phone: "Phone",
    role: "Role",
    account_status: "Account status",
    department: "Department",
    job_title: "Job title",
    employee_code: "Employee code",
    hire_date: "Hire date",
    employee_status: "Employee status",
    created_at: "Created at",
  };
}

function receptionVisitSelect() {
  return "id,visit_code,patient_id,doctor_id,status,priority,chief_complaint,created_at,patients(full_name,mrn,student_id,phone),doctor:profiles!visits_doctor_id_fkey(full_name,email)";
}

function receptionVisitColumnLabels() {
  return {
    visit_code: "Visit code",
    patient_name: "Patient name",
    mrn: "MRN",
    student_id: "Student ID",
    patient_phone: "Patient phone",
    doctor_name: "Doctor name",
    status: "Status",
    priority: "Priority",
    chief_complaint: "Chief complaint",
    created_at: "Created at",
  };
}

function patientSelect() {
  return "id,profile_id,department_id,full_name,student_id,mrn,gender,birth_date,phone,emergency_phone,blood_type,address,dorm_info,nationality,status,created_at,departments(name)";
}

function patientColumnLabels() {
  return {
    full_name: "Full name",
    mrn: "MRN",
    student_id: "Student ID",
    gender: "Gender",
    birth_date: "Birth date",
    phone: "Phone",
    status: "Status",
    created_at: "Created at",
  };
}

function appointmentRequestSelect() {
  return "id,patient_id,requested_department_id,preferred_date,reason,status,admin_comment,reviewed_by,reviewed_at,created_at,patients(full_name,mrn,student_id,phone),requested_department:departments!appointment_requests_requested_department_id_fkey(name),reviewer:profiles!appointment_requests_reviewed_by_fkey(full_name,email)";
}

function appointmentRequestColumnLabels() {
  return {
    patient_name: "Patient name",
    mrn: "MRN",
    student_id: "Student ID",
    patient_phone: "Patient phone",
    requested_department: "Requested department",
    preferred_date: "Preferred date",
    reason: "Reason",
    status: "Status",
    admin_comment: "Comment",
    reviewed_by_name: "Reviewed by",
    reviewed_at: "Reviewed at",
    created_at: "Created at",
  };
}

function employeeFields(): WorkspaceField[] {
  return [
    { name: "full_name", label: "Full name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Temporary password", type: "password", placeholder: "Leave blank to auto-generate" },
    { name: "phone", label: "Phone" },
    { name: "role", label: "Role", type: "select", required: true, options: ["admin", "reception", "doctor", "lab", "pharmacy"] },
    { name: "department_id", label: "Department", reference: "departments" },
    { name: "job_title", label: "Job title" },
    { name: "employee_code", label: "Employee code" },
  ];
}

function employeeEditFields(): WorkspaceField[] {
  return [
    { name: "full_name", label: "Full name", required: true },
    { name: "phone", label: "Phone" },
    { name: "role", label: "Role", type: "select", required: true, options: ["admin", "reception", "doctor", "lab", "pharmacy"] },
    { name: "profile_status", label: "Account status", type: "select", required: true, options: ["active", "inactive", "suspended"] },
    { name: "department_id", label: "Department", reference: "departments" },
    { name: "job_title", label: "Job title" },
    { name: "employee_code", label: "Employee code" },
    { name: "hire_date", label: "Hire date", type: "date" },
    { name: "employee_status", label: "Employee status", type: "select", required: true, options: ["active", "inactive", "on_leave", "terminated"] },
  ];
}

function clinicSettingsFields(): WorkspaceField[] {
  return [
    { name: "clinic_name", label: "Clinic name", required: true },
    { name: "clinic_phone", label: "Clinic phone" },
    { name: "clinic_email", label: "Clinic email", type: "email" },
    { name: "clinic_address", label: "Clinic address", type: "textarea" },
    { name: "working_hours_start", label: "Working hours start", type: "time", required: true },
    { name: "working_hours_end", label: "Working hours end", type: "time", required: true },
    { name: "default_appointment_duration_minutes", label: "Default appointment duration in minutes", type: "number", required: true },
    { name: "allow_patient_appointment_requests", label: "Allow patient appointment requests", type: "checkbox" },
    { name: "emergency_contact_number", label: "Emergency contact number" },
    { name: "lab_results_visibility_mode", label: "Patient portal lab results visibility mode", type: "select", required: true, options: ["doctor_approved_only", "lab_submitted_visible", "admin_controlled"] },
  ];
}

function departmentFields(): WorkspaceField[] {
  return [{ name: "name", label: "Name", required: true }, { name: "description", label: "Description", type: "textarea" }, { name: "status", label: "Status", type: "select", options: ["active", "inactive"] }];
}

function patientFields(): WorkspaceField[] {
  return [
    { name: "full_name", label: "Full name", required: true },
    { name: "student_id", label: "Student ID", placeholder: "Student ID or MRN is required" },
    { name: "mrn", label: "MRN", placeholder: "Student ID or MRN is required" },
    { name: "gender", label: "Gender", type: "select", options: ["male", "female"] },
    { name: "birth_date", label: "Birth date", type: "date" },
    { name: "department_id", label: "Department", reference: "departments" },
    { name: "dorm_info", label: "Dorm info" },
    { name: "phone", label: "Phone" },
    { name: "emergency_phone", label: "Emergency phone" },
    { name: "nationality", label: "Nationality" },
    { name: "blood_type", label: "Blood type" },
    { name: "address", label: "Address", type: "textarea" },
  ];
}

function patientContactFields(): WorkspaceField[] {
  return [{ name: "id", label: "Patient", required: true, reference: "patients" }, { name: "phone", label: "Phone" }, { name: "emergency_phone", label: "Emergency phone" }, { name: "address", label: "Address", type: "textarea" }];
}

function visitFields(): WorkspaceField[] {
  return [{ name: "patient_id", label: "Patient", required: true, reference: "patients" }, { name: "doctor_id", label: "Doctor", required: true, reference: "doctors" }, { name: "chief_complaint", label: "Chief complaint", type: "textarea" }, { name: "priority", label: "Priority", type: "select", options: ["low", "normal", "high", "urgent"] }];
}

function updateVisitFields(): WorkspaceField[] {
  return [{ name: "visit_id", label: "Visit", required: true, reference: "visits" }, { name: "symptoms", label: "Symptoms", type: "textarea" }, { name: "diagnosis", label: "Diagnosis", type: "textarea" }, { name: "disease", label: "Disease" }, { name: "doctor_instructions", label: "Doctor instructions", type: "textarea" }, { name: "status", label: "Status", type: "select", options: ["in_progress"] }, { name: "complete", label: "Complete visit", type: "checkbox" }];
}

function labResultFields(): WorkspaceField[] {
  return [{ name: "lab_order_id", label: "Lab order", required: true, reference: "labOrders" }, { name: "lab_order_item_id", label: "Lab order item", required: true, reference: "labOrderItems" }, { name: "result_value", label: "Result value", required: true }, { name: "result_notes", label: "Result notes", type: "textarea" }];
}

function labOrderFields(): WorkspaceField[] {
  return [{ name: "visit_id", label: "Visit", required: true, reference: "visits" }, { name: "lab_test_ids", label: "Lab test", required: true, reference: "labTests" }, { name: "doctor_notes", label: "Doctor notes", type: "textarea" }];
}

function approveLabFields(): WorkspaceField[] {
  return [{ name: "lab_order_item_ids", label: "Lab result item", required: true, reference: "labOrderItems" }];
}

function labTestFields(): WorkspaceField[] {
  return [{ name: "name", label: "Name", required: true }, { name: "code", label: "Code" }, { name: "description", label: "Description", type: "textarea" }, { name: "normal_range", label: "Normal range" }, { name: "unit", label: "Unit" }];
}

function medicineBatchFields(): WorkspaceField[] {
  return [{ name: "medicine_name_id", label: "Medicine name", required: true, reference: "medicineNames" }, { name: "batch_number", label: "Batch number" }, { name: "receipt_number", label: "Receipt number" }, { name: "manufacturer", label: "Manufacturer" }, { name: "quantity", label: "Quantity", type: "number", required: true }, { name: "unit_price", label: "Unit price", type: "number", step: "0.01" }, { name: "expiry_date", label: "Expiry date", type: "date" }, { name: "status", label: "Status", type: "select", options: ["in_stock", "out_of_stock", "expired", "inactive"] }];
}

function medicineOrderFields(): WorkspaceField[] {
  return [{ name: "visit_id", label: "Visit", required: true, reference: "visits" }, { name: "medicine_name_id", label: "Medicine", required: true, reference: "medicineNames" }, { name: "requested_quantity", label: "Requested quantity", type: "number", required: true }, { name: "dosage_instructions", label: "Dosage instructions", type: "textarea" }, { name: "doctor_notes", label: "Doctor notes", type: "textarea" }];
}

function dispenseFields(): WorkspaceField[] {
  return [{ name: "medicine_order_item_id", label: "Medicine order item", required: true, reference: "medicineOrderItems" }, { name: "quantity", label: "Quantity", type: "number", required: true }];
}

function reviewLeaveFields(): WorkspaceField[] {
  return [{ name: "leave_request_id", label: "Leave request ID", required: true }, { name: "status", label: "Decision", type: "select", required: true, options: ["approved", "rejected"] }, { name: "admin_comment", label: "Admin comment", type: "textarea" }];
}

function storeItemFields(): WorkspaceField[] {
  return [{ name: "name", label: "Name", required: true }, { name: "category", label: "Category" }, { name: "manufacturer", label: "Manufacturer" }, { name: "description", label: "Description", type: "textarea" }];
}

function storeBatchFields(): WorkspaceField[] {
  return [
    { name: "store_item_id", label: "Store item", required: true, reference: "storeItems" },
    { name: "quantity", label: "Quantity", type: "number", required: true },
    { name: "unit_price", label: "Unit price", type: "number", step: "0.01" },
    { name: "receipt_number", label: "Receipt number" },
  ];
}

function storeItemColumnLabels() {
  return {
    name: "Item name",
    category: "Category",
    manufacturer: "Manufacturer",
    description: "Description",
    status: "Status",
    available_stock: "Available stock",
    created_at: "Created at",
  };
}

function storeBatchColumnLabels() {
  return {
    store_item: "Store item",
    category: "Category",
    quantity: "Quantity",
    unit_price: "Unit price",
    receipt_number: "Receipt number",
    created_by_name: "Created by",
    created_at: "Created at",
  };
}

function storeRequestSelect() {
  return "id,requested_by,store_item_id,quantity,reason,status,reviewed_by,reviewed_at,admin_comment,created_at,requester:profiles!store_requests_requested_by_fkey(full_name,email),reviewer:profiles!store_requests_reviewed_by_fkey(full_name,email),store_items(name,category,status)";
}

function storeRequestColumnLabels() {
  return {
    requester_name: "Requester",
    requester_email: "Requester email",
    store_item: "Store item",
    category: "Category",
    quantity: "Quantity",
    reason: "Reason",
    status: "Status",
    reviewed_by_name: "Reviewed by",
    reviewed_at: "Reviewed at",
    admin_comment: "Admin comment",
    created_at: "Created at",
  };
}

function assignStoreFields(): WorkspaceField[] {
  return [{ name: "store_item_id", label: "Store item", required: true, reference: "storeItems" }, { name: "assigned_to", label: "Assigned to", required: true, reference: "profiles" }, { name: "quantity", label: "Quantity", type: "number", required: true }, { name: "notes", label: "Notes", type: "textarea" }];
}

function storeRequestFields(): WorkspaceField[] {
  return [{ name: "store_item_id", label: "Store item", required: true, reference: "storeItems" }, { name: "quantity", label: "Quantity", type: "number", required: true }, { name: "reason", label: "Reason", type: "textarea" }];
}

function appointmentFields(): WorkspaceField[] {
  return [{ name: "patient_id", label: "Patient", required: true, reference: "patients" }, { name: "requested_department_id", label: "Department", reference: "departments" }, { name: "preferred_date", label: "Preferred date", type: "date" }, { name: "reason", label: "Reason", type: "textarea" }];
}

function profileSettingsFields(): WorkspaceField[] {
  return [{ name: "id", label: "Profile", required: true, reference: "profiles" }, { name: "full_name", label: "Full name" }, { name: "phone", label: "Phone" }];
}
