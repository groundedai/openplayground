export function getItems(key: string): Array<any> {
  const item = localStorage.getItem(key);
  if (item) {
    return JSON.parse(item);
  } else {
    return [];
  }
}

export function createItem(key: string, item: any) {
  const items = getItems(key);
  items.push(item);
  localStorage.setItem(key, JSON.stringify(items));
}

export function updateItem(key: string, item: any) {
  const items = getItems(key);
  const index = items.findIndex((i: any) => i.id === item.id);
  items[index] = item;
  localStorage.setItem(key, JSON.stringify(items));
}

export function deleteItem(key: string, item: any) {
  const items = getItems(key);
  const index = items.findIndex((i: any) => i.id === item.id);
  items.splice(index, 1);
  localStorage.setItem(key, JSON.stringify(items));
}
