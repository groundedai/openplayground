type Column = {
  name: string;
  key: string;
  classes?: string[];
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
    this.container.innerHTML = "";
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
      th.dataset.key = c.key;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    dataTable.appendChild(thead);
    const tbody = document.createElement("tbody");
    this.data.forEach((d: any) => {
      const row = new TableRow(d.id, d, this.columns);
      this.rows.push(row);
      row.render();
      tbody.appendChild(row.tr);
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

  updateCell({
    rowId,
    key,
    value,
  }: {
    rowId: string;
    key: string;
    value: string;
  }) {
    const row = this.rows.find((r) => r.id === rowId);
    if (row) {
      row.updateCell({ key, value });
    }
  }
}

export class TableRow {
  id: string;
  data: any;
  columns: Array<Column>;
  tr: HTMLTableRowElement = document.createElement("tr");

  constructor(id: string, data: any, columns: Array<Column>) {
    this.id = id;
    this.data = data;
    this.columns = columns;
  }

  render() {
    this.tr.dataset.id = this.id.toString();
    this.columns.forEach((c: Column) => {
      const td = document.createElement("td");
      td.innerHTML = this.data[c.key];
      const classes = c.classes || [];
      classes.forEach((c) => td.classList.add(c));
      td.dataset.column = c.key;
      td.dataset.value = this.data[c.key];
      this.tr.appendChild(td);
    });
  }

  updateCell({ key, value }: { key: string; value: string }) {
    const td = this.tr.querySelector(`[data-column="${key}"]`);
    if (td) {
      td.innerHTML = value;
    }
  }
}
