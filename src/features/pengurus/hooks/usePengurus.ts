"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import { PengurusItem, PengurusFormValues, PengurusStats } from "../types";
import { initialPengurusData } from "../data/dummyPengurusData";

const STORAGE_KEY = "piki_pengurus_data";
const EVENT_NAME = "piki:pengurus_updated";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedSnapshot: PengurusItem[] = initialPengurusData;
let lastRaw: string | null = null;

function getSnapshot(): PengurusItem[] {
  if (typeof window === "undefined") return initialPengurusData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedSnapshot = initialPengurusData;
      lastRaw = null;
      return cachedSnapshot;
    }
    if (raw !== lastRaw) {
      lastRaw = raw;
      const parsed = JSON.parse(raw);
      cachedSnapshot =
        Array.isArray(parsed) && parsed.length > 0
          ? parsed
          : initialPengurusData;
    }
    return cachedSnapshot;
  } catch (e) {
    console.error("Failed to read pengurus data from localStorage", e);
    return initialPengurusData;
  }
}

function getServerSnapshot(): PengurusItem[] {
  return initialPengurusData;
}

function persistPengurus(data: PengurusItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
  } catch (e) {
    console.error("Failed to save pengurus data to localStorage", e);
  }
}

export function usePengurus() {
  const items = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // 1. Add Pengurus
  const addPengurus = useCallback((form: PengurusFormValues) => {
    const current = getSnapshot();
    const now = new Date().toISOString();
    const newItem: PengurusItem = {
      ...form,
      id: `pengurus-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const next = [newItem, ...current];
    persistPengurus(next);
    return newItem;
  }, []);

  // 2. Update Pengurus
  const updatePengurus = useCallback(
    (id: string, form: Partial<PengurusFormValues>) => {
      const current = getSnapshot();
      const next = current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...form,
              updatedAt: new Date().toISOString(),
            }
          : item,
      );
      persistPengurus(next);
    },
    [],
  );

  // 3. Delete Pengurus
  const deletePengurus = useCallback((id: string) => {
    const current = getSnapshot();
    const next = current.filter((item) => item.id !== id);
    persistPengurus(next);
  }, []);

  // 4. Toggle Status (PUBLISHED <-> DRAFT)
  const toggleStatus = useCallback((id: string) => {
    const current = getSnapshot();
    const next = current.map((item) =>
      item.id === id
        ? {
            ...item,
            status:
              item.status === "PUBLISHED"
                ? ("DRAFT" as const)
                : ("PUBLISHED" as const),
            updatedAt: new Date().toISOString(),
          }
        : item,
    );
    persistPengurus(next);
  }, []);

  // 5. Reset to default initial data
  const resetToDefault = useCallback(() => {
    persistPengurus(initialPengurusData);
  }, []);

  // Computed Stats
  const stats: PengurusStats = useMemo(() => {
    return {
      total: items.length,
      inti: items.filter((i) => i.kategori === "INTI").length,
      bidang: items.filter((i) => i.kategori === "BIDANG").length,
      penasehat: items.filter((i) => i.kategori === "PENASEHAT").length,
      published: items.filter((i) => i.status === "PUBLISHED").length,
      draft: items.filter((i) => i.status === "DRAFT").length,
    };
  }, [items]);

  return {
    items,
    isLoaded: true,
    stats,
    addPengurus,
    updatePengurus,
    deletePengurus,
    toggleStatus,
    resetToDefault,
  };
}
