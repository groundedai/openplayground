import { Component } from "./component";
import datatableHtml from "./datatable.html?raw";
import datatableCss from "./datatable.css?raw";

export type Column = {
  name: string;
  key: string;
  searchable?: boolean;
  classes?: string[];
};

export type Row = {
  id: string | number;
  [key: string]: any;
};

export type Action = "search";

export class DataTable extends Component {
  columns: Array<Column>;
  searchableColumns: Array<Column>;
  rows: Array<TableRow> = [];
  filteredRows: Array<TableRow> = [];
  emptyMessage: string = "No data to display";
  page: number = 1;
  rowsPerPage: number = 10;
  title: string = "";
  rowClicked: (row: TableRow) => void = () => {};
  actions: Array<Action> = [];
  showFooter: boolean = false;
  pageSizeOptions = [10, 25, 50];
  showPageSelector: boolean = true;
  showPageSizeSelector: boolean = false;
  showPrevNextButtons: boolean = true;
  body: HTMLDivElement = this.container.querySelector(
    "#datatable-body"
  ) as HTMLDivElement;
  header: HTMLHeadingElement = this.container.querySelector(
    "#datatable-header"
  ) as HTMLHeadingElement;
  headerCol: HTMLDivElement = this.container.querySelector(
    "#header-col"
  ) as HTMLDivElement;
  footer: HTMLDivElement = this.container.querySelector(
    "#datatable-footer"
  ) as HTMLDivElement;
  rowCountContainer: HTMLDivElement = this.container.querySelector(
    ".row-count"
  ) as HTMLDivElement;
  rowCountValue: HTMLSpanElement = this.container.querySelector(
    "#row-count-value"
  ) as HTMLSpanElement;
  searchInput: HTMLInputElement = this.container.querySelector(
    ".search-input"
  ) as HTMLInputElement;
  searchContainer: HTMLDivElement = this.container.querySelector(
    ".search"
  ) as HTMLDivElement;
  pageSelectorContainers: NodeListOf<HTMLElement> =
    this.container.querySelectorAll(".page-selector-container");
  pageSelectors: NodeListOf<HTMLSelectElement> =
    this.container.querySelectorAll(".page-selector");
  pageSizeSelectorContainers: NodeListOf<HTMLElement> =
    this.container.querySelectorAll(".page-size-selector-container");
  pageSizeSelectors: NodeListOf<HTMLSelectElement> =
    this.container.querySelectorAll(".page-size-selector");
  prevNextButtonContainers: NodeListOf<HTMLElement> =
    this.container.querySelectorAll(".prev-next-container");
  prevPageButtons: NodeListOf<HTMLButtonElement> =
    this.container.querySelectorAll(".prev-page-btn");
  nextPageButtons: NodeListOf<HTMLButtonElement> =
    this.container.querySelectorAll(".next-page-btn");

  constructor({
    container,
    rows,
    columns,
    emptyMessage,
    page,
    rowsPerPage,
    title,
    rowClicked,
    actions,
    showFooter,
    showPageSelector,
    showPageSizeSelector,
    showPrevNextButtons,
  }: {
    container: HTMLElement;
    rows: Array<Row>;
    columns: Array<Column>;
    emptyMessage?: string;
    page?: number;
    rowsPerPage?: number;
    title?: string;
    rowClicked?: (row: TableRow) => void;
    actions?: Array<Action>;
    showFooter?: boolean;
    showPageSelector?: boolean;
    showPageSizeSelector?: boolean;
    showPrevNextButtons?: boolean;
  }) {
    super({ container, html: datatableHtml, css: datatableCss });
    this.columns = columns;
    this.searchableColumns = columns.filter((c) => c.searchable);
    this.updateRows(rows);
    this.emptyMessage = emptyMessage || this.emptyMessage;
    this.page = page || this.page;
    this.rowsPerPage = rowsPerPage || this.rowsPerPage;
    this.rowClicked = rowClicked || this.rowClicked;
    this.actions = actions || this.actions;
    this.showFooter = showFooter || this.showFooter;
    this.title = title || this.title;
    this.showPageSelector = showPageSelector || this.showPageSelector;
    this.showPageSizeSelector =
      showPageSizeSelector || this.showPageSizeSelector;
    this.showPrevNextButtons = showPrevNextButtons || this.showPrevNextButtons;
    this.initListeners();
  }

  updateRows(rows: Array<Row>) {
    this.rows = rows.map((r) => new TableRow(r.id, r, this.columns));
    this.filteredRows = this.rows;
  }

  getPageCount() {
    return Math.ceil(this.filteredRows.length / this.rowsPerPage);
  }

  initListeners() {
    this.pageSelectors.forEach((s) => {
      s.addEventListener("change", (e: Event) => {
        this.page = parseInt((e.target as HTMLSelectElement).value);
        this.render();
      });
    });
    this.pageSizeSelectors.forEach((s) => {
      s.addEventListener("change", (e: Event) => {
        this.rowsPerPage = parseInt((e.target as HTMLSelectElement).value);
        this.page = 1;
        this.render();
      });
    });
    this.searchInput.addEventListener("input", () => {
      const search = this.searchInput.value;
      this.filteredRows = this.rows.filter((r) => {
        for (const key in r.data) {
          if (this.searchableColumns.find((c: Column) => c.key === key)) {
            const val = r.data[key];
            const regex = new RegExp(
              nonTagRegex.replace("{{val}}", search),
              "gi"
            );
            if (regex.test(val)) {
              return true;
            }
          }
        }
        return false;
      });
      this.page = 1;
      this.render();
    });
    this.prevPageButtons.forEach((b) => {
      b.addEventListener("click", () => {
        this.page = Math.max(this.page - 1, 1);
        this.render();
      });
    });
    this.nextPageButtons.forEach((b) => {
      b.addEventListener("click", () => {
        this.page = Math.min(this.page + 1, this.getPageCount());
        this.render();
      });
    });
  }

