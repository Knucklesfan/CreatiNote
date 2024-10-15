import "./App.css";
import React, { useState, useEffect } from "react";
import { createEditor, Transforms, Editor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { renderElement, renderLeaf } from "./Elements";
import { toggleMark, insertList } from "./utils";

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

function App() {
  // Effect for fetching data when component mounts
  useEffect(() => {
    var apiUrl = "getsheet";
    fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        token: "example",
        document: "testdoc",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      console.log("Component will unmount");
    };
  }, []);

  // Create a Slate editor object that uses the React and History plugins
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
