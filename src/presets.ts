const tagColors = [
  "red",
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "grey",
  "blue-grey",
];

export function getTagColor(tag: string) {
  // Map tag to a random color and keep in local storage.
  const tagColorMap = JSON.parse(
    localStorage.getItem("presetTagColorMap") || "{}"
  );
  if (!tagColorMap[tag]) {
    const color = tagColors[Math.floor(Math.random() * tagColors.length)];
    tagColorMap[tag] = color;
    localStorage.setItem("presetTagColorMap", JSON.stringify(tagColorMap));
  }
  return tagColorMap[tag];
}
