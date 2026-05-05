import { z } from "zod";

export const patientSchema = z.object({
  full_name: z.string().min(2),
  identifier: z.string().min(1),
  gender: z.string().min(1),
  phone: z.string().min(7),
});

export const visitSchema = z.object({
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  chief_complaint: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

export const diagnosisSchema = z.object({
  symptoms: z.string().min(1),
  diagnosis: z.string().min(1),
  disease: z.string().optional(),
  doctor_instructions: z.string().optional(),
});

export const labOrderSchema = z.object({
  visit_id: z.string().uuid(),
  lab_test_ids: z.array(z.string().uuid()).min(1),
  doctor_notes: z.string().optional(),
});

export const medicineOrderSchema = z.object({
  visit_id: z.string().uuid(),
  items: z.array(z.object({
    medicine_name_id: z.string().uuid(),
    requested_quantity: z.number().int().positive(),
    dosage_instructions: z.string().optional(),
  })).min(1),
});

export const leaveRequestSchema = z.object({
  leave_type: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  reason: z.string().min(3),
}).refine((value) => new Date(value.end_date) >= new Date(value.start_date), {
  message: "End date must be after or equal to start date",
  path: ["end_date"],
});