  render() {
    this.header.innerHTML = this.title;
    this.body.innerHTML = "";
    if (this.filteredRows.length === 0) {
      this.body.innerHTML = `<div class="empty-message">${this.emptyMessage}</div>`;
      this.rowCountContainer.classList.add("hidden");
      return;
    } else {
      this.rowCountContainer.classList.remove("hidden");
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
    const start = (this.page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.filteredRows.slice(start, end).forEach((row) => {
      const searchVal = this.searchInput.value;
      row.highlightStrings = [searchVal];
      row.render();
      tbody.appendChild(row.tr);
    });
    dataTable.appendChild(tbody);
    this.body.appendChild(dataTable);
    this.rowCountValue.innerHTML = this.filteredRows.length.toString();
    if (this.showFooter) {
      this.footer.classList.remove("hidden");
    } else {
      this.footer.classList.add("hidden");
    }
    if (this.title.length > 0) {
      this.headerCol.classList.remove("hidden");
    } else {
      this.headerCol.classList.add("hidden");
    }
    this.renderActions();
    this.addListeners();
  }

  renderPageNavigation() {
    const pageCount = this.getPageCount();
    if (this.showPageSelector && pageCount > 1) {
      this.pageSelectorContainers.forEach((c) => {
        c.classList.remove("hidden");
      });
      this.pageSelectors.forEach((s) => {
        s.innerHTML = "";
        for (let i = 1; i <= this.getPageCount(); i++) {
          const option = document.createElement("option");
          option.value = i.toString();
          option.innerHTML = i.toString();
          if (i === this.page) {
            option.selected = true;
          }
          s.appendChild(option);
        }
      });
    } else {
      this.pageSelectorContainers.forEach((c) => {
        c.classList.add("hidden");
      });
    }
    if (this.showPageSizeSelector && pageCount > 1) {
      this.pageSizeSelectorContainers.forEach((c) => {
        c.classList.remove("hidden");
      });
      this.pageSizeSelectors.forEach((s) => {
        s.innerHTML = "";
        this.pageSizeOptions.forEach((r) => {
          const option = document.createElement("option");
          option.value = r.toString();
          option.innerHTML = r.toString();
          if (r === this.rowsPerPage) {
            option.selected = true;
          }
          s.appendChild(option);
        });
      });
    } else {
      this.pageSizeSelectorContainers.forEach((c) => {
        c.classList.add("hidden");
      });
    }
    if (this.showPrevNextButtons && pageCount > 1) {
      this.prevNextButtonContainers.forEach((c) => {
        c.classList.remove("hidden");
      });
    } else {
      this.prevNextButtonContainers.forEach((c) => {
        c.classList.add("hidden");
      });
    }
  }

  renderActions() {
    this.renderPageNavigation();
    if (this.actions.includes("search")) {
      this.searchContainer.classList.remove("hidden");
    } else {
      this.searchContainer.classList.add("hidden");
    }
  }

  addListeners() {
    const rows = this.body.querySelectorAll("tbody tr");
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
    const row = this.filteredRows.find((r) => r.id === rowId);
    if (row) {
      row.updateCell({ key, value });
    }
  }
}

const nonTagRegex = "(?![^<]*>){{val}}";

export class TableRow {
  id: string | number;
  data: any;
  columns: Array<Column>;
  tr: HTMLTableRowElement = document.createElement("tr");
  highlightStrings: Array<string> = [];

  constructor(
    id: string | number,
    data: any,
    columns: Array<Column>,
    highlightStrings?: Array<string>
  ) {
    this.id = id;
    this.data = data;
    this.columns = columns;
    this.highlightStrings = highlightStrings || this.highlightStrings;
  }

  render() {
    this.tr.innerHTML = "";
    this.tr.dataset.id = this.id.toString();
    this.highlightStrings = this.highlightStrings.filter((s) => s.length > 0);
    this.columns.forEach((c: Column) => {
      const td = document.createElement("td");
      const val = this.data[c.key];
      td.innerHTML = val;
      if (c.searchable) {
        if (this.highlightStrings.length > 0) {
          this.highlight(td);
        }
      }
      const classes = c.classes || [];
      classes.forEach((c) => td.classList.add(c));
      td.dataset.column = c.key;
      td.dataset.value = this.data[c.key];
      this.tr.appendChild(td);
    });
  }

  highlight(td: HTMLTableCellElement) {
    this.highlightStrings.forEach((s) => {
      const regex = new RegExp(nonTagRegex.replace("{{val}}", s), "gi");
      // Get match positions
      const matches = [];
      let match;
      while ((match = regex.exec(td.innerHTML))) {
        matches.push(match.index);
      }
      // Replace matches with highlighted text
      let offset = 0;
      matches.forEach((m) => {
        const start = m + offset;
        const end = start + s.length;
        const highlighted = `<span class="highlight">${s}</span>`;
        td.innerHTML =
          td.innerHTML.substring(0, start) +
          highlighted +
          td.innerHTML.substring(end);
        offset += highlighted.length - s.length;
      });
    });
  }

  updateCell({ key, value }: { key: string; value: string }) {
    const td = this.tr.querySelector(`[data-column="${key}"]`);
    if (td) {
      td.innerHTML = value;
    }
  }
}
