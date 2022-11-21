import snackbarHtml from "./snackbar.html?raw";
import "./snackbar.css";

export class Snackbar {
  container: HTMLDivElement;
  snackbarDiv: HTMLDivElement | null = null;
  bodyContainer: HTMLDivElement | null = null;
  body: HTMLDivElement;
  duration: number = 3000;
  position: string = "bottom";
  closeButton: HTMLButtonElement | null = null;
  type: string;

  constructor({
    body,
    duration = 3000,
    position = "bottom",
    type = "info",
  }: {
    body: HTMLDivElement;
    duration?: number;
    position?: string;
    type?: string;
  }) {
    this.container = document.createElement("div");
    if (!(body instanceof HTMLDivElement)) {
      throw new Error(
        `Snackbar body must be of type HTMLDivElement, got ${body}`
      );
    }
    this.body = body;
    this.duration = duration;
    this.position = position;
    this.type = type;
  }

  render() {
    document.body.appendChild(this.container); // Move container to top level
    this.container.innerHTML = snackbarHtml;
    this.snackbarDiv = this.container.querySelector(
      ".snackbar"
    ) as HTMLDivElement;
    this.snackbarDiv.classList.add(`snackbar-${this.position}`);
    this.snackbarDiv.classList.add(`snackbar-${this.type}`);
    // this.hide();
    this.bodyContainer = this.container.querySelector(
      ".snackbar-body"
    ) as HTMLDivElement;
    this.closeButton = this.container.querySelector(
      ".snackbar-close-button"
    ) as HTMLButtonElement;
    this.bodyContainer.innerHTML = "";
    this.bodyContainer.appendChild(this.body);
    this.addListeners();
  }

  show() {
    this.snackbarDiv!.classList.add("show");
    this.container.style.display = "block";
    // this.snackbarDiv!.classList.remove("hide");
    setTimeout(() => this.hide(), this.duration);
  }

  hide() {
    this.snackbarDiv!.classList.remove("show");
    this.container.style.display = "none";
    // this.snackbarDiv!.classList.add("hide");
  }

  addListeners() {
    this.closeButton!.addEventListener("click", () => this.hide());
  }
}
