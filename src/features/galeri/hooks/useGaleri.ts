"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import { GaleriItem, GaleriFormValues, GaleriStats, StatusPublikasi } from "../types";
import { initialGaleriData } from "../data/initialGaleriData";
import { toast } from "sonner";

const STORAGE_KEY = "piki_galeri_data";
const EVENT_NAME = "piki:galeri_updated";

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

let cachedSnapshot: GaleriItem[] = initialGaleriData;
let lastRaw: string | null = null;

function getSnapshot(): GaleriItem[] {
  if (typeof window === "undefined") return initialGaleriData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedSnapshot = initialGaleriData;
      lastRaw = null;
      return cachedSnapshot;
    }
    if (raw !== lastRaw) {
      lastRaw = raw;
      const parsed = JSON.parse(raw);
      cachedSnapshot =
        Array.isArray(parsed) && parsed.length > 0
          ? parsed
          : initialGaleriData;
    }
    return cachedSnapshot;
  } catch (e) {
    console.error("Failed to read galeri data from localStorage", e);
    return initialGaleriData;
  }
}

function getServerSnapshot(): GaleriItem[] {
  return initialGaleriData;
}

function persistGaleri(data: GaleriItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
  } catch (e) {
    console.error("Failed to save galeri data to localStorage", e);
  }
}

export function useGaleri() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Statistics calculation
  const stats: GaleriStats = useMemo(() => {
    let photoCount = 0;
    let videoCount = 0;
    let instagramCount = 0;
    let publishedCount = 0;
    let draftCount = 0;
    let spotlightCount = 0;

    for (const item of items) {
      if (item.type === "PHOTO") photoCount++;
      else if (item.type === "VIDEO") videoCount++;
      else if (item.type === "INSTAGRAM") instagramCount++;

      if (item.status === "PUBLISHED") publishedCount++;
      else draftCount++;

      if (item.featured) spotlightCount++;
    }

    return {
      total: items.length,
      photoCount,
      videoCount,
      instagramCount,
      publishedCount,
      draftCount,
      spotlightCount,
    };
  }, [items]);

  // Add new media
  const addMedia = useCallback(
    (values: GaleriFormValues) => {
      const newItem: GaleriItem = {
        ...values,
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // If set as featured spotlight, unset existing spotlight
      let updatedList = [...items];
      if (values.featured) {
        updatedList = updatedList.map((i) => ({ ...i, featured: false }));
      }

      updatedList = [newItem, ...updatedList];
      persistGaleri(updatedList);
      toast.success("Dokumentasi media berhasil ditambahkan");
      return newItem;
    },
    [items],
  );

  // Update existing media
  const updateMedia = useCallback(
    (id: string, values: Partial<GaleriFormValues>) => {
      const updatedList = items.map((i) => {
        if (i.id === id) {
          return {
            ...i,
            ...values,
            updatedAt: new Date().toISOString(),
          };
        }
        // If this item is being set as featured, ensure other items are unfeatured
        if (values.featured) {
          return { ...i, featured: false };
        }
        return i;
      });

      persistGaleri(updatedList);
      toast.success("Dokumentasi media berhasil diperbarui");
    },
    [items],
  );

  // Delete media
  const deleteMedia = useCallback(
    (id: string) => {
      const target = items.find((i) => i.id === id);
      const updatedList = items.filter((i) => i.id !== id);
      persistGaleri(updatedList);
      toast.success(`Media "${target?.title || id}" telah dihapus`);
    },
    [items],
  );

  // Toggle status (PUBLISHED <-> DRAFT)
  const toggleStatus = useCallback(
    (id: string) => {
      const updatedList = items.map((item): GaleriItem => {
        if (item.id === id) {
          const nextStatus: StatusPublikasi =
            item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
          toast.success(
            `Status "${item.title}" diubah menjadi ${
              nextStatus === "PUBLISHED" ? "Tayang Publik" : "Draf Internal"
            }`,
          );
          return { ...item, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return item;
      });
      persistGaleri(updatedList);
    },
    [items],
  );

  // Toggle featured spotlight
  const toggleFeatured = useCallback(
    (id: string) => {
      const target = items.find((i) => i.id === id);
      const isCurrentlyFeatured = Boolean(target?.featured);

      const updatedList = items.map((item) => {
        if (item.id === id) {
          const nextFeatured = !isCurrentlyFeatured;
          if (nextFeatured) {
            toast.success(`"${item.title}" dijadikan Spotlight Utama di halaman galeri!`);
          } else {
            toast.info(`Highlight utama dinonaktifkan untuk "${item.title}"`);
          }
          return { ...item, featured: nextFeatured, updatedAt: new Date().toISOString() };
        }
        // If enabling for target, disable for all other items
        if (!isCurrentlyFeatured) {
          return { ...item, featured: false };
        }
        return item;
      });

      persistGaleri(updatedList);
    },
    [items],
  );

  // Reset to default data
  const resetToDefault = useCallback(() => {
    persistGaleri(initialGaleriData);
    toast.success("Data galeri berhasil dikembalikan ke default bawaan sistem");
  }, []);

  return {
    items,
    stats,
    addMedia,
    updateMedia,
    deleteMedia,
    toggleStatus,
    toggleFeatured,
    resetToDefault,
  };
}
