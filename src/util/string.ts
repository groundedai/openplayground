export function renderTemplate(
  template: string,
  props: { [key: string]: string },
  pattern: RegExp = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g
) {
  let withProps = template;
  const matches = template.match(pattern);
  if (matches) {
    matches.forEach((match) => {
      const key = match.replace(pattern, "$1");
      const value = props[key];
      withProps = withProps.replace(match, value);
    });
  }
  return withProps;
}

export function newlinesToBreaks(text: string) {
  return text
    .replace(/\n/g, "<br>")
    .replace(/\r/g, "<br>")
    .replace(/\\n/g, "<br>");
}

export function titleCase(text: string) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
