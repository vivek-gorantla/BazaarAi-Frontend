// Global event bus for broadcasting catalog and inventory updates across the app

export const INVENTORY_UPDATED_EVENT = "bazaar:inventory-updated";

export function dispatchInventoryUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(INVENTORY_UPDATED_EVENT));
  }
}

export function subscribeInventoryUpdated(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(INVENTORY_UPDATED_EVENT, handler);
  return () => {
    window.removeEventListener(INVENTORY_UPDATED_EVENT, handler);
  };
}
