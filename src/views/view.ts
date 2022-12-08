import { renderTemplate } from "../util/string";
import { Modal } from "../components/modal";
import promptModalHtml from "../components/prompt-modal.html?raw";
import { Component } from "../components/component";
import { LeftDrawer } from "../components/left-drawer";

export class View extends Component {
  leftDrawer: LeftDrawer;

  constructor({
    container,
    html,
    css,
    props,
  }: {
    container: HTMLElement;
    html: string;
    css?: string;
    props?: any;
  }) {
    super({ container, html, css, props });
    const rightDrawerContainer = document.querySelector(
      "#right-drawer"
    ) as HTMLDivElement;
    this.leftDrawer = new LeftDrawer({
      container: rightDrawerContainer,
    });
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
    message = message || " ";
    const body = document.createElement("div");
    body.innerHTML = renderTemplate(promptModalHtml, { message });
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
    const modal = new Modal({ title, body });
    modal.render();
    modal.show();
    input.focus();
  }
}
