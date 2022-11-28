import { renderTemplate } from "../util/string";
import { Snackbar } from "../components/snackbar";
import { Modal } from "../components/modal";
import promptModalHtml from "../components/prompt-modal.html?raw";
import { Component } from "../components/component";

export class View extends Component {
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

  promptUserInput({
    title,
    message,
    onConfirm,
  }: {
    title: string;
    message?: string;
    onConfirm: (value: string) => void;
  }) {
    const body = document.createElement("div");
    message = message || "";
    const html = renderTemplate(promptModalHtml, { message });
    body.innerHTML = html;
    const confirmButton = body.querySelector(
      "#confirm-button"
    ) as HTMLButtonElement;
    confirmButton.onclick = () => {
      onConfirm(input.value);
      modal.hide();
    };
    const input = body.querySelector("#input") as HTMLInputElement;
    input.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        confirmButton.click();
      }
    });
    const container = document.createElement("div");
    const modal = new Modal({ container, title, body });
    modal.render();
    modal.show();
    input.focus();
  }
}
