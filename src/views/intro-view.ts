import introViewHtml from "./intro-view.html?raw";
import introViewCss from "./intro-view.css?raw";
import introMd from "../md/intro.md?raw";
import { mdToHtml } from "../util/markdown";
import { makeTableOfContents } from "../util/dom";
import { View } from "./view";

export class IntroView extends View {
  tocContainer: HTMLElement = this.container.querySelector(
    "#toc"
  ) as HTMLElement;
  bodyContainer: HTMLElement = this.container.querySelector(
    "#intro-body"
  ) as HTMLElement;

  constructor({ container }: { container: HTMLDivElement }) {
    super({ container, html: introViewHtml, css: introViewCss });
    this.bodyContainer.innerHTML = mdToHtml(introMd);
  }

  render() {
    const toc = makeTableOfContents(this.bodyContainer);
    this.tocContainer.appendChild(toc);
  }
}
