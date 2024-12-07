// Main application component for the rich text editor
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
import { toggleMark, insertList, withLinks, b64EncodeUnicode} from "./utils";
import { HoveringToolbar } from "./HoveringToolbar";

function App() {
  let lastContent = ""
  let sendbuffer = 0;
  let saveTimeout;
  // Initialize the Slate editor with React bindings, history tracking, and custom layout
  const handleSave = async () => {
    console.log("saving to note " + window.current_noteid)
    console.log(lastContent)
    if(lastContent == "") {
      console.log("nothing new")
    }
    else {
      try {
        const response = await fetch("/savesheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: b64EncodeUnicode(lastContent), id:window.current_noteid}),
        });
        const json = await response.json();
        if (json.success) {
          console.log("saved")
          // window.location.reload();
          //update save icon to indicate saving
        }
      } catch (error) {
        alert("Saving failed. Please try again.")
      }
    };
  
    
  }
  const [editor] = useState(() =>
    withLinks(withLayout(withHistory(withReact(createEditor()))))
  );
  // State for managing dark/light theme
  const [darkMode, setDarkMode] = useState(false);

  // Handle tab key press to insert tab character instead of changing focus
  const handleTab = (event) => {
    event.preventDefault();
    Transforms.insertText(editor, "\t");
  };

  // Toggle between dark and light modes by updating CSS classes
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark-mode");
  };
  window.current_noteid = -1; //not sure if this is the right way to do this,
  //but https://stackoverflow.com/questions/65610331/correctly-create-global-variables-in-react says its okay

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <NavigationPanel darkMode={darkMode} editor={editor} />
      <RightPanel darkMode={darkMode} onThemeToggle={toggleDarkMode} />
      {/* Slate editor context provider */}
      <Slate editor={editor} initialValue={initialValue} id="mainEditor"
                onChange={value => {
                  if(Date.now()-sendbuffer > 1000) {
                    // Save the value to Local Storage.
                    //send data again
                    lastContent = JSON.stringify(value)

                    handleSave()
                    clearTimeout(saveTimeout)
                    sendbuffer = Date.now()
                    
                  }
                  else {
                    clearTimeout(saveTimeout)
                    saveTimeout = setTimeout(handleSave, 1000)
                  }
                  lastContent = JSON.stringify(value)
                }}      
      >
        
        <HoveringToolbar darkMode={darkMode} />
        {/* Main editable area with custom rendering and keyboard shortcuts */}
        <Editable
          className={`slate-editor ${darkMode ? "dark-mode" : ""}`}
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
          // Handle keyboard shortcuts for various formatting options
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
