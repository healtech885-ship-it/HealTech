# Clinic Management System Architecture Reference

## 1. Document Purpose

This document describes the full architecture of a modern ERP-based Clinic Management System rebuilt with a Supabase backend and a web frontend. It is intended to be a complete technical and functional reference for developers, supervisors, reviewers, testers, and anyone who needs to understand how the system works from end to end.

The system is designed for a clinic, university medical center, or small healthcare facility. Its main goal is to digitize the internal clinic workflow from patient registration to doctor diagnosis, lab orders, pharmacy dispensing, employee management, leave requests, and asset tracking.

This document explains:

- The business purpose of the system.
- The user roles.
- The frontend and backend architecture.
- The database design.
- The authentication and authorization strategy.
- The patient visit lifecycle.
- Each system module in detail.
- The Supabase Row Level Security model.
- Edge Functions and business logic.
- Recommended folder structure.
- Deployment strategy.
- Testing strategy.
- Future improvements.

---

## 2. Project Overview

The Clinic Management System is a web-based internal management platform for clinics. It works like a lightweight ERP system focused on clinical operations.

The system connects the following departments into one digital workflow:

- Reception
- Doctors
- Laboratory
- Pharmacy
- Administration
- Patients through a Patient Portal

The system is not only a patient database. It manages the full operational cycle of a clinic visit.

A typical workflow starts when the reception team registers or finds a patient. The reception team creates a new visit and assigns it to a doctor. The doctor examines the patient, records symptoms and diagnosis, and can either complete the visit, request lab tests, or order medicines. The lab team receives lab orders and submits results. The pharmacy team receives medicine orders and confirms dispensing. The admin team manages employees, departments, leave requests, and general assets.

The new version of the system is designed around:

- Next.js for the frontend.
- TypeScript for type safety.
- Tailwind CSS and shadcn/ui for UI development.
- Supabase as the backend platform.
- Supabase Postgres as the relational database.
- Supabase Auth for authentication.
- Supabase Row Level Security for authorization.
- Supabase Edge Functions for secure business operations.
- Supabase Storage for files and documents.
- Supabase Realtime for live queues and status updates where needed.

---

## 3. Main Business Goal

The main business goal is to replace paper-based clinic operations with a secure digital system.

The system answers these operational questions:

- Who are the registered patients?
- Who visited the clinic today?
- Which doctor is assigned to each visit?
- What symptoms and diagnosis were recorded?
- Did the doctor request lab tests?
- Are lab results completed or still pending?
- Did the doctor prescribe medicines?
- Did the pharmacy dispense the requested medicines?
- What medicines are available in stock?
- Which medicines are expired or out of stock?
- Who are the clinic employees?
- What role does each employee have?
- Who requested leave?
- Which assets are available in the clinic store?
- Which assets are assigned to employees?
- What can the patient see through the Patient Portal?

---

## 4. System Scope

### 4.1 In Scope

The system includes the following working modules:

1. Authentication and role-based access.
2. Reception dashboard.
3. Patient registration and search.
4. Visit creation and doctor assignment.
5. Doctor visit management.
6. Symptoms and diagnosis recording.
7. Lab test ordering.
8. Lab result entry and submission.
9. Medicine ordering.
10. Pharmacy stock management.
11. Medicine dispensing.
12. Patient Portal.
13. Admin employee management.
14. Department management.
15. Leave request management.
16. Store and asset management.
17. Role-based dashboards.
18. Audit logging for important actions.
19. Basic reports and operational counters.

### 4.2 Out of Scope for the First Version

The first version does not need to include:

- Online payment.
- Insurance processing.
- Full hospital admission system.
- Surgery management.
- Emergency room management.
- Payroll.
- Full attendance system.
- Advanced accounting.
- Tax management.
- Video calling.
- Live chat.
- Full mobile application.
- AI diagnosis.
- Full appointment scheduling with doctor calendars unless added later.

The system can support these features in future versions, but the first production-ready scope should focus on the internal clinic workflow.

---

## 5. Recommended Technology Stack

### 5.1 Frontend

Recommended frontend stack:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Table
- Supabase JavaScript Client

### 5.2 Backend

Recommended backend stack:

- Supabase
- Supabase Postgres
- Supabase Auth
- Supabase Row Level Security
- Supabase Edge Functions
- Supabase Storage
- Supabase Realtime where needed

### 5.3 Why This Stack Is Recommended

The system is mainly a web dashboard application with many forms, tables, filters, status flows, and role-based screens. Next.js is suitable for this type of project because it provides strong routing, reusable components, server-side rendering options, and good integration with modern frontend libraries.

Supabase is suitable because it provides a complete backend platform without needing to build a traditional Laravel or Node.js backend from scratch. It gives the project authentication, a relational database, APIs, secure access policies, file storage, and serverless functions.

---

## 6. High-Level Architecture

The high-level architecture is:

```text
User Browser
   |
   v
Next.js Web Application
   |
   |-- Supabase Client for normal authenticated queries
   |-- Server Actions / API routes if needed
   |-- Edge Function calls for sensitive business operations
   |
   v
Supabase Backend
   |
   |-- Supabase Auth
   |-- Postgres Database
   |-- Row Level Security Policies
   |-- Edge Functions
   |-- Storage
   |-- Realtime Channels
```

The frontend should not contain sensitive database logic or admin secrets. It should call Supabase securely using the public anon key and rely on Row Level Security. For privileged operations, the frontend should call Supabase Edge Functions.

---

## 7. User Roles

The system contains six main roles.

### 7.1 Admin

The admin manages the system and has the highest operational access.

Admin can:

- Create employees.
- Assign roles.
- Manage departments.
- View all patients and visits.
- Manage leave requests.
- Manage store assets.
- View operational reports.
- Manage system settings.

### 7.2 Reception

Reception starts the patient workflow.

Reception can:

- Search for patients.
- Register new patients.
- Create visits.
- Assign visits to doctors.
- View waiting visits.
- View patient history with limited medical details depending on policy.

### 7.3 Doctor

Doctor handles medical examination and treatment decisions.

Doctor can:

- View assigned visits.
- Open patient visit details.
- Record symptoms.
- Record diagnosis.
- Record disease or condition.
- Complete visits.
- Order lab tests.
- Review lab results.
- Order medicines.
- View previous patient visits if allowed.

### 7.4 Lab

Lab staff handles lab orders and test results.

Lab can:

- View lab orders.
- Open lab order details.
- Enter test results.
- Save results as draft or pending.
- Submit completed results.
- View pending and completed lab results.

