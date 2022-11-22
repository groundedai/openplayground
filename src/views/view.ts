import { Snackbar } from "../components/snackbar";
import { renderTemplate } from "../util/string";

export class View {
  container: HTMLDivElement;

  constructor({
    container,
    html = "",
    props = {},
  }: {
    container: HTMLDivElement;
    html?: string;
    props?: any;
  }) {
    this.container = container;
    const htmlWithProps = renderTemplate(html, props);
    this.container.innerHTML = htmlWithProps;
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
