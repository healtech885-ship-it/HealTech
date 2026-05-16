export type ClinicalStorageBucket =
  | "profile-photos"
  | "lab-attachments"
  | "medical-reports"
  | "leave-attachments"
  | "store-documents";

export type ClinicalFileLike = {
  name: string;
  size: number;
  type?: string;
};

type BucketRules = {
  maxSizeBytes: number;
  mimeTypes: readonly string[];
  extensions: readonly string[];
};

export const CLINICAL_BUCKETS: Record<ClinicalStorageBucket, BucketRules> = {
  "profile-photos": {
    maxSizeBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
  "lab-attachments": {
    maxSizeBytes: 15 * 1024 * 1024,
    mimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    extensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
  },
  "medical-reports": {
    maxSizeBytes: 20 * 1024 * 1024,
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    extensions: [".pdf", ".jpg", ".jpeg", ".png"],
  },
  "leave-attachments": {
    maxSizeBytes: 10 * 1024 * 1024,
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    extensions: [".pdf", ".jpg", ".jpeg", ".png"],
  },
  "store-documents": {
    maxSizeBytes: 10 * 1024 * 1024,
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    extensions: [".pdf", ".jpg", ".jpeg", ".png"],
  },
};

export function validateClinicalFile(bucket: string, file: ClinicalFileLike) {
  const rules = getBucketRules(bucket);
  if (!rules) return "Unsupported storage bucket";
  if (!file.name.trim()) return "File name is required";
  if (!Number.isFinite(file.size) || file.size <= 0) return "File is empty";
  if (file.size > rules.maxSizeBytes) return `File is too large. Maximum size is ${formatMegabytes(rules.maxSizeBytes)} MB.`;

  const fileName = file.name.toLowerCase();
  const hasAllowedExtension = rules.extensions.some((extension) => fileName.endsWith(extension));
  const mimeType = (file.type || inferMimeType(fileName)).toLowerCase();
  const hasAllowedMimeType = rules.mimeTypes.includes(mimeType);

  if (!hasAllowedExtension || !hasAllowedMimeType) return "File type is not allowed for this bucket";

  return null;
}

export function buildClinicalFilePath({
  bucket,
  ownerId,
  fileName,
  now = new Date(),
  nonce,
}: {
  bucket: string;
  ownerId: string;
  fileName: string;
  now?: Date;
  nonce?: string;
}) {
  if (!getBucketRules(bucket)) throw new Error("Unsupported storage bucket");

  const ownerSegment = sanitizePathSegment(ownerId) || "unassigned";
  const safeFileName = sanitizeFileName(fileName) || "file";
  const dateSegment = now.toISOString().slice(0, 10);
  const safeNonce = sanitizePathSegment(nonce ?? randomNonce());

  return `${ownerSegment}/${dateSegment}/${safeNonce}-${safeFileName}`;
}

function getBucketRules(bucket: string): BucketRules | null {
  return bucket in CLINICAL_BUCKETS ? CLINICAL_BUCKETS[bucket as ClinicalStorageBucket] : null;
}

function sanitizeFileName(fileName: string) {
  const baseName = fileName.split(/[\\/]/).pop() ?? fileName;
  const lowerName = baseName.trim().toLowerCase();
  const extensionMatch = lowerName.match(/(\.[a-z0-9]+)$/);
  const extension = extensionMatch?.[1] ?? "";
  const nameWithoutExtension = extension ? lowerName.slice(0, -extension.length) : lowerName;
  const safeBase = sanitizePathSegment(nameWithoutExtension);
  return `${safeBase}${extension}`;
}

function sanitizePathSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function inferMimeType(fileName: string) {
  if (fileName.endsWith(".pdf")) return "application/pdf";
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

function formatMegabytes(bytes: number) {
  return Math.round(bytes / 1024 / 1024);
}

function randomNonce() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
}