### 7.5 Pharmacy

Pharmacy staff handles medicine stock and dispensing.

Pharmacy can:

- Add medicine batches.
- Edit medicine stock.
- View available stock.
- View expired medicines.
- View out-of-stock medicines.
- View doctor medicine orders.
- Confirm medicine item dispensing.
- Confirm full medicine orders.
- Reduce stock quantities after dispensing.

### 7.6 Patient

Patient is an external user who can access a limited Patient Portal.

Patient can:

- Log in to the Patient Portal.
- View their own profile.
- View their own visits.
- View approved lab results.
- View prescribed medicines.
- View medicine dispensing status.
- Request a visit or appointment if this feature is enabled.
- Update limited contact information if allowed.

Patient must never be able to see another patient's data.

---

## 8. Authentication Architecture

### 8.1 Supabase Auth

Supabase Auth should be used for login, registration, password reset, and session management.

Every user account is stored in `auth.users` by Supabase.

Application-specific user information should be stored in a custom table named `profiles`.

### 8.2 profiles Table

The `profiles` table stores role and display information.

Recommended columns:

```text
profiles
- id uuid primary key references auth.users(id)
- full_name text not null
- email text not null
- phone text
- role user_role not null
- status user_status not null default 'active'
- profile_photo_url text
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

Recommended enum for `user_role`:

```text
admin
reception
doctor
lab
pharmacy
patient
```

Recommended enum for `user_status`:

```text
active
inactive
suspended
```

### 8.3 Login Flow

1. User enters email and password.
2. Next.js calls Supabase Auth.
3. Supabase returns a session if login succeeds.
4. Frontend fetches the user's profile from `profiles`.
5. Frontend checks the role.
6. User is redirected to the correct dashboard.

Example redirects:

```text
admin      -> /admin/dashboard
reception  -> /reception/dashboard
doctor     -> /doctor/dashboard
lab        -> /lab/dashboard
pharmacy   -> /pharmacy/dashboard
patient    -> /patient/dashboard
```

---

## 9. Authorization Architecture

Authorization must not depend only on hiding frontend buttons.

The system should use three layers of authorization:

1. Frontend route protection.
2. Supabase Row Level Security policies.
3. Edge Function authorization checks for sensitive operations.

### 9.1 Frontend Route Protection

Next.js should protect routes based on role.

Example:

- `/admin/*` only for admin.
- `/reception/*` only for reception and admin.
- `/doctor/*` only for doctor and admin.
- `/lab/*` only for lab and admin.
- `/pharmacy/*` only for pharmacy and admin.
- `/patient/*` only for patient.

### 9.2 Row Level Security

All important database tables should have RLS enabled.

RLS ensures that users can only access rows they are allowed to access.

Examples:

- Patient users can only see their own patient record.
- Patient users can only see their own visits.
- Doctors can only see visits assigned to them.
- Lab users can see lab orders.
- Pharmacy users can see pharmacy orders.
- Admin users can see everything.

### 9.3 Edge Function Authorization

Sensitive operations must run through Edge Functions.

Examples:

- Creating an employee account.
- Creating a patient account.
- Confirming medicine dispensing.
- Updating stock quantities.
- Completing a multi-step visit workflow.
- Publishing lab results to the patient portal.

The Edge Function should check the user's session and role before executing the operation.

---

## 10. Main Frontend Structure

Recommended Next.js folder structure:

```text
app/
  layout.tsx
  page.tsx
  login/
    page.tsx
  dashboard/
    page.tsx

  admin/
    dashboard/
      page.tsx
    employees/
      page.tsx
      new/
        page.tsx
      [id]/
        page.tsx
    departments/
      page.tsx
    leave-requests/
      page.tsx
      [id]/
        page.tsx
    store/
      items/
        page.tsx
      assignments/
        page.tsx
      requests/
        page.tsx

  reception/
    dashboard/
      page.tsx
    patients/
      page.tsx
      new/
        page.tsx
      [id]/
        page.tsx
    visits/
      page.tsx
      new/
        page.tsx

  doctor/
    dashboard/
      page.tsx
    visits/
      page.tsx
      [id]/
        page.tsx
    lab-results/
      page.tsx

  lab/
    dashboard/
      page.tsx
    orders/
      page.tsx
      [id]/
        page.tsx
    tests/
      page.tsx

  pharmacy/
    dashboard/
      page.tsx
    medicines/
      page.tsx
      new/
        page.tsx
      [id]/
        page.tsx
    orders/
      page.tsx
      [id]/
        page.tsx

  patient/
    dashboard/
      page.tsx
    profile/
      page.tsx
    visits/
      page.tsx
      [id]/
        page.tsx
    lab-results/
      page.tsx
    medicines/
      page.tsx
    appointment-requests/
      page.tsx
```

Recommended shared folders:

```text
components/
  layout/
  tables/
  forms/
  dashboard/
  ui/

lib/
  supabase/
  auth/
  validators/
  constants/
  utils/

types/
  database.types.ts
  app.types.ts

hooks/
  use-profile.ts
  use-role.ts
  use-toast.ts
```

---

## 11. Core Database Design

The database should be normalized, secure, and clear. The new system should avoid spelling mistakes from the legacy version and use clean table names.

### 11.1 profiles

Stores system user profiles.

```text
profiles
- id uuid primary key references auth.users(id)
- full_name text
- email text
- phone text
- role user_role
- status user_status
- profile_photo_url text
- created_at timestamptz
- updated_at timestamptz
```

### 11.2 departments

Stores clinic departments or university departments.

```text
departments
- id uuid primary key
- name text not null
- description text
- status text default 'active'
- created_at timestamptz
- updated_at timestamptz
```

### 11.3 employees

Stores extra employee data linked to profiles.

```text
employees
- id uuid primary key
- profile_id uuid references profiles(id)
- department_id uuid references departments(id)
- job_title text
- employee_code text unique
- hire_date date
- status text default 'active'
- created_at timestamptz
- updated_at timestamptz
```

### 11.4 patients

Stores patient medical identity records.

```text
patients
- id uuid primary key
- profile_id uuid references profiles(id) null
- student_id text unique
- mrn text unique
- full_name text not null
- gender text
- birth_date date
- department_id uuid references departments(id)
- dorm_info text
- phone text
- emergency_phone text
- nationality text
- blood_type text
- address text
- status text default 'active'
- created_by uuid references profiles(id)
- created_at timestamptz
- updated_at timestamptz
```

Important note:

- `profile_id` is nullable because a patient may exist in the system without having a login account.
- If the patient portal is enabled, each patient with portal access should have a linked profile with role `patient`.

### 11.5 visits

Stores patient visits.

```text
visits
- id uuid primary key
- patient_id uuid references patients(id)
- doctor_id uuid references profiles(id)
- reception_id uuid references profiles(id)
- visit_code text unique
- chief_complaint text
- symptoms text
- diagnosis text
- disease text
- notes text
- status visit_status
- priority visit_priority default 'normal'
- started_at timestamptz
- completed_at timestamptz
- created_at timestamptz
- updated_at timestamptz
```

Recommended enum for `visit_status`:

```text
queued
in_progress
waiting_lab
lab_completed
waiting_pharmacy
completed
cancelled
```

Recommended enum for `visit_priority`:

```text
low
normal
high
urgent
```

### 11.6 lab_tests

Stores available lab test types.

```text
lab_tests
- id uuid primary key
- name text not null
- code text unique
- description text
- normal_range text
- unit text
- status text default 'active'
- created_at timestamptz
- updated_at timestamptz
```

### 11.7 lab_orders

Stores lab orders requested by doctors.

```text
lab_orders
- id uuid primary key
- visit_id uuid references visits(id)
- patient_id uuid references patients(id)
- doctor_id uuid references profiles(id)
- status lab_order_status
- doctor_notes text
- created_at timestamptz
- updated_at timestamptz
- completed_at timestamptz
```

Recommended enum for `lab_order_status`:

```text
ordered
in_progress
pending_review
completed
cancelled
```

### 11.8 lab_order_items

Stores individual tests inside a lab order.

```text
lab_order_items
- id uuid primary key
- lab_order_id uuid references lab_orders(id)
- lab_test_id uuid references lab_tests(id)
- result_value text
- result_notes text
- status lab_result_status
- entered_by uuid references profiles(id)
- entered_at timestamptz
- reviewed_by uuid references profiles(id)
- reviewed_at timestamptz
- visible_to_patient boolean default false
- created_at timestamptz
- updated_at timestamptz
```

Recommended enum for `lab_result_status`:

```text
pending
entered
submitted
reviewed
```

### 11.9 medicine_names

Stores unique medicine names and general information.

```text
medicine_names
- id uuid primary key
- name text not null unique
- category text
- description text
- status text default 'active'
- created_at timestamptz
- updated_at timestamptz
```

### 11.10 medicine_batches

Stores actual medicine stock batches.

```text
medicine_batches
- id uuid primary key
- medicine_name_id uuid references medicine_names(id)
- batch_number text
- receipt_number text
- manufacturer text
- quantity integer not null default 0
- unit_price numeric(10,2)
- expiry_date date
- status medicine_batch_status
- created_by uuid references profiles(id)
- created_at timestamptz
- updated_at timestamptz
```

Recommended enum for `medicine_batch_status`:

```text
in_stock
out_of_stock
expired
inactive
```

### 11.11 medicine_orders

Stores medicine orders created by doctors.

```text
medicine_orders
- id uuid primary key
- visit_id uuid references visits(id)
- patient_id uuid references patients(id)
- doctor_id uuid references profiles(id)
- status medicine_order_status
- doctor_notes text
- created_at timestamptz
- updated_at timestamptz
- completed_at timestamptz
```

Recommended enum for `medicine_order_status`:

```text
ordered
partially_dispensed
dispensed
cancelled
```

### 11.12 medicine_order_items

Stores individual medicines inside an order.

```text
medicine_order_items
- id uuid primary key
- medicine_order_id uuid references medicine_orders(id)
- medicine_name_id uuid references medicine_names(id)
- requested_quantity integer not null
- dispensed_quantity integer default 0
- dosage_instructions text
- status medicine_order_item_status
- dispensed_by uuid references profiles(id)
- dispensed_at timestamptz
- created_at timestamptz
- updated_at timestamptz
```

Recommended enum for `medicine_order_item_status`:

```text
pending
dispensed
unavailable
cancelled
```

### 11.13 leave_requests

Stores employee leave requests.

```text
leave_requests
- id uuid primary key
- employee_profile_id uuid references profiles(id)
- leave_type text
- start_date date
- end_date date
- reason text
- status leave_request_status
- admin_comment text
- reviewed_by uuid references profiles(id)
- reviewed_at timestamptz
- created_at timestamptz
- updated_at timestamptz
```

Recommended enum for `leave_request_status`:

```text
pending
approved
rejected
cancelled
```

### 11.14 store_items

Stores general non-medicine clinic items.

```text
store_items
- id uuid primary key
- name text not null
- category text
- manufacturer text
- description text
- status text default 'active'
- created_at timestamptz
- updated_at timestamptz
```

### 11.15 store_item_batches

Stores purchase or stock entries for store items.

```text
store_item_batches
- id uuid primary key
- store_item_id uuid references store_items(id)
- receipt_number text
- quantity integer not null
- unit_price numeric(10,2)
- created_by uuid references profiles(id)
- created_at timestamptz
- updated_at timestamptz
```

### 11.16 store_assignments

Stores assets assigned to employees.

```text
store_assignments
- id uuid primary key
- store_item_id uuid references store_items(id)
- assigned_to uuid references profiles(id)
- assigned_by uuid references profiles(id)
- quantity integer not null
- status store_assignment_status
- notes text
- assigned_at timestamptz
- returned_at timestamptz
- created_at timestamptz
- updated_at timestamptz
```

Recommended enum for `store_assignment_status`:

```text
assigned
returned
damaged
lost
```

### 11.17 store_requests

Stores employee requests for general store items.

```text
store_requests
- id uuid primary key
- requested_by uuid references profiles(id)
- store_item_id uuid references store_items(id)
- quantity integer not null
- reason text
- status store_request_status
- reviewed_by uuid references profiles(id)
- reviewed_at timestamptz
- admin_comment text
- created_at timestamptz
- updated_at timestamptz
```

Recommended enum for `store_request_status`:

```text
pending
approved
rejected
fulfilled
cancelled
```

### 11.18 appointment_requests

Optional table for patient appointment or visit requests.

```text
appointment_requests
- id uuid primary key
- patient_id uuid references patients(id)
- requested_department_id uuid references departments(id)
- preferred_date date
- reason text
- status appointment_request_status
- reviewed_by uuid references profiles(id)
- reviewed_at timestamptz
- admin_comment text
- created_at timestamptz
- updated_at timestamptz
```

Recommended enum for `appointment_request_status`:

```text
pending
approved
rejected
cancelled
completed
```

### 11.19 audit_logs

Stores important system actions.

```text
audit_logs
- id uuid primary key
- actor_id uuid references profiles(id)
- action text not null
- entity_type text not null
- entity_id uuid
- metadata jsonb
- created_at timestamptz default now()
```

Audit logs should be created for important actions such as:

- Patient registration.
- Visit creation.
- Diagnosis update.
- Lab result submission.
- Medicine dispensing.
- Stock updates.
- Employee creation.
- Role changes.
- Leave approval or rejection.

---

## 12. Main Workflows

## 12.1 Patient Registration Workflow

### Actors

- Reception
- Admin optionally

### Steps

1. Reception opens the patient search screen.
2. Reception searches by student ID, MRN, phone, or name.
3. If the patient exists, the system shows the patient profile and previous visits.
4. If the patient does not exist, reception opens the new patient form.
5. Reception enters patient details.
6. System validates required fields.
7. System creates a new row in `patients`.
8. System logs the action in `audit_logs`.
9. Reception can immediately create a new visit for the patient.

### Important Rules

- `student_id` should be unique if used.
- `mrn` should be unique.
- Reception should not create duplicate patient records.
- Patient portal account is optional.

---

## 12.2 Create Visit Workflow

### Actors

- Reception

### Steps

1. Reception opens the patient profile.
2. Reception clicks Create Visit.
3. Reception selects the assigned doctor.
4. Reception enters chief complaint if available.
5. System creates a visit with status `queued`.
6. System assigns the visit to the selected doctor.
7. The visit appears in the doctor's queue.
8. System logs the action.

### Visit Status After Creation

```text
queued
```

### Important Rules

- A visit must be linked to one patient.
- A visit should be assigned to one doctor.
- A patient can have multiple visits over time.
- A visit should have a unique visit code.

---

## 12.3 Doctor Examination Workflow

### Actors

- Doctor

### Steps

1. Doctor opens the assigned visits queue.
2. Doctor selects a queued visit.
3. System shows patient details and visit history.
4. Doctor records symptoms.
5. Doctor records diagnosis.
6. Doctor records disease or condition.
7. Doctor can choose one of the following actions:
   - Complete visit.
   - Order lab tests.
   - Order medicines.
   - Save progress.

### Possible Status Changes

```text
queued -> in_progress
in_progress -> completed
in_progress -> waiting_lab
in_progress -> waiting_pharmacy
```

### Important Rules

- Doctor should only access assigned visits unless admin permissions allow otherwise.
- Diagnosis and medical notes should be protected from unauthorized users.
- Patient users should not see diagnosis details unless the clinic allows it.

---

## 12.4 Lab Order Workflow

### Actors

- Doctor
- Lab Staff

### Steps

1. Doctor opens a visit.
2. Doctor clicks Order Lab Tests.
3. Doctor selects one or more lab tests.
4. System creates a `lab_orders` row.
5. System creates `lab_order_items` rows for selected tests.
6. Visit status becomes `waiting_lab`.
7. Lab staff sees the new order in the lab queue.
8. Lab staff opens the order.
9. Lab staff enters results.
10. Lab staff submits results.
11. Lab order status becomes `completed`.
12. Visit status becomes `lab_completed` or returns to `in_progress` depending on design.
13. Doctor reviews the results.
14. Doctor continues treatment.

### Important Rules

- Lab staff should not edit doctor diagnosis.
- Lab staff can only enter lab result fields.
- Lab results should not become visible to patients until reviewed or approved.

---

## 12.5 Medicine Order Workflow

### Actors

- Doctor
- Pharmacy Staff

### Steps

1. Doctor opens a visit.
2. Doctor clicks Order Medicine.
3. Doctor selects medicines and quantities.
4. Doctor writes dosage instructions.
5. System creates `medicine_orders` row.
6. System creates `medicine_order_items` rows.
7. Visit status becomes `waiting_pharmacy`.
8. Pharmacy sees the order.
9. Pharmacy checks stock availability.
10. Pharmacy confirms one item or all items.
11. System reduces stock quantity.
12. System updates order item status.
13. System updates medicine order status.
14. If all items are dispensed, order becomes `dispensed`.
15. Visit can become `completed` depending on doctor or clinic policy.

### Important Rules

- Stock reduction must be handled safely.
- Pharmacy confirmation should run through an Edge Function or database transaction.
- The system should prevent negative stock.
- If stock is unavailable, the item should be marked `unavailable`.

---

## 12.6 Patient Portal Workflow

### Actors

- Patient

### Steps

1. Patient logs in.
2. System verifies the user has role `patient`.
3. System finds the linked patient record through `patients.profile_id`.
4. Patient sees dashboard summary.
5. Patient can open My Profile.
6. Patient can open My Visits.
7. Patient can open visit details.
8. Patient can view approved lab results.
9. Patient can view prescribed medicines and dispensing status.
10. Patient can request an appointment if enabled.

### Important Rules

- Patient must only see their own data.
- Patient must not access other patients by changing URLs.
- RLS must enforce patient ownership.
- Sensitive medical data visibility should be controlled by clinic policy.

---

## 12.7 Leave Request Workflow

### Actors

- Employee
- Admin

### Steps

1. Employee opens Leave Request page.
2. Employee selects leave type and dates.
3. Employee writes reason.
4. System creates leave request with status `pending`.
5. Admin views pending requests.
6. Admin approves or rejects the request.
7. Admin may add a comment.
8. Employee can view request status.

### Important Rules

- Employee can only see their own leave requests.
- Admin can see all leave requests.
- Approved or rejected requests should not be edited by normal users.

---

## 12.8 Store and Asset Workflow

### Actors

- Admin
- Employee

### Steps for Adding Items

1. Admin creates store item.
2. Admin adds stock batch for the item.
3. System updates total available quantity.

### Steps for Assigning Items

1. Admin selects employee.
2. Admin selects store item.
3. Admin enters quantity.
4. System creates assignment.
5. System reduces available quantity.
6. Employee can view assigned assets.

### Steps for Requesting Items

1. Employee opens store request page.
2. Employee selects item and quantity.
3. Employee submits reason.
4. Admin reviews the request.
5. Admin approves, rejects, or fulfills it.

### Important Rules

- Assigned quantities should not exceed available stock.
- Asset assignment should be logged.
- Returned or damaged assets should update assignment status.

---

## 13. Dashboard Requirements

## 13.1 Admin Dashboard

Admin dashboard should display:

- Total employees.
- Total doctors.
- Total reception users.
- Total lab staff.
- Total pharmacy staff.
- Total patients.
- Total visits today.
- Pending leave requests.
- Low-stock medicines.
- Expired medicines.
- Pending store requests.

## 13.2 Reception Dashboard

Reception dashboard should display:

- Today's visits.
- Queued visits.
- Completed visits today.
- Patient search shortcut.
- Create visit shortcut.
- Recently registered patients.

## 13.3 Doctor Dashboard

Doctor dashboard should display:

- Assigned queued visits.
- In-progress visits.
- Visits waiting for lab results.
- Lab results completed and ready for review.
- Completed visits today.

## 13.4 Lab Dashboard

Lab dashboard should display:

- New lab orders.
- In-progress lab orders.
- Pending result entries.
- Completed lab orders today.
- Common requested tests.

## 13.5 Pharmacy Dashboard

Pharmacy dashboard should display:

- New medicine orders.
- Partially dispensed orders.
- Completed medicine orders today.
- Low-stock medicines.
- Expired medicines.
- Out-of-stock medicines.

## 13.6 Patient Dashboard

Patient dashboard should display:

- Welcome message.
- Total visits.
- Last visit date.
- Last visit status.
- Pending lab results.
- Latest approved lab results.
- Latest prescribed medicines.
- Appointment request status if enabled.

---

## 14. Frontend UI Design Principles

The UI should be clear, professional, and role-focused.

### 14.1 General UI Rules

- Use a clean dashboard layout.
- Use a sidebar for navigation.
- Use cards for summary counters.
- Use tables for records.
- Use modals or separate pages for forms.
- Use badges for statuses.
- Use consistent colors for status labels.
- Use confirmation dialogs for dangerous actions.
- Use loading states for async operations.
- Use toast notifications after actions.

### 14.2 Status Badge Examples

Visit status:

```text
queued          -> Waiting
in_progress     -> In Progress
waiting_lab     -> Waiting for Lab
lab_completed   -> Lab Completed
waiting_pharmacy-> Waiting for Pharmacy
completed       -> Completed
cancelled       -> Cancelled
```

Medicine status:

```text
in_stock     -> In Stock
out_of_stock -> Out of Stock
expired      -> Expired
inactive     -> Inactive
```

Leave request status:

```text
pending  -> Pending
approved -> Approved
rejected -> Rejected
cancelled-> Cancelled
```

### 14.3 Forms

All forms should use:

- React Hook Form.
- Zod validation.
- Required field indicators.
- Clear error messages.
- Disabled submit button while loading.

Examples of important forms:

- Add Patient form.
- Create Visit form.
- Diagnosis form.
- Lab Order form.
- Lab Result form.
- Medicine Order form.
- Add Medicine Stock form.
- Employee form.
- Leave Request form.
- Store Item form.

---

## 15. Supabase Edge Functions

Edge Functions should be used for operations that require secure server-side logic.

### 15.1 create-employee

Purpose:

- Allows admin to create employee accounts securely.

Why Edge Function is needed:

- Creating users with admin privileges requires service role access.
- Service role key must never be exposed in the browser.

Inputs:

```json
{
  "full_name": "Dr. Ahmed",
  "email": "doctor@example.com",
  "phone": "01000000000",
  "role": "doctor",
  "department_id": "uuid",
  "job_title": "General Doctor"
}
```

Actions:

1. Verify caller is admin.
2. Create user in Supabase Auth.
3. Create profile row.
4. Create employee row if needed.
5. Write audit log.

---

### 15.2 create-patient-account

Purpose:

- Creates a login account for an existing patient.

Actions:

1. Verify caller is admin or reception.
2. Find patient.
3. Create Auth user.
4. Create profile with role `patient`.
5. Link `patients.profile_id` to profile.
6. Write audit log.

---

### 15.3 create-visit

Purpose:

- Creates a new visit and assigns it to a doctor.

Actions:

1. Verify caller is reception or admin.
2. Validate patient exists.
3. Validate doctor exists and has role `doctor`.
4. Create visit with status `queued`.
5. Generate visit code.
6. Write audit log.

---

### 15.4 order-lab-tests

Purpose:

- Allows doctor to create lab order for a visit.

Actions:

1. Verify caller is assigned doctor or admin.
2. Validate visit exists.
3. Create lab order.
4. Create lab order items.
5. Update visit status to `waiting_lab`.
6. Write audit log.

---

### 15.5 submit-lab-results

Purpose:

- Allows lab staff to submit results.

Actions:

1. Verify caller has role `lab` or admin.
2. Validate lab order exists.
3. Update lab order item results.
4. Mark lab order as completed if all items completed.
5. Update visit status to `lab_completed`.
6. Write audit log.

---

### 15.6 order-medicines

Purpose:

- Allows doctor to create a medicine order.

Actions:

1. Verify caller is assigned doctor or admin.
2. Validate visit exists.
3. Validate medicine names exist.
4. Create medicine order.
5. Create medicine order items.
6. Update visit status to `waiting_pharmacy`.
7. Write audit log.

---

### 15.7 dispense-medicine

Purpose:

- Allows pharmacy to confirm dispensing and reduce stock safely.

Actions:

1. Verify caller has role `pharmacy` or admin.
2. Validate medicine order item exists.
3. Check available stock.
4. Select suitable medicine batch, preferably earliest expiry first.
5. Reduce stock quantity.
6. Mark item as dispensed or partially dispensed.
7. Update order status.
8. Update visit status if needed.
9. Write audit log.

Important:

This operation should be transaction-safe. It must prevent negative stock and race conditions.

---

### 15.8 approve-lab-result-for-patient

Purpose:

- Allows doctor to decide which lab results are visible to the patient.

Actions:

1. Verify caller is assigned doctor or admin.
2. Set `visible_to_patient = true` for selected lab results.
3. Write audit log.

---

### 15.9 review-leave-request

Purpose:

- Allows admin to approve or reject leave requests.

Actions:

1. Verify caller is admin.
2. Update leave request status.
3. Add admin comment.
4. Set reviewed_by and reviewed_at.
5. Write audit log.

---

### 15.10 assign-store-item

Purpose:

- Allows admin to assign assets to employees.

Actions:

1. Verify caller is admin.
2. Validate item availability.
3. Create store assignment.
4. Update stock quantity.
5. Write audit log.

---

## 16. Row Level Security Policy Design

This section describes the intended RLS logic conceptually.

### 16.1 Helper Function: get_current_role

Create a Postgres function to get the current user's role from `profiles`.

Concept:

```sql
select role from profiles where id = auth.uid();
```

### 16.2 profiles Policies

- Users can read their own profile.
- Admin can read all profiles.
- Admin can update roles and statuses.
- Users can update limited personal fields if allowed.

### 16.3 patients Policies

- Admin can read all patients.
- Reception can read and create patients.
- Doctors can read patients linked to their assigned visits.
- Lab can read limited patient information related to lab orders.
- Pharmacy can read limited patient information related to medicine orders.
- Patient can read only their own patient row.

### 16.4 visits Policies

- Admin can read all visits.
- Reception can read and create visits.
- Doctor can read and update visits assigned to them.
- Lab can read visits connected to lab orders.
- Pharmacy can read visits connected to medicine orders.
- Patient can read only their own visits.

### 16.5 lab_orders and lab_order_items Policies

- Admin can read all.
- Doctor can create and read orders for assigned visits.
- Lab can read and update lab results.
- Patient can read only visible approved results connected to their own patient record.

### 16.6 medicine_orders and medicine_order_items Policies

- Admin can read all.
- Doctor can create and read medicine orders for assigned visits.
- Pharmacy can read and update dispensing status.
- Patient can read their own medicine orders.

### 16.7 medicine Stock Policies

- Admin can read all stock.
- Pharmacy can read and manage stock.
- Doctor can read medicine names for ordering.
- Patient should not directly access stock details unless needed.

### 16.8 leave_requests Policies

- Admin can read and update all leave requests.
- Employees can create leave requests for themselves.
- Employees can read their own leave requests.

### 16.9 store Policies

- Admin can manage all store data.
- Employees can read their own assignments.
- Employees can create store requests for themselves.

---

## 17. Patient Portal Security Rules

The Patient Portal must follow strict security rules.

### 17.1 Patient Data Ownership

A patient user is linked to one row in `patients` using:

```text
patients.profile_id = auth.uid()
```

All patient portal queries must filter by the authenticated user's profile id.

### 17.2 Prevent ID Guessing

The system must prevent users from accessing another patient's data by changing the URL.

Bad pattern:

```text
/patient/visits/any-visit-id
```

Safe backend rule:

```text
Only allow access if visit.patient_id belongs to the current patient profile.
```

### 17.3 Lab Result Visibility

Patients should only see lab results where:

```text
visible_to_patient = true
```

This prevents raw or unreviewed lab results from being shown before doctor review.

### 17.4 Medical Notes Visibility

The clinic must decide what the patient can see:

- Full diagnosis.
- Summary only.
- Doctor instructions only.
- Lab results only.

The safest first version is:

- Show visit date, doctor, status, approved lab results, prescribed medicines, and doctor instructions.
- Hide internal notes.

---

## 18. Data Validation Rules

### 18.1 Patient Form

Required:

- Full name.
- Student ID or MRN.
- Gender.
- Phone if required by clinic.

Validation:

- Student ID unique.
- MRN unique.
- Phone format valid.
- Birth date cannot be in the future.

### 18.2 Visit Form

Required:

- Patient.
- Doctor.

Validation:

- Doctor must have role `doctor`.
- Patient must be active.

### 18.3 Diagnosis Form

Required:

- Symptoms or chief complaint.
- Diagnosis when completing visit.

Validation:

- Visit must be assigned to current doctor.
- Completed visits should not be edited unless admin or special permission exists.

### 18.4 Lab Order Form

Required:

- Visit.
- At least one lab test.

Validation:

- Selected lab tests must be active.
- Visit must not be completed or cancelled.

### 18.5 Lab Result Form

Required:

- Result value or result note for each submitted test.

Validation:

- Lab order must be active.
- Lab staff must not submit empty results.

### 18.6 Medicine Order Form

Required:

- Visit.
- At least one medicine.
- Quantity for each medicine.

Validation:

- Quantity must be positive.
- Medicine must be active.
- Visit must not be completed or cancelled.

### 18.7 Medicine Stock Form

Required:

- Medicine name.
- Quantity.
- Expiry date.

Validation:

- Quantity must be zero or positive.
- Unit price must be numeric.
- Expiry date must be a valid date.

### 18.8 Leave Request Form

Required:

- Leave type.
- Start date.
- End date.
- Reason.

Validation:

- End date must be after or equal to start date.
- Employee cannot submit overlapping leave requests if that rule is needed.

---

## 19. Realtime Features

Realtime is optional but useful.

Recommended realtime features:

### 19.1 Doctor Queue

When reception creates a visit, the assigned doctor's queue updates automatically.

### 19.2 Lab Queue

When a doctor orders lab tests, lab dashboard updates automatically.

### 19.3 Pharmacy Queue

When a doctor orders medicines, pharmacy dashboard updates automatically.

### 19.4 Status Updates

Reception and doctor dashboards can update when visit status changes.

Realtime should not replace database security. RLS must still apply.

---

## 20. File Storage

Supabase Storage can be used for files.

Possible files:

- Patient profile images.
- Employee profile images.
- Lab result attachments.
- Medical report PDFs.
- Leave request attachments.
- Store item images or invoices.

Recommended buckets:

```text
profile-photos
lab-attachments
medical-reports
leave-attachments
store-documents
```

Storage access should be protected with policies.

Patients should only access their own allowed files.

---

## 21. Reporting Requirements

The first reporting version should include simple operational reports.

### 21.1 Visit Reports

- Visits today.
- Visits by doctor.
- Completed visits.
- Pending visits.
- Visits by department.
- Visits by date range.

### 21.2 Lab Reports

- Pending lab orders.
- Completed lab orders.
- Most requested lab tests.
- Average lab completion time.

### 21.3 Pharmacy Reports

- Medicine stock levels.
- Low-stock medicines.
- Expired medicines.
- Dispensed medicines by date.
- Most prescribed medicines.

### 21.4 Admin Reports

- Employees by role.
- Leave requests by status.
- Store item assignments.
- Store item requests.

Reports can be implemented using database views or SQL queries.

---

## 22. Status Lifecycle Summary

### 22.1 Visit Status Lifecycle

```text
queued
  |
  v
in_progress
  |--------------------|
  |                    |
  v                    v
waiting_lab        waiting_pharmacy
  |                    |
  v                    v
lab_completed      completed or in_progress
  |
  v
in_progress
  |
  v
completed
```

Alternative simplified lifecycle:

```text
queued -> in_progress -> waiting_lab -> lab_completed -> waiting_pharmacy -> completed
```

### 22.2 Lab Order Status Lifecycle

```text
ordered -> in_progress -> pending_review -> completed
```

### 22.3 Medicine Order Status Lifecycle

```text
ordered -> partially_dispensed -> dispensed
```

### 22.4 Leave Request Status Lifecycle

```text
pending -> approved
pending -> rejected
pending -> cancelled
```

### 22.5 Store Request Status Lifecycle

```text
pending -> approved -> fulfilled
pending -> rejected
pending -> cancelled
```

---

## 23. Navigation Structure

### 23.1 Admin Navigation

- Dashboard
- Employees
- Departments
- Patients
- Visits
- Leave Requests
- Store Items
- Store Assignments
- Store Requests
- Reports
- Settings

### 23.2 Reception Navigation

- Dashboard
- Search Patient
- Add Patient
- Create Visit
- Queued Visits
- Completed Visits

### 23.3 Doctor Navigation

- Dashboard
- My Visits
- Queued Visits
- Waiting Lab Results
- Completed Visits
- Lab Results

### 23.4 Lab Navigation

- Dashboard
- Lab Orders
- Pending Results
- Completed Results
- Lab Test Types

### 23.5 Pharmacy Navigation

- Dashboard
- Medicine Orders
- Medicine Stock
- Add Medicine
- In-Stock Medicines
- Out-of-Stock Medicines
- Expired Medicines

### 23.6 Patient Navigation

- Dashboard
- My Profile
- My Visits
- Lab Results
- Medicines
- Appointment Requests

---

## 24. API and Data Access Strategy

The project does not need a traditional REST backend for every operation because Supabase provides auto-generated APIs from Postgres.

Use three access methods:

### 24.1 Direct Supabase Client Queries

Use for simple operations where RLS can safely protect data.

Examples:

- Patient reading own visits.
- Doctor reading assigned visits.
- Lab reading lab orders.
- Pharmacy reading medicine orders.
- Admin reading departments.

### 24.2 Supabase Edge Functions

Use for sensitive and multi-step operations.

Examples:

- Creating employee accounts.
- Creating patient portal accounts.
- Dispensing medicine.
- Assigning store items.
- Submitting lab results.

### 24.3 Database Functions / RPC

Use for complex database operations that need to run inside Postgres.

Examples:

- Calculating available stock.
- Creating visit codes.
- Generating reports.
- Returning dashboard counters.

---

## 25. Error Handling Strategy

The system should handle errors clearly.

### 25.1 Frontend Error Types

- Validation errors.
- Authentication errors.
- Authorization errors.
- Not found errors.
- Server errors.
- Network errors.

### 25.2 User-Friendly Messages

Examples:

```text
You do not have permission to access this page.
This patient record was not found.
This visit has already been completed.
Medicine stock is not enough to complete this order.
Lab result cannot be submitted without a result value.
```

### 25.3 Developer Logging

Important errors should be logged to:

- Browser console during development.
- Supabase logs.
- External monitoring tool in production if available.

---

## 26. Audit Logging Strategy

Audit logging is important because the system handles medical and operational data.

Each important action should create an audit log.

Audit log should include:

- Who performed the action.
- What action was performed.
- Which entity was affected.
- When it happened.
- Optional metadata.

Examples:

```json
{
  "actor_id": "profile_uuid",
  "action": "visit.created",
  "entity_type": "visit",
  "entity_id": "visit_uuid",
  "metadata": {
    "patient_id": "patient_uuid",
    "doctor_id": "doctor_uuid"
  }
}
```

Recommended action names:

```text
patient.created
visit.created
visit.updated
visit.completed
lab_order.created
lab_result.submitted
medicine_order.created
medicine.dispensed
stock.updated
employee.created
role.updated
leave_request.approved
leave_request.rejected
store_item.assigned
```

---

## 27. Security Requirements

### 27.1 Never Expose Service Role Key

The Supabase service role key must never be used in frontend code.

It should only be used inside secure backend environments such as Edge Functions.

### 27.2 Enable RLS on All Sensitive Tables

RLS should be enabled on:

- profiles
- patients
- visits
- lab_orders
- lab_order_items
- medicine_orders
- medicine_order_items
- medicine_batches
- employees
- leave_requests
- store tables
- audit_logs

### 27.3 Use Least Privilege

Each role should only access what it needs.

Examples:

- Lab does not need to edit medicine stock.
- Pharmacy does not need to edit lab results.
- Patient does not need to see other patients.
- Reception does not need to edit diagnosis.

### 27.4 Validate Server-Side

Frontend validation is not enough.

Important operations must be validated inside Edge Functions or database constraints.

### 27.5 Protect Medical Data

Medical records should be treated as sensitive data.

Access should be logged and restricted.

---

## 28. Database Constraints

Recommended constraints:

- Unique email in profiles.
- Unique student_id in patients if applicable.
- Unique mrn in patients.
- Foreign keys between visits and patients.
- Foreign keys between visits and doctors.
- Foreign keys between lab orders and visits.
- Foreign keys between medicine orders and visits.
- Quantity cannot be negative.
- Price cannot be negative.
- Expiry date must be valid.

Example constraints conceptually:

```text
medicine_batches.quantity >= 0
medicine_batches.unit_price >= 0
medicine_order_items.requested_quantity > 0
store_assignments.quantity > 0
```

---

## 29. Recommended Development Phases

### Phase 1: Foundation

Build:

- Next.js project setup.
- Supabase project setup.
- Auth.
- profiles table.
- roles enum.
- route protection.
- shared layout.
- dashboard shell.

### Phase 2: Admin Foundation

Build:

- Create employees.
- Assign roles.
- Departments.
- Basic admin dashboard.

### Phase 3: Reception and Patients

Build:

- Patient search.
- Add patient.
- Patient profile.
- Create visit.
- Queued visits.

### Phase 4: Doctor Workflow

Build:

- Doctor dashboard.
- Assigned visits.
- Visit details.
- Diagnosis form.
- Complete visit.
- Order lab tests.
- Order medicines.

### Phase 5: Lab Workflow

Build:

- Lab test types.
- Lab orders queue.
- Lab result entry.
- Submit lab results.
- Completed lab results.

### Phase 6: Pharmacy Workflow

Build:

- Medicine names.
- Medicine batches.
- Stock views.
- Medicine order queue.
- Dispense medicine.
- Expired medicine view.

### Phase 7: Patient Portal

Build:

- Patient login.
- Patient dashboard.
- My profile.
- My visits.
- My lab results.
- My medicines.
- Appointment requests if needed.

### Phase 8: HR and Store

Build:

- Leave requests.
- Leave approval.
- Store items.
- Store assignments.
- Store requests.

### Phase 9: Reports and Polish

Build:

- Dashboard counters.
- Reports.
- Audit logs viewer.
- Better search and filters.
- UI polish.
- Error handling.

### Phase 10: Testing and Deployment

Build:

- Unit tests.
- Integration tests.
- RLS policy tests.
- User acceptance testing.
- Production deployment.

---

## 30. Testing Strategy

### 30.1 Authentication Tests

Test:

- User can log in.
- User with inactive status cannot access dashboards.
- User is redirected to correct dashboard based on role.
- Unauthorized user cannot access restricted route.

### 30.2 Reception Tests

Test:

- Reception can create patient.
- Reception cannot create duplicate student ID.
- Reception can create visit.
- Visit appears in doctor queue.

### 30.3 Doctor Tests

Test:

- Doctor can see assigned visits.
- Doctor cannot see unassigned visits unless allowed.
- Doctor can update diagnosis.
- Doctor can complete visit.
- Doctor can order lab tests.
- Doctor can order medicines.

### 30.4 Lab Tests

Test:

- Lab can see lab orders.
- Lab can submit result.
- Lab result updates visit status.
- Patient cannot see result before approval.
- Patient can see result after approval.

### 30.5 Pharmacy Tests

Test:

- Pharmacy can add medicine stock.
- Expired medicines appear in expired list.
- Pharmacy can dispense medicine.
- Stock quantity decreases.
- System prevents negative stock.

### 30.6 Patient Portal Tests

Test:

- Patient can see own profile.
- Patient can see own visits.
- Patient cannot access another patient's visit by URL.
- Patient can see approved lab results only.
- Patient can see prescribed medicines.

### 30.7 Admin Tests

Test:

- Admin can create employees.
- Admin can assign roles.
- Admin can approve leave requests.
- Admin can assign store items.

### 30.8 RLS Tests

Test RLS directly by trying to access unauthorized records using different users.

This is critical because security should not depend on frontend logic only.

---

## 31. Deployment Architecture

Recommended deployment:

```text
Frontend: Vercel
Backend: Supabase Cloud
Database: Supabase Postgres
Functions: Supabase Edge Functions
Storage: Supabase Storage
```

### 31.1 Environment Variables

Frontend environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Server-only variables if needed:

```text
SUPABASE_SERVICE_ROLE_KEY=
```

Important:

`SUPABASE_SERVICE_ROLE_KEY` must only be used server-side or inside Edge Functions. It must never be exposed to the browser.

### 31.2 Development Environment

Local development should use:

- Local Next.js dev server.
- Supabase cloud project or local Supabase CLI.
- Separate development and production Supabase projects if possible.

Recommended environments:

```text
development
staging
production
```

---

## 32. Future Improvements

Future features can include:

### 32.1 Appointment Scheduling

- Patient requests appointment.
- Reception approves.
- Doctor calendar.
- Appointment reminders.

### 32.2 Billing

- Visit invoices.
- Lab test prices.
- Medicine prices.
- Payment status.

### 32.3 Notifications

- Notify doctor when visit assigned.
- Notify lab when lab order created.
- Notify pharmacy when medicine order created.
- Notify patient when lab results are available.

### 32.4 Reports Dashboard

- Daily visit reports.
- Monthly patient trends.
- Medicine consumption reports.
- Lab test frequency reports.

### 32.5 Mobile App

A future Flutter mobile app can be built mainly for patients.

Possible mobile features:

- Patient profile.
- Visit history.
- Lab results.
- Medicines.
- Appointment requests.
- Notifications.

### 32.6 AI Assistant

Future AI features could include:

- Admin report assistant.
- Stock risk assistant.
- Patient follow-up summary assistant.
- Doctor note summarization.

AI should not make medical decisions without human review.

---

## 33. Important Design Decisions

### 33.1 Use Next.js for Web Dashboard

The system is mostly dashboards, forms, and tables. Next.js is the best fit for the web version.

### 33.2 Use Supabase as Backend

Supabase provides database, auth, APIs, security policies, storage, and functions in one platform.

### 33.3 Use Patient Portal as a Separate Role

Patient should be a real authenticated role, not just a record in the database.

### 33.4 Use RLS as the Main Security Layer

Frontend route protection is not enough. Supabase RLS must protect the data.

### 33.5 Use Edge Functions for Sensitive Operations

Operations that use service role access or update multiple tables should run in Edge Functions.

### 33.6 Keep Medical Data Protected

Patient data, diagnosis, lab results, and medicine orders should be treated as sensitive information.

---

## 34. Complete System Summary

The Clinic Management System is a role-based web application for managing internal clinic workflows.

The system starts with authentication. Every user has a role stored in the `profiles` table. Based on the role, the user is redirected to the correct dashboard.

Reception handles patient search, patient registration, and visit creation. Every visit is assigned to a doctor and starts with status `queued`.

Doctors handle the medical visit. They record symptoms, diagnosis, and disease information. They can complete the visit, request lab tests, or order medicines.

The lab team receives lab orders, enters test results, and submits them. Results can be reviewed before becoming visible to patients.

The pharmacy team manages medicine stock and receives medicine orders from doctors. When medicines are dispensed, stock quantities are reduced securely.

The admin manages employees, departments, leave requests, store items, asset assignments, and overall system settings.

Patients can log in to a limited Patient Portal where they can view their own profile, visits, approved lab results, and medicines.

Supabase provides the backend infrastructure, including authentication, database, Row Level Security, storage, realtime updates, and Edge Functions.

Next.js provides the frontend web application, including dashboards, forms, tables, protected pages, and role-based navigation.

The most important technical rule is that all sensitive data must be protected by Row Level Security and not only by frontend checks.

The most important business workflow is the patient visit lifecycle:

```text
Reception creates patient and visit
        |
        v
Visit becomes queued
        |
        v
Doctor examines patient
        |
        |--> Complete visit
        |
        |--> Order lab tests --> Lab submits results --> Doctor reviews
        |
        |--> Order medicines --> Pharmacy dispenses medicines
        |
        v
Visit becomes completed
```

This architecture creates a scalable foundation for a production-ready clinic management platform that can later be extended with appointments, billing, notifications, mobile apps, analytics, and AI-supported features.

