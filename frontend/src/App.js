// Main application component that implements a rich text editor using Slate.js
import "./App.css";
import React, { useState } from "react";
import { createEditor, Transforms, Editor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  renderElement,
  renderLeaf,
  NavigationPanel,
  RightPanel,
  initialValue,
  withLayout,
} from "./Elements";
import { toggleMark, insertList } from "./utils";
import { HoveringToolbar } from "./HoveringToolbar";

function App() {
  // Initialize the Slate editor with React and History plugins, plus custom layout handling
  const [editor] = useState(() =>
    withLayout(withHistory(withReact(createEditor())))
  );

  // Handle tab key press by inserting a tab character instead of losing focus
  const handleTab = (event) => {
    event.preventDefault();
    Transforms.insertText(editor, "\t");
  };

  return (
    <div className="app-container">
      <NavigationPanel />
      <RightPanel />
      {/* Slate editor configuration with custom rendering and keyboard shortcuts */}
      <Slate editor={editor} initialValue={initialValue}>
        <HoveringToolbar />
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
          // Keyboard shortcut handler for text formatting and editor controls
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              handleTab(event);
              return;
            }

            // Only process keyboard shortcuts with Ctrl key pressed
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
