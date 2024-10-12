import { Editor, Transforms, Element as SlateElement } from "slate";

// Check if a mark is currently active
export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Toggle a mark on or off
export function toggleMark(editor, mark) {
  if (isMarkActive(editor, mark)) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
}

// Check if a block type is currently active
export const isBlockActive = (editor, type) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
  });

  return !!match;
};

// Function to insert a list
export const insertList = (editor, type) => {
  const isActive = isBlockActive(editor, type);
  const isList = type === "ordered-list" || type === "unordered-list";

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ["ordered-list", "unordered-list"].includes(n.type),
    split: true,
  });

  const newProperties = {
    type: isActive ? "paragraph" : isList ? "list-item" : type,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: type, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
