import showdown from "showdown";

const mdConverter = new showdown.Converter();

export function mdToHtml(md: string) {
  return mdConverter.makeHtml(md);
}

export function htmlToMd(html: string) {
  let md = html;
  // Headers
  const headerRegex = /<h([1-6])>(.*?)<\/h[1-6]>/g;
  const headerReplace = (match: string, level: string, text: string) => {
    const hash = "#".repeat(parseInt(level));
    return `${hash} ${text}`;
  };
  md = md.replace(headerRegex, headerReplace);
  // Bold
  const boldRegex = /<strong>(.*?)<\/strong>/g;
  const boldReplace = (match: string, text: string) => {
    return `**${text}**`;
  };
  md = md.replace(boldRegex, boldReplace);
  // Italic
  const italicRegex = /<em>(.*?)<\/em>/g;
  const italicReplace = (match: string, text: string) => {
    return `*${text}*`;
  };
  md = md.replace(italicRegex, italicReplace);
  // Paragraphs
  const paragraphRegex = /<p>(.*?)<\/p>/g;
  const paragraphReplace = (match: string, text: string) => {
    return `${text}`;
  };
  md = md.replace(paragraphRegex, paragraphReplace);
  // Line breaks
  const lineBreakRegex = /<br>/g;
  const lineBreakReplace = (match: string) => {
    return `
    `;
  };
  md = md.replace(lineBreakRegex, lineBreakReplace);
  // Links
  const linkRegex = /<a href="(.*?)">(.*?)<\/a>/g;
  const linkReplace = (match: string, href: string, text: string) => {
    return `[${text}](${href})`;
  };
  md = md.replace(linkRegex, linkReplace);
  // Lists
  const listRegex = /<li>(.*?)<\/li>/g;
  const listReplace = (match: string, text: string) => {
    return `- ${text}`;
  };
  md = md.replace(listRegex, listReplace);
  // Divs
  const divRegex = /<div>(.*?)<\/div>/g;
  const divReplace = (match: string, text: string) => {
    return `\n${text}`;
  };
  md = md.replace(divRegex, divReplace);
  // Remove all other tags
  const tagRegex = /<.*?>/g;
  const tagReplace = (match: string) => {
    return "";
  };
  md = md.replace(tagRegex, tagReplace);
  return md;
}
