import { Record } from "../types";
import recordViewHtml from "./record-view.html?raw";
import showdown from "showdown";

const mdConverter = new showdown.Converter();

export class RecordView {
  container: HTMLDivElement;
  record: Record;

  constructor(container: HTMLDivElement, record: Record) {
    this.container = container;
    this.record = record;
  }

  render() {
    const html = recordViewHtml;
    let htmlWithProps = html;
    const props: any = {
      recordText: mdConverter.makeHtml(this.record.text),
    };
    for (const key in props) {
      const value = props[key];
      const re = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      htmlWithProps = htmlWithProps.replace(re, value);
    }
    this.container.innerHTML = htmlWithProps;
    this.addListeners();
  }

  addListeners() {
    // this.render();
  }
}
