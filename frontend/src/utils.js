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

// Maximum characters to display in shortened URL
const MAX_DISPLAY_LENGTH = 50;

// Helper function to shorten URL for display
const shortenUrl = (url) => {
  if (url.length <= MAX_DISPLAY_LENGTH) return url;

  try {
    const urlObj = new URL(url);
    let display = urlObj.hostname;

    // Add pathname if it exists and fits
    if (urlObj.pathname !== "/") {
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        const shortPath =
          pathParts.length > 1
            ? `/${pathParts[0]}/.../${pathParts[pathParts.length - 1]}`
            : `/${pathParts[0]}`;

        if ((display + shortPath).length <= MAX_DISPLAY_LENGTH) {
          display += shortPath;
        } else {
          display += "/...";
        }
      }
    }

    // Add query string indicator if it exists
    if (urlObj.search) {
      display += "?...";
    }

    return display;
  } catch (e) {
    // Fallback for invalid URLs
    return url.substring(0, MAX_DISPLAY_LENGTH - 3) + "...";
  }
};

// Helper function to create a link node
const createLinkNode = (url, text) => {
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  const displayText = text || shortenUrl(fullUrl);

  return {
    type: "link",
    url: fullUrl,
    children: [{ text: displayText }],
  };
};

// Helper function to move cursor after a node
const moveCursorAfterNode = (editor) => {
  const { selection } = editor;
  if (selection) {
    const [node] = Editor.node(editor, selection);
    const after = Editor.after(editor, Editor.end(editor, selection));
    if (after) {
      Transforms.select(editor, after);
    }
  }
};

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

    // Move cursor after the link node
    moveCursorAfterNode(editor);

    // Insert a space after the link
    Transforms.insertText(editor, " ");

    lastIndex = match.lastIndex;
  });

  // Insert any remaining text after the last link
  if (lastIndex < text.length) {
    const textAfterLink = text.slice(lastIndex);
    Transforms.insertText(editor, textAfterLink);
  }

  return true;
};

export const withLinks = (editor) => {
  const { insertData, deleteBackward, isInline } = editor;

  editor.isInline = (element) =>
    element.type === "link" ? true : isInline(element);

  editor.insertData = (data) => {
    const text = data.getData("text/plain");

    // Check if text is a single URL
    const singleMatch = linkify.match(text);
    if (
      singleMatch &&
      singleMatch.length === 1 &&
      singleMatch[0].index === 0 &&
      singleMatch[0].lastIndex === text.length
    ) {
      // For single URLs, create the shortened version
      const linkNode = createLinkNode(singleMatch[0].url);
      Transforms.insertNodes(editor, linkNode);

      // Move cursor after the link node
      moveCursorAfterNode(editor);

      // Add a space after
      Transforms.insertText(editor, " ");
      return;
    }

    // Handle text with embedded links
    if (insertLinkIfNeeded(editor, text)) {
      return;
    }

    insertData(data);
  };

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

export const linkUtils = {
  shortenUrl,
  createLinkNode,
  moveCursorAfterNode,
};
