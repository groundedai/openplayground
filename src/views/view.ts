import { Snackbar } from "../components/snackbar";
import { renderTemplate } from "../util/string";
import { Modal } from "../components/modal";

export class View {
  container: HTMLDivElement;

  constructor({
    container,
    html = "",
    props = {},
    css = "",
  }: {
    container: HTMLDivElement;
    html?: string;
    props?: any;
    css?: string;
  }) {
    this.container = container;
    const htmlWithProps = renderTemplate(html, props);
    this.container.innerHTML = htmlWithProps;
    if (css) {
      const style = document.createElement("style");
      style.textContent = css;
      this.container.appendChild(style);
    }
  }

  showSnackbar({
    messageHtml,
    position = "top",
    type = "info",
    duration = 3000,
  }: {
    messageHtml: string;
    position?: string;
    type?: string;
    duration?: number;
  }) {
    const body = document.createElement("div");
    body.innerHTML = messageHtml;
    const snackbar = new Snackbar({ body, position, type, duration });
    snackbar.render();
    snackbar.show();
  }

  prompt(message: string, onConfirm: (value: string) => void) {
    const promptBody = document.createElement("div");
    const promptLabel = document.createElement("label");
    promptLabel.textContent = message;
    promptLabel.style.fontWeight = "bold";
    const promptInput = document.createElement("input");
    promptInput.type = "text";
    promptInput.id = "settings-name";
    promptBody.appendChild(promptLabel);
    promptBody.appendChild(promptInput);
    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Confirm";
    const container = document.createElement("div");
    const modal = new Modal(container, promptBody);
    const actions = document.createElement("div");
    actions.classList.add("row");
    actions.classList.add("right");
    confirmButton.onclick = () => {
      onConfirm?.(promptInput.value);
      modal.hide();
    };
    confirmButton.classList.add("right");
    promptInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        confirmButton.click();
      }
    });
    actions.appendChild(confirmButton);
    promptBody.appendChild(actions);
    modal.render();
    modal.show();
    promptInput.focus();
  }
}
