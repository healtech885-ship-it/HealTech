import assert from "node:assert/strict";
import test from "node:test";

type ClinicalFilesModule = {
  buildClinicalFilePath: (input: { bucket: string; ownerId: string; fileName: string; now?: Date; nonce?: string }) => string;
  validateClinicalFile: (bucket: string, file: { name: string; size: number; type: string }) => string | null;
};

async function loadClinicalFilesModule(): Promise<ClinicalFilesModule> {
  try {
    return await import("./clinical-files.ts") as ClinicalFilesModule;
  } catch (error) {
    assert.fail(`lib/storage/clinical-files.ts should expose storage helpers: ${error instanceof Error ? error.message : String(error)}`);
  }
}

test("validateClinicalFile accepts medical report PDFs within size limits", async () => {
  const { validateClinicalFile } = await loadClinicalFilesModule();

  const error = validateClinicalFile("medical-reports", {
    name: "visit-summary.pdf",
    size: 3 * 1024 * 1024,
    type: "application/pdf",
  });

  assert.equal(error, null);
});

test("validateClinicalFile rejects unsupported buckets, MIME types, and oversized files", async () => {
  const { validateClinicalFile } = await loadClinicalFilesModule();

  assert.match(validateClinicalFile("unknown", { name: "x.pdf", size: 1, type: "application/pdf" }) ?? "", /Unsupported storage bucket/);
  assert.match(validateClinicalFile("medical-reports", { name: "x.exe", size: 1, type: "application/x-msdownload" }) ?? "", /File type is not allowed/);
  assert.match(validateClinicalFile("medical-reports", { name: "x.pdf", size: 30 * 1024 * 1024, type: "application/pdf" }) ?? "", /File is too large/);
});

test("buildClinicalFilePath creates stable sanitized object paths", async () => {
  const { buildClinicalFilePath } = await loadClinicalFilesModule();

  assert.equal(
    buildClinicalFilePath({
      bucket: "medical-reports",
      ownerId: "Patient 42",
      fileName: "Lab Report #1.PDF",
      now: new Date("2026-05-16T10:20:30.000Z"),
      nonce: "abc123",
    }),
    "patient-42/2026-05-16/abc123-lab-report-1.pdf",
  );
});
