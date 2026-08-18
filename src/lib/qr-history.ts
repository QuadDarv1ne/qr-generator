import type { QRSnapshot } from './qr-store';

export interface QRHistoryEntry {
  id: string;
  createdAt: number;
  label: string;
  snapshot: QRSnapshot;
}

const HISTORY_KEY = 'qr-generator-history';
const MAX_ENTRIES = 20;

function readAll(): QRHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is QRHistoryEntry =>
        e && typeof e.id === 'string' && e.snapshot && typeof e.snapshot === 'object'
    );
  } catch {
    return [];
  }
}

function writeAll(entries: QRHistoryEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage quota exceeded — keep the existing history
  }
}

/* ------------------------------------------------------------------ */
/* Small external store so components can subscribe without effects   */
/* ------------------------------------------------------------------ */

let cache: QRHistoryEntry[] = readAll();
const listeners = new Set<() => void>();

function emit() {
  cache = readAll();
  listeners.forEach((listener) => listener());
}

export function subscribeHistory(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getHistorySnapshot(): QRHistoryEntry[] {
  return cache;
}

export function loadHistory(): QRHistoryEntry[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function addHistoryEntry(label: string, snapshot: QRSnapshot): void {
  const entry: QRHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    label: label || 'QR-код',
    snapshot,
  };
  const entries = [entry, ...readAll()].slice(0, MAX_ENTRIES);
  writeAll(entries);
  emit();
}

export function removeHistoryEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
  emit();
}

export function clearHistory(): void {
  writeAll([]);
  emit();
}