export class Component {
  container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  on(event: string, callback: (e: any) => void) {
    this.container.addEventListener(event, (e: any) => {
      callback(e);
    });
  }
}
