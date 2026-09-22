import type {
  Batch,
  BeekeeperProfile,
  ClusterBeekeeper,
  ClusterStats,
  Hive,
  VerifyResult,
} from "@/lib/types";

// NEXT_PUBLIC_ prefix is required for this to be readable from client components
// (the batch-creation wizard). Falls back to the local backend so the app works
// out of the box with no .env file, matching `backend/.env.example`.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Server-only — undefined in the browser bundle, so this only ever gets
// attached when apiFetch runs in a server component. The one client-side
// write (createBatch, below) goes through app/api/batches/route.ts instead,
// which attaches it server-side so the key never reaches the browser.
const API_KEY = process.env.HONEYCHAIN_API_KEY;

// No per-user login yet (see the root README's "Auth" section / backend/app/routers/beekeepers.py)
// — every page acts as this one seeded beekeeper until phone+OTP login exists.
export const CURRENT_BEEKEEPER_ID = 1;

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      `Could not reach the Honey Chain API at ${API_BASE_URL}. Is the backend running? ` +
        `(cd backend && uvicorn app.main:app --reload --port 8000)`
    );
  }

  if (!res.ok) {
    throw new ApiError(`Honey Chain API error on ${path}: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/** Returns null on 404 instead of throwing, for pages that call notFound(). */
async function apiFetchOrNull<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.message.includes("404")) return null;
    throw err;
  }
}

export function getHives() {
  return apiFetch<Hive[]>("/hives");
}

export function getHive(id: string) {
  return apiFetchOrNull<Hive>(`/hives/${id}`);
}

export function getBatches() {
  return apiFetch<Batch[]>("/batches");
}

export function getBatch(id: string) {
  return apiFetchOrNull<Batch>(`/batches/${id}`);
}

// Proxied through a local Next.js route (app/api/batches/route.ts) instead of
// apiFetch, since this is the only backend write called from a client
// component — the proxy attaches the API key server-side so it never ships
// to the browser bundle.
export async function createBatch(payload: {
  hiveId: string;
  extractionDate: string;
  quantityKg: number;
}): Promise<Batch> {
  const res = await fetch("/api/batches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new ApiError(`Honey Chain API error on /batches: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<Batch>;
}

export function verifyBatch(id: string) {
  return apiFetch<VerifyResult>(`/batches/${id}/verify`);
}

export function getBeekeeperProfile(id: number = CURRENT_BEEKEEPER_ID) {
  return apiFetch<BeekeeperProfile>(`/beekeepers/${id}/profile`);
}

export function getClusterBeekeepers() {
  return apiFetch<ClusterBeekeeper[]>("/admin/beekeepers");
}

export function getClusterStats() {
  return apiFetch<ClusterStats>("/admin/stats");
}
