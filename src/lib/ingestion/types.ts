export interface NormalizedItem {
  externalId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string | null;
  imageCaption?: string | null;
  sourceUrl: string;
  sourceUrlHash: string;
  sourceName: string;
  categorySlug: string;
  publishedAt: Date;
  isBreaking?: boolean;
  metadata?: Record<string, any>;
  // For Medical Devices & Regulatory Alerts
  regulatoryData?: {
    agency: string;
    alertType: "recall" | "safety_communication" | "warning_letter" | "outbreak" | "guidance" | "inspection";
    recallClass?: string;
    affectedProduct?: string;
    manufacturer?: string;
    distributionPattern?: string;
    submissionNumber?: string;
    recordType?: "510k" | "PMA" | "De_Novo" | "MAUDE" | "recall";
    productCode?: string;
    deviceClass?: string;
  };
}

export interface IngestionResult {
  sourceCode: string;
  status: "success" | "error" | "warning";
  fetched: number;
  inserted: number;
  skipped: number;
  errorMessage?: string;
  executionTimeMs: number;
}
