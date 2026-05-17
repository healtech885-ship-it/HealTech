// ─── HealTech Agent Tool Definitions ────────────────────────────────────────
// GPT-4o function calling tool definitions for each role.
// These define what the AI CAN call – the handlers are in tool-handlers.ts.

export type AgentToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, { type: string; description: string; enum?: string[] }>;
      required: string[];
    };
  };
};

// ─── Shared Read Tools ──────────────────────────────────────────────────────

const searchPatients: AgentToolDefinition = {
  type: "function",
  function: {
    name: "search_patients",
    description: "Search for patients by name, MRN, or student ID. Returns up to 10 matching patient profiles.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search term: patient name, MRN, or student ID" },
      },
      required: ["query"],
    },
  },
};

const getPatientProfile: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_patient_profile",
    description: "Get a single patient's full profile including demographics, contact info, and department.",
    parameters: {
      type: "object",
      properties: {
        patient_id: { type: "string", description: "The patient UUID" },
      },
      required: ["patient_id"],
    },
  },
};

const getTodayVisits: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_today_visits",
    description: "Get all clinic visits created today with patient names, doctor names, status, and priority.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", description: "Optional filter by visit status", enum: ["queued", "in_progress", "completed", "cancelled"] },
      },
      required: [],
    },
  },
};

const getVisitDetails: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_visit_details",
    description: "Get full details of a specific visit including diagnosis, symptoms, lab orders, and prescriptions.",
    parameters: {
      type: "object",
      properties: {
        visit_id: { type: "string", description: "The visit UUID" },
      },
      required: ["visit_id"],
    },
  },
};

const getPatientVisits: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_patient_visits",
    description: "Get all visits for a specific patient, ordered by most recent first.",
    parameters: {
      type: "object",
      properties: {
        patient_id: { type: "string", description: "The patient UUID" },
      },
      required: ["patient_id"],
    },
  },
};

// ─── Lab Tools ──────────────────────────────────────────────────────────────

const getPendingLabOrders: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_pending_lab_orders",
    description: "Get all lab orders with status 'ordered' (pending lab work). Includes patient and doctor info.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

const getLabOrderDetails: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_lab_order_details",
    description: "Get full details of a lab order including all test items and their results.",
    parameters: {
      type: "object",
      properties: {
        lab_order_id: { type: "string", description: "The lab order UUID" },
      },
      required: ["lab_order_id"],
    },
  },
};

const getPatientLabResults: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_patient_lab_results",
    description: "Get all lab results for a patient. For patients, only visible_to_patient results are returned.",
    parameters: {
      type: "object",
      properties: {
        patient_id: { type: "string", description: "The patient UUID" },
      },
      required: ["patient_id"],
    },
  },
};

// ─── Pharmacy Tools ─────────────────────────────────────────────────────────

const getPendingPrescriptions: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_pending_prescriptions",
    description: "Get all medicine orders with status 'ordered' (awaiting dispensing). Includes patient and medicine info.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

const getMedicineStock: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_medicine_stock",
    description: "Get current medicine stock including batch quantities, expiry dates, and low-stock alerts.",
    parameters: {
      type: "object",
      properties: {
        filter: { type: "string", description: "Optional filter", enum: ["all", "low_stock", "expired", "expiring_soon"] },
      },
      required: [],
    },
  },
};

const getPrescriptionDetails: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_prescription_details",
    description: "Get full details of a medicine order including all items, quantities, and dispensing status.",
    parameters: {
      type: "object",
      properties: {
        medicine_order_id: { type: "string", description: "The medicine order UUID" },
      },
      required: ["medicine_order_id"],
    },
  },
};

// ─── Admin Tools ────────────────────────────────────────────────────────────

const getDashboardCounters: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_dashboard_counters",
    description: "Get live operational counters: total employees, doctors, patients, today's visits, pending lab orders, pending prescriptions, low stock medicines, pending leave requests.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

const getDepartmentWorkload: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_department_workload",
    description: "Get visit counts grouped by department for operational load analysis.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

const getAuditLogs: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_audit_logs",
    description: "Get the most recent audit log entries for compliance review.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of recent entries to retrieve (default 20, max 50)" },
      },
      required: [],
    },
  },
};

const getLeaveRequests: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_leave_requests",
    description: "Get employee leave requests, optionally filtered by status.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", description: "Filter by status", enum: ["pending", "approved", "rejected"] },
      },
      required: [],
    },
  },
};

// ─── Patient Self-Service Tools ─────────────────────────────────────────────

const getMyVisits: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_my_visits",
    description: "Get the authenticated patient's own visits.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

const getMyLabResults: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_my_lab_results",
    description: "Get the authenticated patient's approved lab results (visible_to_patient only).",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

const getMyPrescriptions: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_my_prescriptions",
    description: "Get the authenticated patient's prescriptions and dispensing status.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

const getMyAppointmentRequests: AgentToolDefinition = {
  type: "function",
  function: {
    name: "get_my_appointment_requests",
    description: "Get the authenticated patient's appointment requests and their status.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

// ─── Role → Tools Mapping ───────────────────────────────────────────────────

export function getToolsForRole(role: string): AgentToolDefinition[] {
  switch (role) {
    case "admin":
      return [
        searchPatients, getPatientProfile, getTodayVisits, getVisitDetails,
        getPatientVisits, getPendingLabOrders, getPendingPrescriptions,
        getMedicineStock, getDashboardCounters, getDepartmentWorkload,
        getAuditLogs, getLeaveRequests,
      ];
    case "reception":
      return [
        searchPatients, getPatientProfile, getTodayVisits, getVisitDetails,
        getPatientVisits,
      ];
    case "doctor":
      return [
        searchPatients, getPatientProfile, getTodayVisits, getVisitDetails,
        getPatientVisits, getPatientLabResults, getPendingLabOrders,
        getLabOrderDetails,
      ];
    case "lab":
      return [
        getPendingLabOrders, getLabOrderDetails, getPatientLabResults,
        getVisitDetails,
      ];
    case "pharmacy":
      return [
        getPendingPrescriptions, getPrescriptionDetails, getMedicineStock,
        getVisitDetails,
      ];
    case "patient":
      return [
        getMyVisits, getMyLabResults, getMyPrescriptions,
        getMyAppointmentRequests,
      ];
    default:
      return [];
  }
}
