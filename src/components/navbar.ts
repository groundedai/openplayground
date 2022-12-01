import navbarHtml from "./navbar.html?raw";
import navbarCss from "./navbar.css?raw";
import { Component } from "./component";

export class Navbar extends Component {
  constructor({ container }: { container: HTMLElement }) {
    super({ container, html: navbarHtml, css: navbarCss });
  }
}
