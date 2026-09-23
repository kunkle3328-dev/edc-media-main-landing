'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Subscribe to URL hash changes
function subscribeHash(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function getHashSnapshot(): string {
  return typeof window !== 'undefined' ? window.location.hash : '';
}

function getServerHashSnapshot(): string {
  return '';
}

export function useUrlHash(): string {
  return useSyncExternalStore(
    subscribeHash,
    getHashSnapshot,
    getServerHashSnapshot
  );
}

// Storage change notification channel for cross-component reactivity
let storageVersion = 0;

export function notifyStorageChange(): void {
  storageVersion++;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edc_storage_updated'));
  }
}

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('edc_storage_updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('edc_storage_updated', callback);
  };
}

function getStorageSnapshot(): number {
  return storageVersion;
}

function getServerStorageSnapshot(): number {
  return 0;
}

export function useStorageChangeVersion(): number {
  return useSyncExternalStore(
    subscribeStorage,
    getStorageSnapshot,
    getServerStorageSnapshot
  );
}
