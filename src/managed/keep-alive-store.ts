/**
 * This is an in-memory store used to store living MTE objects.
 * It supports the KeepAlive feature of the helper package.
 */

import { EncDec } from "src/types";

type StoreValue = {
  value: EncDec;
  timeout?: number;
};

// The store
const store = new Map<any, StoreValue>();

// Put an "alive" MTE Encoder/Decoder in the store, with it's timeout ID
export function keepItemAlive(id: any, value: EncDec, timeout?: number) {
  store.set(id, {
    value,
    timeout,
  });
}

// Remove an MTE Encoder/Decoder from the store, and clear it's timeout ID
export function takeAliveItem(id: any): EncDec | undefined {
  const item = store.get(id);
  if (!item) {
    return undefined;
  }
  clearTimeout(item.timeout);
  store.delete(id);
  return item.value;
}

// delete an item from the store
export function deleteAliveItem(id: any) {
  store.delete(id);
}
