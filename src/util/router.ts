export class Route {
  pathRegex: RegExp;
  callback: (path: string) => void;

  constructor(pathRegex: RegExp | string, callback: (path: string) => void) {
    if (typeof pathRegex === "string") {
      pathRegex = new RegExp("\#" + pathRegex);
    }
    this.pathRegex = pathRegex;
    this.callback = callback;
  }
}

export class Router {
  window: Window;
  routes: Array<Route> = [];

  constructor(window: Window, routes: Array<Route>) {
    this.window = window;
    this.routes = routes;
    this.window.addEventListener("popstate", () => {
      const path = this.window.location.hash || "#/";
      console.log("popstate", path);
      this.navigateTo(path);
    });
  }

  navigateTo(path: string) {
    console.log(path);
    const route = this.routes.find((r: Route) => {
      return r.pathRegex.test(path);
    });
    if (route) {
      route.callback(path);
    }
  }

  goTo(path: string) {
    path = "#" + path;
    this.navigateTo(path);
    this.window.history.pushState({}, "", path);
  }
}
