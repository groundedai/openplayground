import "./modal.css";
import modalHtml from "./modal.html?raw";

export class Modal {
  container: HTMLElement;
  modalDiv: HTMLElement | null = null;
  bodyContainer: HTMLElement | null = null;
  closeButton: HTMLButtonElement | null = null;
  titleElement: HTMLHeadingElement | null = null;
  body: HTMLElement;
  title: string;

  constructor({
    container,
    body,
    title,
  }: {
    container?: HTMLElement;
    body: HTMLElement;
    title?: string;
  }) {
    this.container = container || document.createElement("div");
    if (!(body instanceof HTMLElement)) {
      throw new Error(`Modal body must be of type HTMLElement, got ${body}`);
    }
    this.body = body;
    this.title = title || "";
  }

  render() {
    document.body.appendChild(this.container); // Move container to top level
    this.container.innerHTML = modalHtml;
    this.modalDiv = this.container.querySelector("#modal") as HTMLElement;
    this.hide();
    this.bodyContainer = this.container.querySelector(
      "#modal-body"
    ) as HTMLElement;
    this.closeButton = this.container.querySelector(
      "#modal-close-button"
    ) as HTMLButtonElement;
    this.titleElement = this.container.querySelector(
      "#modal-title-text"
    ) as HTMLHeadingElement;
    if (this.title) {
      this.titleElement!.innerText = this.title;
    }
    this.bodyContainer.innerHTML = "";
    this.bodyContainer.appendChild(this.body);
    this.addListeners();
  }

  show() {
    this.modalDiv!.style.display = "block";
  }

  hide() {
    this.modalDiv!.style.display = "none";
  }

  addListeners() {
    this.closeButton!.addEventListener("click", () => this.hide());
    window.addEventListener("click", (e) => {
      if (e.target === this.modalDiv) {
        this.hide();
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        this.hide();
      }
    });
    this.container.addEventListener("close-modal", () => this.hide());
  }
}
