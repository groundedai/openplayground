type Column = {
  name: string;
  key: string;
};

export class DataTable {
  container: HTMLDivElement;
  data: Array<any>;
  columns: Array<Column>;
  rows: Array<TableRow> = [];
  emptyMessage: string = "No data to display";
  rowClicked: (row: TableRow) => void = () => {};

  constructor(
    container: HTMLDivElement,
    data: Array<any>,
    columns: Array<Column>,
    emptyMessage?: string,
    rowClicked: (row: TableRow) => void = () => {}
  ) {
    this.container = container;
    this.data = data;
    this.columns = columns;
    this.emptyMessage = emptyMessage || this.emptyMessage;
    this.rowClicked = rowClicked;
  }

  render() {
    if (this.data.length === 0) {
      this.container.innerHTML = `<div class="empty-message">${this.emptyMessage}</div>`;
      return;
    }
    const dataTable = document.createElement("table");
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    this.columns.forEach((c) => {
      const th = document.createElement("th");
      th.innerHTML = c.name;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    dataTable.appendChild(thead);
    const tbody = document.createElement("tbody");
    this.data.forEach((d: any) => {
      const row = new TableRow(d.id, d, this.columns);
      this.rows.push(row);
      tbody.appendChild(row.render());
    });
    dataTable.appendChild(tbody);
    this.container.appendChild(dataTable);
    this.addListeners();
  }

  addListeners() {
    const rows = this.container.querySelectorAll("tbody tr");
    rows.forEach((r) => {
      r.addEventListener("click", (e: Event) => {
        const row = (e.target as HTMLElement).closest("tr");
        if (row) {
          const id: string = row.dataset.id || "";
          if (id) {
            const row = this.rows.find((r) => r.id === id);
            if (row) {
              this.rowClicked(row);
            }
          }
        }
      });
    });
  }
}

export class TableRow {
  id: string;
  data: any;
  columns: Array<Column>;

  constructor(id: string, data: any, columns: Array<Column>) {
    this.id = id;
    this.data = data;
    this.columns = columns;
  }

  render() {
    const tr = document.createElement("tr");
    tr.dataset.id = this.id.toString();
    this.columns.forEach((c: Column) => {
      const td = document.createElement("td");
      td.innerHTML = this.data[c.key];
      tr.appendChild(td);
    });
    return tr;
  }
}
