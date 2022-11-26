import showdown from "showdown";

const mdConverter = new showdown.Converter();

export function mdToHtml(md: string) {
  return mdConverter.makeHtml(md);
}

export function htmlToMd(html: string) {
  let md = html;
  // Headers
  const headerRegex = /<h([1-6])>(.*?)<\/h[1-6]>/g;
  const headerReplace = (_: string, level: string, text: string) => {
    const hash = "#".repeat(parseInt(level));
    return `${hash} ${text}`;
  };
  md = md.replace(headerRegex, headerReplace);
  // Bold
  const boldRegex = /<strong>(.*?)<\/strong>/g;
  const boldReplace = (_: string, text: string) => {
    return `**${text}**`;
  };
  md = md.replace(boldRegex, boldReplace);
  // Italic
  const italicRegex = /<em>(.*?)<\/em>/g;
  const italicReplace = (_: string, text: string) => {
    return `*${text}*`;
  };
  md = md.replace(italicRegex, italicReplace);
  // Paragraphs
  const paragraphRegex = /<p>(.*?)<\/p>/g;
  const paragraphReplace = (_: string, text: string) => {
    return `${text}`;
  };
  md = md.replace(paragraphRegex, paragraphReplace);
  // Line breaks
  const lineBreakRegex = /<br>/g;
  const lineBreakReplace = (_: string) => {
    return `
    `;
  };
  md = md.replace(lineBreakRegex, lineBreakReplace);
  // Links
  const linkRegex = /<a href="(.*?)">(.*?)<\/a>/g;
  const linkReplace = (_: string, href: string, text: string) => {
    return `[${text}](${href})`;
  };
  md = md.replace(linkRegex, linkReplace);
  // Lists
  const listRegex = /<li>(.*?)<\/li>/g;
  const listReplace = (_: string, text: string) => {
    return `- ${text}`;
  };
  md = md.replace(listRegex, listReplace);
  // Divs
  const divRegex = /<div>(.*?)<\/div>/g;
  const divReplace = (_: string, text: string) => {
    return `\n${text}`;
  };
  md = md.replace(divRegex, divReplace);
  // Remove all other tags
  const tagRegex = /<.*?>/g;
  const tagReplace = () => {
    return "";
  };
  md = md.replace(tagRegex, tagReplace);
  return md;
}
