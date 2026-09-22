export type HiveStatus = "healthy" | "attention" | "critical";

export interface TrendPoint {
  time: string;
  temp: number;
  weight: number;
}

export interface Hive {
  id: string;
  name: string;
  cluster: string;
  temperature: number;
  humidity: number;
  weightKg: number;
  activity: "Low" | "Normal" | "High";
  status: HiveStatus;
  aiReason: string;
  aiAction: string;
  lastSynced: string;
  isOffline: boolean;
  trend: TrendPoint[];
}

export interface BatchEvent {
  label: string;
  date: string;
  verified: boolean;
}

export interface Batch {
  id: string;
  hiveId: string;
  hiveName: string;
  beekeeper: string;
  location: string;
  extractionDate: string;
  quantityKg: number;
  status: "Verified" | "In progress";
  authenticityScore: number;
  events: BatchEvent[];
  txHash: string | null;
  blockNumber: number | null;
  network: string | null;
}

export interface VerifyResult {
  found: boolean;
  batch: Batch | null;
  chainConfirmed: boolean;
}

export interface BeekeeperProfile {
  name: string;
  cluster: string;
  totalHives: number;
  healthyHives: number;
  attentionHives: number;
  criticalHives: number;
  batchesThisMonth: number;
  honeyProducedKg: number;
}

export interface ClusterBeekeeper {
  name: string;
  cluster: string;
  hives: number;
  verifiedBatches: number;
  flagged: number;
}

export interface ClusterStats {
  totalBeekeepers: number;
  totalHives: number;
  verifiedBatches: number;
  flaggedRecords: number;
  honeyProducedKgThisMonth: number;
}
