export class Component {
  container: HTMLElement;

  constructor({ container }: { container?: HTMLElement }) {
    this.container = container || document.createElement("div");
  }

  on(event: string, callback: (e: any) => void) {
    this.container.addEventListener(event, (e: any) => {
      callback(e);
    });
  }
}
