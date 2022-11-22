import compareViewHtml from "./compare-view.html?raw";
import { View } from "./view";
import { Job } from "../types";

export class CompareView extends View {
  jobA: Job;
  jobB: Job;

  constructor({
    container,
    jobA,
    jobB,
  }: {
    container: HTMLDivElement;
    jobA: Job | undefined;
    jobB: Job | undefined;
  }) {
    if (!jobA) {
      throw new Error("Job A is undefined");
    }
    if (!jobB) {
      throw new Error("Job B is undefined");
    }
    const props = {
      jobAName: jobA.name,
      jobBName: jobB.name,
    };
    super({
      container,
      html: compareViewHtml,
      props,
    });
    this.jobA = jobA;
    this.jobB = jobB;
  }

  render() {}
}
