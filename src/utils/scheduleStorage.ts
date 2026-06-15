export type ScheduleStatus = 'menunggu' | 'dikonfirmasi';

export type SavedSchedule = {
  id: string;
  barbershopName: string;
  jadwal: string;
  service: string;
  total: number;
  createdAt: string;
  status?: ScheduleStatus; // default: 'menunggu'
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
    status: 'menunggu',
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
  return entry;
}

/** Update status pesanan (menunggu → dikonfirmasi) */
export function confirmSchedule(id: string): SavedSchedule[] {
  const existing = getSavedSchedules();
  const updated = existing.map(s =>
    s.id === id ? { ...s, status: 'dikonfirmasi' as ScheduleStatus } : s
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/** Hapus jadwal berdasarkan id */
export function deleteSchedule(id: string): SavedSchedule[] {
  const existing = getSavedSchedules();
  const updated = existing.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

