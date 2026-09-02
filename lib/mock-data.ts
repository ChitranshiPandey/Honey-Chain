export type HiveStatus = "healthy" | "attention" | "critical";

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
  trend: { time: string; temp: number; weight: number }[];
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
  txHash: string;
  blockNumber: number;
  network: string;
}

export const beekeeperProfile = {
  name: "Ramesh Kumar",
  cluster: "Bhopal Cluster, Madhya Pradesh",
  totalHives: 24,
  healthyHives: 20,
  attentionHives: 3,
  criticalHives: 1,
  batchesThisMonth: 6,
  honeyProducedKg: 184.6,
};

export const hives: Hive[] = [
  {
    id: "H101",
    name: "Hive H101",
    cluster: "Bhopal Cluster",
    temperature: 33.4,
    humidity: 58,
    weightKg: 42.3,
    activity: "Normal",
    status: "healthy",
    aiReason: "All readings within normal seasonal range.",
    aiAction: "No action needed — continue routine checks.",
    lastSynced: "2 minutes ago",
    isOffline: false,
    trend: [
      { time: "6am", temp: 31.2, weight: 42.0 },
      { time: "9am", temp: 32.1, weight: 42.1 },
      { time: "12pm", temp: 33.8, weight: 42.2 },
      { time: "3pm", temp: 34.2, weight: 42.3 },
      { time: "6pm", temp: 33.4, weight: 42.3 },
    ],
  },
  {
    id: "H102",
    name: "Hive H102",
    cluster: "Bhopal Cluster",
    temperature: 35.8,
    humidity: 61,
    weightKg: 39.7,
    activity: "Low",
    status: "attention",
    aiReason: "Temperature increasing while activity and weight trend down.",
    aiAction: "Inspect hive within 24 hours for possible colony stress.",
    lastSynced: "5 minutes ago",
    isOffline: false,
    trend: [
      { time: "6am", temp: 32.0, weight: 40.4 },
      { time: "9am", temp: 33.4, weight: 40.1 },
      { time: "12pm", temp: 34.9, weight: 39.9 },
      { time: "3pm", temp: 35.6, weight: 39.8 },
      { time: "6pm", temp: 35.8, weight: 39.7 },
    ],
  },
  {
    id: "H103",
    name: "Hive H103",
    cluster: "Bhopal Cluster",
    temperature: 31.2,
    humidity: 55,
    weightKg: 38.1,
    activity: "Normal",
    status: "healthy",
    aiReason: "Stable readings, consistent with healthy colony activity.",
    aiAction: "No action needed.",
    lastSynced: "1 minute ago",
    isOffline: false,
    trend: [
      { time: "6am", temp: 29.8, weight: 37.9 },
      { time: "9am", temp: 30.6, weight: 38.0 },
      { time: "12pm", temp: 31.5, weight: 38.0 },
      { time: "3pm", temp: 31.8, weight: 38.1 },
      { time: "6pm", temp: 31.2, weight: 38.1 },
    ],
  },
  {
    id: "H104",
    name: "Hive H104",
    cluster: "Bhopal Cluster",
    temperature: 27.1,
    humidity: 63,
    weightKg: 36.4,
    activity: "Normal",
    status: "critical",
    aiReason: "No data received in over 6 hours — device likely offline.",
    aiAction: "Check ESP32 power and Wi-Fi connection at the hive site.",
    lastSynced: "6 hours ago",
    isOffline: true,
    trend: [
      { time: "6am", temp: 28.0, weight: 36.5 },
      { time: "9am", temp: 27.6, weight: 36.4 },
      { time: "12pm", temp: 27.1, weight: 36.4 },
      { time: "3pm", temp: 27.1, weight: 36.4 },
      { time: "6pm", temp: 27.1, weight: 36.4 },
    ],
  },
];

export const batches: Batch[] = [
  {
    id: "HC-MP-2026-00142",
    hiveId: "H102",
    hiveName: "Hive H102, Madhya Pradesh",
    beekeeper: "Ramesh Kumar",
    location: "Bhopal Cluster, Madhya Pradesh",
    extractionDate: "31 Aug 2026",
    quantityKg: 8.2,
    status: "Verified",
    authenticityScore: 94,
    events: [
      { label: "Batch created", date: "31 Aug 2026, 08:15 AM", verified: true },
      { label: "Honey extracted", date: "31 Aug 2026, 09:30 AM", verified: true },
      { label: "Quality check passed", date: "31 Aug 2026, 11:00 AM", verified: true },
      { label: "Packaged — 500ml, pure forest honey", date: "31 Aug 2026, 02:30 PM", verified: true },
      { label: "Dispatched to Bhopal Distributor", date: "1 Sep 2026, 10:00 AM", verified: true },
      { label: "Delivered to Nature Mart Store", date: "2 Sep 2026, 04:30 PM", verified: false },
    ],
    txHash: "0x7f2a...c3d9",
    blockNumber: 2784321,
    network: "Polygon Amoy",
  },
  {
    id: "HC-MP-2026-00141",
    hiveId: "H101",
    hiveName: "Hive H101, Madhya Pradesh",
    beekeeper: "Ramesh Kumar",
    location: "Bhopal Cluster, Madhya Pradesh",
    extractionDate: "29 Aug 2026",
    quantityKg: 6.5,
    status: "Verified",
    authenticityScore: 97,
    events: [
      { label: "Batch created", date: "29 Aug 2026, 07:50 AM", verified: true },
      { label: "Honey extracted", date: "29 Aug 2026, 09:10 AM", verified: true },
      { label: "Quality check passed", date: "29 Aug 2026, 10:40 AM", verified: true },
      { label: "Packaged — 500ml, pure forest honey", date: "29 Aug 2026, 01:15 PM", verified: true },
    ],
    txHash: "0x51ab...9e2f",
    blockNumber: 2781908,
    network: "Polygon Amoy",
  },
];

export const clusterBeekeepers = [
  { name: "Ramesh Kumar", cluster: "Bhopal Cluster", hives: 24, verifiedBatches: 142, flagged: 0 },
  { name: "Sunita Devi", cluster: "Indore Cluster", hives: 18, verifiedBatches: 96, flagged: 1 },
  { name: "Ashok Patil", cluster: "Nagpur Cluster", hives: 31, verifiedBatches: 210, flagged: 0 },
  { name: "Meena Shah", cluster: "Indore Cluster", hives: 12, verifiedBatches: 58, flagged: 2 },
  { name: "Vikram Rathore", cluster: "Bhopal Cluster", hives: 20, verifiedBatches: 133, flagged: 0 },
];

export const clusterStats = {
  totalBeekeepers: 118,
  totalHives: 642,
  verifiedBatches: 3480,
  flaggedRecords: 7,
  honeyProducedKgThisMonth: 4820,
};
