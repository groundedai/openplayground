import { renderTemplate } from "../util/string";

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
}
