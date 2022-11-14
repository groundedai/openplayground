import showdown from "showdown";

const mdConverter = new showdown.Converter();

export function mdToHtml(md: string) {
  return mdConverter.makeHtml(md);
}