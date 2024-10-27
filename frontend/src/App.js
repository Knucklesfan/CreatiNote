// Import necessary dependencies and styles
import "./App.css";
import React, { useState } from "react";
// Import core Slate editor utilities
import { createEditor, Transforms, Editor } from "slate";
// Import Slate React components
import { Slate, Editable, withReact } from "slate-react";
// Import history functionality for undo/redo
import { withHistory } from "slate-history";
// Import custom components and utilities
import {
  renderElement,
  renderLeaf,
  Logo,
  initialValue,
  withLayout,
} from "./Elements";
import { toggleMark, insertList } from "./utils";
import { HoveringToolbar } from "./HoveringToolbar";

function App() {
  // Initialize the Slate editor with React, History, and custom Layout plugins
  const [editor] = useState(() =>
    withLayout(withHistory(withReact(createEditor())))
  );

  // Handle tab key press by inserting a tab character
  const handleTab = (event) => {
    event.preventDefault();
    Transforms.insertText(editor, "\t");
  };

  return (
    <div className="app-container">
      <Logo />
      {/* Slate editor context provider with initial content */}
      <Slate editor={editor} initialValue={initialValue}>
        <HoveringToolbar />
        {/* Main editable area with custom rendering and event handling */}
        <Editable
          className="slate-editor"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Type here..."
          // Custom placeholder rendering with styling
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
          // Handle keyboard shortcuts and special key combinations
          onKeyDown={(event) => {
            // Handle tab key separately
            if (event.key === "Tab") {
              handleTab(event);
              return;
            }

            // Only process ctrl/cmd key combinations
            if (!event.ctrlKey) {
              return;
            }
            switch (event.key) {
              case "o": {
                // Ctrl+O: Insert ordered list
                event.preventDefault();
                insertList(editor, "ordered-list");
                break;
              }
              case "l": {
                // Ctrl+L: Insert unordered list
                event.preventDefault();
                insertList(editor, "unordered-list");
                break;
              }
              case "`": {
                // Ctrl+`: Toggle code block
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
                // Ctrl+B: Toggle bold
                event.preventDefault();
                toggleMark(editor, "b");
                break;
              }
              case "i": {
                // Ctrl+I: Toggle italic
                event.preventDefault();
                toggleMark(editor, "i");
                break;
              }
              case "u": {
                // Ctrl+U: Toggle underline
                event.preventDefault();
                toggleMark(editor, "u");
                break;
              }
              case "s": {
                // Ctrl+S: Toggle strikethrough
                event.preventDefault();
                toggleMark(editor, "s");
                break;
              }
              case "1": {
                // Ctrl+1: Toggle subscript
                event.preventDefault();
                toggleMark(editor, "sub");
                break;
              }
              case "2": {
                // Ctrl+2: Toggle superscript
                event.preventDefault();
                toggleMark(editor, "sup");
                break;
              }
              case "z": {
                // Ctrl+Z: Undo
                event.preventDefault();
                editor.undo();
                break;
              }
              case "y": {
                // Ctrl+Y: Redo
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
