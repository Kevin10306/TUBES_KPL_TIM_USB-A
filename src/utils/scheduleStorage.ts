export type SavedSchedule = {
  id: string;
  barbershopName: string;
  jadwal: string;
  service: string;
  total: number;
  createdAt: string;
};

const STORAGE_KEY = "cukurin_schedules";

export function getSavedSchedules(): SavedSchedule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSchedule(schedule: Omit<SavedSchedule, "id" | "createdAt">) {
  const existing = getSavedSchedules();
  const entry: SavedSchedule = {
    ...schedule,
    id: `booking-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
  return entry;
}
