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

// Get current font size
export const getFontSize = (editor) => {
  const marks = Editor.marks(editor);
  return marks?.fontSize ? parseInt(marks.fontSize) : 16; // Default font size
};

// Set font size
export const setFontSize = (editor, size) => {
  Editor.addMark(editor, "fontSize", `${size}px`);
};

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

// Check if alignment is active
export const isAlignmentActive = (editor, alignment) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Editor.nodes(editor, {
    at: selection,
    match: (n) => Editor.isBlock(editor, n) && n.align === alignment,
  });

  return !!match;
};

// Set alignment for selected blocks
export const setAlignment = (editor, alignment) => {
  const { selection } = editor;
  if (!selection) return;

  const nodes = Array.from(
    Editor.nodes(editor, {
      at: selection,
      match: (n) => Editor.isBlock(editor, n),
    })
  );

  nodes.forEach(([node, path]) => {
    Transforms.setNodes(editor, { align: alignment }, { at: path });
  });
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
