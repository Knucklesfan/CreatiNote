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
import { HocuspocusProvider } from '@hocuspocus/provider';

import { toggleMark, insertList, withLinks } from "./utils";
import { HoveringToolbar } from "./HoveringToolbar";
// Import the core binding
import { withYjs, slateNodesToInsertDelta, YjsEditor, YjsEditor, withYHistory } from '@slate-yjs/core';

// Import yjs
import * as Y from 'yjs';
const SlateEditor = ({darkMode}) => {
  [window.editor] = useState(() =>
    withLinks(withLayout(withHistory(withReact(createEditor()))))
  );
  const sharedType = useMemo(() => {
    const yDoc = new Y.Doc()
    const sharedType = yDoc.get("content", Y.XmlText)

    // Load the initial value into the yjs document
    sharedType.applyDelta(slateNodesToInsertDelta(initialValue))

    return sharedType
  }, [])

  // Setup the binding
  window.editor = useMemo(() => {
    const sharedType = provider.document.get('content', Y.XmlText);
    const e = withLinks(withLayout(withHistory(withReact(withYjs(createEditor(), sharedType)))));

    // Ensure editor always has at least 1 valid child
    const { normalizeNode } = e;
    e.normalizeNode = (entry) => {
      const [node] = entry;
      if (!Editor.isEditor(node) || node.children.length > 0) {
        return normalizeNode(entry);
      }

      Transforms.insertNodes(
        editor,
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
        { at: [0] }
      );
    };
  }, []);

  const [value, setValue] = useState([])
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
          body: JSON.stringify({ text: btoa(lastContent), id:window.current_noteid}),
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
  const handleTab = (event) => {
    event.preventDefault();
    Transforms.insertText(window.editor, "\t");
  };
  
  return <Slate editor={window.editor} initialValue={initialValue} id="mainEditor"
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
  insertList(window.editor, "ordered-list");
  break;
}
case "l": {
  // Ctrl+L: Insert unordered list
  event.preventDefault();
  insertList(window.editor, "unordered-list");
  break;
}
case "`": {
  // Ctrl+`: Toggle code block
  event.preventDefault();
  const [match] = Editor.nodes(window.editor, {
    match: (n) => n.type === "code",
  });
  Transforms.setNodes(
    window.editor,
    { type: match ? "paragraph" : "code" },
    { match: (n) => Editor.isBlock(window.editor, n) }
  );
  break;
}
case "b": {
  // Ctrl+B: Toggle bold
  event.preventDefault();
  toggleMark(window.editor, "b");
  break;
}
case "i": {
  // Ctrl+I: Toggle italic
  event.preventDefault();
  toggleMark(window.editor, "i");
  break;
}
case "u": {
  // Ctrl+U: Toggle underline
  event.preventDefault();
  toggleMark(window.editor, "u");
  break;
}
case "s": {
  // Ctrl+S: Toggle strikethrough
  event.preventDefault();
  toggleMark(window.editor, "s");
  break;
}
case "1": {
  // Ctrl+1: Toggle subscript
  event.preventDefault();
  toggleMark(window.editor, "sub");
  break;
}
case "2": {
  // Ctrl+2: Toggle superscript
  event.preventDefault();
  toggleMark(window.editor, "sup");
  break;
}
case "z": {
  // Ctrl+Z: Undo
  event.preventDefault();
  window.editor.undo();
  break;
}
case "y": {
  // Ctrl+Y: Redo
  event.preventDefault();
  window.editor.redo();
  break;
}
default: {
  break;
}
}
}}
/>
</Slate>

}
function App() {
  
  // State for managing dark/light theme
  const [darkMode, setDarkMode] = useState(false);

  // Handle tab key press to insert tab character instead of changing focus

  // Toggle between dark and light modes by updating CSS classes
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark-mode");
  };
  window.current_noteid = -1; //not sure if this is the right way to do this,
  //but https://stackoverflow.com/questions/65610331/correctly-create-global-variables-in-react says its okay

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <NavigationPanel darkMode={darkMode} editor={window.editor} />
      <RightPanel darkMode={darkMode} onThemeToggle={toggleDarkMode} />
      {/* Slate editor context provider */}
      <SlateEditor></SlateEditor>
    </div>
  );
}

export default App;
