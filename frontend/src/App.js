import "./App.css";
import React, { useState, useEffect, useCallback } from "react";
import { createEditor, Transforms, Editor, Range } from "slate";
import { Slate, Editable, withReact, useSlate, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import { renderElement, renderLeaf } from "./Elements";
import { toggleMark, insertList, isAlignmentActive } from "./utils";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
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
    align: "left",
    children: [{ text: "" }],
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
      top: `${rect.top + window.scrollY - 35}px`,
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

  const handleAlignment = (e, alignment) => {
    e.preventDefault();
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

  return (
    <div
      className="hovering-toolbar"
      style={toolbarStyle}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      <button
        onMouseDown={(e) => toggleFormat(e, "b")}
        className={isMarkActive("b") ? "active" : ""}
        title="Bold"
      >
        B
      </button>
      <button
        onMouseDown={(e) => toggleFormat(e, "i")}
        className={isMarkActive("i") ? "active" : ""}
        title="Italic"
      >
        I
      </button>
      <button
        onMouseDown={(e) => toggleFormat(e, "u")}
        className={isMarkActive("u") ? "active" : ""}
        title="Underline"
      >
        U
      </button>

      <div className="toolbar-separator" />

      <button
        onMouseDown={(e) => handleAlignment(e, "left")}
        className={isAlignmentActive(editor, "left") ? "active" : ""}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onMouseDown={(e) => handleAlignment(e, "center")}
        className={isAlignmentActive(editor, "center") ? "active" : ""}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onMouseDown={(e) => handleAlignment(e, "right")}
        className={isAlignmentActive(editor, "right") ? "active" : ""}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>
    </div>
  );
};

const withLayout = (editor) => {
  const { apply } = editor;

  editor.apply = (operation) => {
    if (
      operation.type === "insert_node" &&
      operation.node.type === "paragraph" &&
      !operation.node.align
    ) {
      operation.node.align = "left";
    }
    apply(operation);
  };

  return editor;
};

function App() {
  const [editor] = useState(() =>
    withLayout(withHistory(withReact(createEditor())))
  );

  const handleTab = (event) => {
    event.preventDefault();
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
          placeholder="Type here..."
          renderPlaceholder={({ children, attributes }) => (
            <div
              style={{
                position: "absolute",
                pointerEvents: "none",
                width: "100%",
                maxWidth: "100%",
                display: "block",
                opacity: 0.333,
                userSelect: "none",
                textDecoration: "none",
              }}
              contentEditable={false}
            >
              {children}
            </div>
          )}
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
                event.preventDefault();
                insertList(editor, "ordered-list");
                break;
              }
              case "l": {
                event.preventDefault();
                insertList(editor, "unordered-list");
                break;
              }
              case "`": {
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
                event.preventDefault();
                toggleMark(editor, "b");
                break;
              }
              case "i": {
                event.preventDefault();
                toggleMark(editor, "i");
                break;
              }
              case "u": {
                event.preventDefault();
                toggleMark(editor, "u");
                break;
              }
              case "s": {
                event.preventDefault();
                toggleMark(editor, "s");
                break;
              }
              case "1": {
                event.preventDefault();
                toggleMark(editor, "sub");
                break;
              }
              case "2": {
                event.preventDefault();
                toggleMark(editor, "sup");
                break;
              }
              case "z": {
                event.preventDefault();
                editor.undo();
                break;
              }
              case "y": {
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
