import { Editor, Transforms, Element as SlateElement } from "slate";
import linkifyIt from "linkify-it";

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
  return marks?.fontSize ? parseInt(marks.fontSize) : 16;
};

// Set font size
export const setFontSize = (editor, size) => {
  Editor.addMark(editor, "fontSize", `${size}px`);
};

// Get current line spacing
export const getLineSpacing = (editor) => {
  const { selection } = editor;
  if (!selection) return 1.0;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n),
  });

  if (!match) return 1.0;
  const [node] = match;
  return node.lineHeight || 1.0;
};

// Set line spacing for selected blocks
export const setLineSpacing = (editor, spacing) => {
  const { selection } = editor;
  if (!selection) return;

  const blockEntries = Array.from(
    Editor.nodes(editor, {
      at: selection,
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n),
    })
  );

  blockEntries.forEach(([_, path]) => {
    Transforms.setNodes(editor, { lineHeight: spacing }, { at: path });
  });
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

const linkify = linkifyIt();
// Helper function to create a link node
const createLinkNode = (url, text) => ({
  type: "link",
  url: url.startsWith("http") ? url : `https://${url}`,
  children: [{ text: text || url }],
});

// Function to handle pasted text with links
const insertLinkIfNeeded = (editor, text) => {
  const matches = linkify.match(text);

  if (!matches) {
    return false;
  }

  let lastIndex = 0;
  matches.forEach((match) => {
    // Insert any text before the link
    if (match.index > lastIndex) {
      const textBeforeLink = text.slice(lastIndex, match.index);
      Transforms.insertText(editor, textBeforeLink);
    }

    // Create and insert the link node
    const linkNode = createLinkNode(match.url, match.text);
    Transforms.insertNodes(editor, linkNode);

    // Move cursor after the link
    Transforms.move(editor, { unit: "offset" });

    lastIndex = match.lastIndex;
  });

  // Insert any remaining text after the last link
  if (lastIndex < text.length) {
    const textAfterLink = text.slice(lastIndex);
    Transforms.insertText(editor, textAfterLink);
  }

  return true;
};

// Main Slate plugin for link handling
export const withLinks = (editor) => {
  const { insertData, deleteBackward, isInline } = editor;

  // Define links as inline elements
  editor.isInline = (element) =>
    element.type === "link" ? true : isInline(element);

  // Handle pasting links
  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    if (insertLinkIfNeeded(editor, text)) {
      return;
    }
    insertData(data);
  };

  // Handle deletion of empty links
  editor.deleteBackward = (...args) => {
    const [linkNode] = Editor.nodes(editor, {
      match: (n) => n.type === "link",
    });

    if (linkNode) {
      const [node, path] = linkNode;
      if (node.children[0].text === "") {
        Transforms.unwrapNodes(editor, { at: path });
      }
    }

    deleteBackward(...args);
  };

  return editor;
};
