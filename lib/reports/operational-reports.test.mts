import assert from "node:assert/strict";
import test from "node:test";

type OperationalReportsModule = {
  normalizeOperationalReportData: (raw: unknown) => {
    visits: {
      today: number;
      pending: number;
      completed: number;
      byDoctor: Array<{ doctorName: string; total: number }>;
    };
    lab: {
      pendingResults: number;
      completedResults: number;
      topTests: Array<{ testName: string; total: number }>;
    };
    pharmacy: {
      lowStockMedicines: number;
      expiredMedicines: number;
      stockLevels: Array<{ medicineName: string; quantity: number }>;
      topMedicines: Array<{ medicineName: string; total: number }>;
    };
    admin: {
      activeEmployees: number;
      pendingLeaveRequests: number;
      pendingStoreRequests: number;
      auditLogsToday: number;
    };
  };
};

async function loadOperationalReportsModule(): Promise<OperationalReportsModule> {
  try {
    return await import("./operational-reports.ts") as OperationalReportsModule;
  } catch (error) {
    assert.fail(`lib/reports/operational-reports.ts should expose report normalization: ${error instanceof Error ? error.message : String(error)}`);
  }
}

test("normalizeOperationalReportData fills missing report sections with defaults", async () => {
  const { normalizeOperationalReportData } = await loadOperationalReportsModule();

  assert.deepEqual(normalizeOperationalReportData(null), {
    visits: { today: 0, pending: 0, completed: 0, byDoctor: [] },
    lab: { pendingResults: 0, completedResults: 0, topTests: [] },
    pharmacy: { lowStockMedicines: 0, expiredMedicines: 0, stockLevels: [], topMedicines: [] },
    admin: { activeEmployees: 0, pendingLeaveRequests: 0, pendingStoreRequests: 0, auditLogsToday: 0 },
  });
});

test("normalizeOperationalReportData coerces numeric strings and report rows", async () => {
  const { normalizeOperationalReportData } = await loadOperationalReportsModule();

  const report = normalizeOperationalReportData({
    visits: {
      today: "4",
      pending: "2",
      completed: 7,
      byDoctor: [{ doctor_name: "Dr. Mona", total: "3" }],
    },
    lab: {
      pending_results: "5",
      completed_results: "8",
      top_tests: [{ test_name: "CBC", total: "6" }],
    },
    pharmacy: {
      low_stock_medicines: "2",
      expired_medicines: "1",
      stock_levels: [{ medicine_name: "Paracetamol", quantity: "12" }],
      top_medicines: [{ medicine_name: "Ibuprofen", total: "9" }],
    },
    admin: {
      active_employees: "11",
      pending_leave_requests: "1",
      pending_store_requests: "3",
      audit_logs_today: "14",
    },
  });

  assert.equal(report.visits.today, 4);
  assert.equal(report.lab.pendingResults, 5);
  assert.deepEqual(report.visits.byDoctor, [{ doctorName: "Dr. Mona", total: 3 }]);
  assert.deepEqual(report.lab.topTests, [{ testName: "CBC", total: 6 }]);
  assert.deepEqual(report.pharmacy.stockLevels, [{ medicineName: "Paracetamol", quantity: 12 }]);
  assert.deepEqual(report.pharmacy.topMedicines, [{ medicineName: "Ibuprofen", total: 9 }]);
  assert.equal(report.admin.auditLogsToday, 14);
});
