import { Snackbar } from "../components/snackbar";
import { renderTemplate } from "../util/string";

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
}
