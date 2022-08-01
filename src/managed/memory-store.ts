/**
 * The store!
 */
const store = new Map();

/**
 * Put an item in the store.
 */
export async function setItem(id: any, value: any) {
  store.set(id, value);
}

/**
 * Remove an item from the store.
 */
export async function takeItem<T>(id: any): Promise<T> {
  const item = store.get(id);
  store.delete(id);
  return item;
}
