import modalHtml from "./modal.html?raw";
import modalCss from "./modal.css?raw";
import { Component } from "../components/component";

export class Modal extends Component {
  modalDiv: HTMLElement = this.container.querySelector("#modal") as HTMLElement;
  bodyContainer: HTMLElement = this.container.querySelector(
    "#modal-body"
  ) as HTMLElement;
  closeButton: HTMLButtonElement = this.container.querySelector(
    "#modal-close-button"
  ) as HTMLButtonElement;
  titleElement: HTMLHeadingElement = this.container.querySelector(
    "#modal-title-text"
  ) as HTMLHeadingElement;
  body: HTMLElement;
  title: string;

  constructor({
    body,
    title,
  }: {
    body?: HTMLElement | string;
    title?: string;
  }) {
    super({ html: modalHtml, css: modalCss });
    if (body) {
      if (typeof body === "string") {
        const div = document.createElement("div");
        div.innerHTML = body;
        this.body = div;
      } else {
        this.body = body;
      }
    } else {
      this.body = document.createElement("div");
    }
    this.title = title || "";
  }

  render() {
    document.body.appendChild(this.container); // Move container to top level
    console.log(this.container);
    this.hide();
    this.titleElement.innerText = this.title;
    this.bodyContainer.innerHTML = "";
    this.bodyContainer.appendChild(this.body);
    this.addListeners();
  }

  show() {
    this.modalDiv.style.display = "block";
  }

  hide() {
    this.modalDiv.style.display = "none";
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
