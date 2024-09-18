import './App.css';
// Import React dependencies.
import React, { useCallback, useState } from "react";
// Import the Slate editor factory.
import { createEditor } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'
import { Editor, Transforms, Element } from 'slate'
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
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
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal'}}
    >
      {props.children}
    </span>
  )
}

function App() {
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
  return <Slate editor={editor} initialValue={initialValue} >
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
                    event.preventDefault()
                    Editor.addMark(editor, 'bold', true)
                    break
                  }
                  case 'i': {
                    event.preventDefault()
                    Editor.addMark(editor, 'ital', true)
                    break



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
