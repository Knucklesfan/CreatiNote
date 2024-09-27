import './App.css';
// Import React dependencies.
import React, { useCallback, useState, useEffect } from "react";
// Import the Slate editor factory.
import { createEditor } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'
import { Editor, Transforms, Element } from 'slate'
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'hello world! this is a \'test\' of how to use this' }],
  },
]
// Define a default element to be our text
const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}
// Define a React component renderer for our code blocks.
const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}
const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf.b ? 'bold' : 'normal',
        fontStyle: props.leaf.i?'italic':'normal',
        textDecoration: props.leaf.u?'underline':'normal'
      }}
    >
      {props.children}
    </span>
  )
}
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

function toggleMark(editor,mark) {
  if(isMarkActive(editor,mark)) {
    Editor.removeMark(editor, mark)
  }
  else {
    Editor.addMark(editor, mark, true)
  }
}
function App() {
  useEffect(() => {  
    var apiUrl = 'getsheet';
    fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        token: "example",
        document: "testdoc",
      })
    }).then(response => {
      return response.json();
    }).then(data => {
      // Work with JSON data here
      console.log(data);
    }).catch(err => {
    });
 
    // If you want to perform cleanup on unmount, return a function 
    return () => { 
      console.log('Component will unmount'); 
    }; 
  }, []); // The empty dependency array ensures this runs only on mount 
  const [editor] = useState(() => withReact(createEditor()))
  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])
  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])
  return <Slate
   editor={editor} 
   initialValue={initialValue} 
   onChange={value => {

    const isAstChange = editor.operations.some(
      op => 'set_selection' !== op.type
    )
    if (isAstChange) {
      // Save the value to Local Storage.
      const content = JSON.stringify(value)
      console.log(value);

    }
  }}        
   >
          <Editable 
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              onKeyDown={event => {
                if (!event.ctrlKey) {
                  return
                }
                switch (event.key) {
                  // When "`" is pressed, keep our existing code block logic.
                  case '`': {
                    event.preventDefault()
                    const [match] = Editor.nodes(editor, {
                      match: n => n.type === 'code',
                    })
                    Transforms.setNodes(
                      editor,
                      { type: match ? 'paragraph' : 'code' },
                      { match: n => Editor.isBlock(editor, n) }
                    )
                    break
                  }
      
                  // When "B" is pressed, bold the text in the selection.
                  case 'b': {
                    toggleMark(editor,"b");
                    event.preventDefault()
                    break
                  }
                  case 'i': {
                    event.preventDefault()
                    toggleMark(editor,"i");
                    break
                  }
                  case 'u': {
                    event.preventDefault()
                    toggleMark(editor,"u");
                    break;
                  }
                  
                  default :{
                    break;//to stop vscode from complaining, we gotta have a default case
                  }
                }
              }}
          />

          </Slate>
}

export default App;
