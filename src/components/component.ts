import { renderTemplate } from "../util/string";
import { Snackbar } from "./snackbar";
import { errorMessageDuration, infoMessageDuration } from "../globals";

export class Component {
  container: HTMLElement;

  constructor({
    container,
    html = "",
    props = {},
    css = "",
  }: {
    container: HTMLElement;
    html?: string;
    props?: any;
    css?: string;
  }) {
    this.container = container || document.createElement("div");
    if (html) {
      const htmlWithProps = renderTemplate(html, props);
      this.container.innerHTML = htmlWithProps;
    }
    if (css) {
      const style = document.createElement("style");
      style.textContent = css;
      this.container.appendChild(style);
    }
  }

  on(event: string, callback: (e: any) => void) {
    this.container.addEventListener(event, (e: any) => {
      callback(e);
    });
  }

  showSnackbar({
    messageHtml,
    position = "top",
    type = "info",
    duration,
  }: {
    messageHtml: string;
    position?: string;
    type?: string;
    duration?: number;
  }) {
    if (!duration && type === "error") {
      duration = errorMessageDuration;
    } else if (!duration) {
      duration = infoMessageDuration;
    }
    const body = document.createElement("div");
    body.innerHTML = messageHtml;
    const snackbar = new Snackbar({ body, position, type, duration });
    snackbar.render();
    snackbar.show();
  }
}
