import { Data } from "../types";

export function getData() {
  const data: string | null = localStorage.getItem("data");
  if (data) {
    return JSON.parse(data);
  } else {
    return [];
  }
}

export function createData(data: Data) {
  const dataItems = getData();
  dataItems.push(data);
  localStorage.setItem("data", JSON.stringify(dataItems));
}

export function updateData(data: Data) {
  const dataItems = getData();
  const index = dataItems.findIndex((d: Data) => d.id === data.id);
  dataItems[index] = data;
  localStorage.setItem("data", JSON.stringify(dataItems));
}
