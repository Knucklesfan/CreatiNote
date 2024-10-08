import "./App.css";
import React, { useCallback, useState, useEffect } from "react";
import {
  createEditor,
  Transforms,
  Editor,
  Element as SlateElement,
} from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";


// Initial content for the editor
const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Type here to test..." }],
  },
];

// Define custom elements for rendering
const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const OrderedListElement = (props) => {
  return <ol {...props.attributes}>{props.children}</ol>;
};

const UnorderedListElement = (props) => {
  return <ul {...props.attributes}>{props.children}</ul>;
};

const ListItemElement = (props) => {
  return <li {...props.attributes}>{props.children}</li>;
};

// Custom component for rendering text with formatting
const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf.b ? "bold" : "normal",
        fontStyle: props.leaf.i ? "italic" : "normal",
        textDecoration: props.leaf.u
          ? "underline"
          : props.leaf.s
          ? "line-through"
          : "none",
        verticalAlign: props.leaf.sub
          ? "sub"
          : props.leaf.sup
          ? "super"
          : "baseline",
      }}
    >
      {props.children}
    </span>
  );
};

// Check if a mark is currently active
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Toggle a mark on or off
function toggleMark(editor, mark) {
  if (isMarkActive(editor, mark)) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
}

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

  // Callback for rendering elements
  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      case "ordered-list":
        return <OrderedListElement {...props} />;
      case "unordered-list":
        return <UnorderedListElement {...props} />;
      case "list-item":
        return <ListItemElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  // Callback for rendering leaves (text with formatting)
  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  // Function to insert a list
  const insertList = (type) => {
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

  // Check if a block type is currently active
  const isBlockActive = (editor, type) => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
    });

    return !!match;
  };

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(value) => {
        // Log changes to the editor content
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type
        );
        if (isAstChange) {
          const content = JSON.stringify(value);
          console.log(value);
        }
      }}
    >
      <Editable
        className="slate-editor"
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }
          switch (event.key) {
            case "o": {
              // Insert ordered list with Ctrl+O
              event.preventDefault();
              insertList("ordered-list");
              break;
            }
            case "l": {
              // Insert unordered list with Ctrl+L
              event.preventDefault();
              insertList("unordered-list");
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
  );
}

export default App;
