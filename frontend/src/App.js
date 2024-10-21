import "./App.css";
import React, { useState, useEffect, useCallback } from "react";
import { createEditor, Transforms, Editor, Range} from "slate";
import { Slate, Editable, withReact, useSlate, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import { renderElement, renderLeaf } from "./Elements";
import { toggleMark, insertList } from "./utils";
import "./Toolbar.css";

// Logo component
const Logo = () => {
  return (
    <div className="logo">
      <span className="animate-character">CreatiNote</span>
    </div>
  );
};

// Initial content for the editor
const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Type here..." }],
  },
];

// Floating toolbar component
const HoveringToolbar = () => {
  const editor = useSlate();
  const [toolbarStyle, setToolbarStyle] = useState({
    opacity: 0,
    top: -10000,
    left: -10000,
  });

  const updateToolbar = useCallback(() => {
    const { selection } = editor;

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      setToolbarStyle({ opacity: 0, top: -10000, left: -10000 });
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    setToolbarStyle({
      opacity: 1,
      top: `${rect.top + window.scrollY - 35}px`, // gap above the text and the button
      left: `${rect.left + window.scrollX}px`,
    });
  }, [editor]);

  useEffect(() => {
    const { selection } = editor;
    if (selection) {
      updateToolbar();
    }
  }, [editor.selection, updateToolbar]);

  const isMarkActive = (format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const toggleFormat = (e, format) => {
    e.preventDefault();
    toggleMark(editor, format);
  };

  return (
    <div className="hovering-toolbar" style={toolbarStyle}>
      <button
        onMouseDown={(e) => toggleFormat(e, "b")}
        className={isMarkActive("b") ? "active" : ""}
      >
        B
      </button>
      <button
        onMouseDown={(e) => toggleFormat(e, "i")}
        className={isMarkActive("i") ? "active" : ""}
      >
        I
      </button>
      <button
        onMouseDown={(e) => toggleFormat(e, "u")}
        className={isMarkActive("u") ? "active" : ""}
      >
        U
      </button>
    </div>
  );
};

function App() {
  const [editor] = useState(() => withHistory(withReact(createEditor())));

  // Handle tab key
  const handleTab = (event) => {
    event.preventDefault();
    // Insert a tab character
    Transforms.insertText(editor, "\t");
  };

  return (
    <div className="app-container">
      <Logo />
      <Slate editor={editor} initialValue={initialValue}>
        <HoveringToolbar />
        <Editable
          className="slate-editor"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              handleTab(event);
              return;
            }

            if (!event.ctrlKey) {
              return;
            }
            switch (event.key) {
              case "o": {
                // Insert ordered list with Ctrl+O
                event.preventDefault();
                insertList(editor, "ordered-list");
                break;
              }
              case "l": {
                // Insert unordered list with Ctrl+L
                event.preventDefault();
                insertList(editor, "unordered-list");
                break;
              }
              case "`": {
                // Toggle code block
                event.preventDefault();
                const [match] = Editor.nodes(editor, {
                  match: (n) => n.type === "code",
                });
                Transforms.setNodes(
                  editor,
                  { type: match ? "paragraph" : "code" },
                  { match: (n) => Editor.isBlock(editor, n) }
                );
                break;
              }
              case "b": {
                // Toggle bold
                event.preventDefault();
                toggleMark(editor, "b");
                break;
              }
              case "i": {
                // Toggle italic
                event.preventDefault();
                toggleMark(editor, "i");
                break;
              }
              case "u": {
                // Toggle underline
                event.preventDefault();
                toggleMark(editor, "u");
                break;
              }
              case "s": {
                // Toggle strikethrough
                event.preventDefault();
                toggleMark(editor, "s");
                break;
              }
              case "1": {
                // Toggle subscript
                event.preventDefault();
                toggleMark(editor, "sub");
                break;
              }
              case "2": {
                // Toggle superscript
                event.preventDefault();
                toggleMark(editor, "sup");
                break;
              }
              case "z": {
                // Undo with Ctrl+Z
                event.preventDefault();
                editor.undo();
                break;
              }
              case "y": {
                // Redo with Ctrl+Y
                event.preventDefault();
                editor.redo();
                break;
              }
              default: {
                break;
              }
            }
          }}
        />
      </Slate>
    </div>
  );
}

export default App;
