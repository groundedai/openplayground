export class Editable {
  element: HTMLDivElement;

  constructor(element: HTMLDivElement) {
    this.element = element;
  }

  render() {
    // Make element contenteditable
    this.element.contentEditable = "true";
    this.addListeners();
  }

  addListeners() {
    this.element.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          document.execCommand("insertHTML", false, "<br><br>");
          break;
        case "Tab":
          e.preventDefault();
          document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
          break;
      }
    });
  }

  getValue() {
    return this.element.innerText;
  }

  setValue(value: string) {
    this.element.innerText = value;
  }

  addSuggestion(text: string) {
    this.element.focus();
    const selection = window.getSelection();
    if (selection) {
      const range = selection.getRangeAt(0);
      const suggestion = document.createElement("span");
      suggestion.classList.add("suggestion");
      suggestion.innerText = text;
      range.insertNode(suggestion);
      range.setStartBefore(suggestion);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}
