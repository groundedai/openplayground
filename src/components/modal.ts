import "./modal.css";
import modalHtml from "./modal.html?raw";

export class Modal {
  container: HTMLDivElement;
  modalDiv: HTMLDivElement | null = null;
  bodyContainer: HTMLDivElement | null = null;
  closeButton: HTMLButtonElement | null = null;
  body: HTMLDivElement;
  showLeftRightButtons: boolean = false;

  constructor(
    container: HTMLDivElement,
    body: HTMLDivElement,
    showLeftRightButtons: boolean = false
  ) {
    if (!(container instanceof HTMLDivElement)) {
      throw new Error(
        `Modal container must be of type HTMLDivElement, got ${container}`
      );
    }
    this.container = container;
    if (!(body instanceof HTMLDivElement)) {
      throw new Error(`Modal body must be of type HTMLDivElement, got ${body}`);
    }
    this.body = body;
    this.showLeftRightButtons = showLeftRightButtons;
  }

  render() {
    console.log(document.body)
    document.body.appendChild(this.container); // Move container to top level
    this.container.innerHTML = modalHtml;
    this.modalDiv = this.container.querySelector("#modal") as HTMLDivElement;
    console.log("modalDiv", this.modalDiv);
    this.hide();
    this.bodyContainer = this.container.querySelector(
      "#modal-body"
    ) as HTMLDivElement;
    this.closeButton = this.container.querySelector(
      "#modal-close-button"
    ) as HTMLButtonElement;
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
    // const modalLeft = this.container.querySelector("#modal-left") as HTMLButtonElement;
    // const modalRight = this.container.querySelector("#modal-right") as HTMLButtonElement;
    // modalLeft.addEventListener("click", () => this.onLeft());
    // modalRight.addEventListener("click", () => this.onRight());
    // If user clicks outside of modal, close it
    // window.addEventListener("click", (event) => {
    //   if (event.target === modal) {
    //     this.hide();
    //   }
    window.addEventListener("click", (e) => {
      if (e.target === this.modalDiv) {
        this.hide();
      }
    });
  }
}
