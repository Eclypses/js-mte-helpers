/**
 * This is the default solution for caching MTE State.
 * MTE State values will be saved in-memory here, unless the consumer
 * chooses to provide their own Getter and Setter methods for retreiving
 * state from their own cache solutions; Redis, Memcached, etc.
 */

// The store
const store = new Map();

// Put an Item in the store
export async function setItem(id: any, value: any) {
  store.set(id, value);
}

// Remove an item from the store
export async function takeItem<T>(id: any): Promise<T> {
  const item = store.get(id);
  store.delete(id);
  return item;
}
