import { Component } from "./component";
import leftDrawerHtml from "./left-drawer.html?raw";

export class LeftDrawer extends Component {
  closeButton: HTMLButtonElement = this.container.querySelector(
    ".close-button"
  ) as HTMLButtonElement;
  drawer: HTMLDivElement = this.container.querySelector(
    ".drawer"
  ) as HTMLDivElement;
  body: HTMLDivElement = this.container.querySelector(
    ".body"
  ) as HTMLDivElement;
  openTriggers: HTMLElement[] = [];

  constructor({ container }: { container: HTMLDivElement }) {
    super({ container, html: leftDrawerHtml });
    this.initListeners();
  }

  get isOpen() {
    return this.drawer.classList.contains("open");
  }

  open() {
    this.drawer.classList.add("open");
    this.container.dispatchEvent(new CustomEvent("open"));
  }

  close() {
    this.drawer.classList.remove("open");
    this.container.dispatchEvent(new CustomEvent("close"));
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  initListeners() {
    this.closeButton?.addEventListener("click", () => {
      this.close();
    });
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const isTrigger = this.openTriggers.some((trigger) =>
        trigger.contains(target)
      );
      const isOutsideDrawer = !this.drawer.contains(target);
      if (isOutsideDrawer && !isTrigger) {
        this.close();
      }
    });
  }
}
