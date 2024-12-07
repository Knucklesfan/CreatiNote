import React, { useEffect, useState } from "react";
import { b64DecodeUnicode } from "./utils";
export const HelpPanel = ({ isOpen, darkMode }) => {
  const helpSections = [
    {
      title: "Text Formatting",
      items: [
        { name: "Bold", shortcut: "Ctrl + B", description: "Make text bold" },
        {
          name: "Italic",
          shortcut: "Ctrl + I",
          description: "Make text italic",
        },
        {
          name: "Underline",
          shortcut: "Ctrl + U",
          description: "Underline text",
        },
        {
          name: "Strikethrough",
          shortcut: "Ctrl + S",
          description: "Add strikethrough to text",
        },
        {
          name: "Superscript",
          shortcut: "Ctrl + 2",
          description: "Make text superscript",
        },
        {
          name: "Subscript",
          shortcut: "Ctrl + 1",
          description: "Make text subscript",
        },
      ],
    },
    {
      title: "Text Selection",
      items: [
        {
          name: "Basic Selection",
          description:
            "Click and drag to select text using your mouse or trackpad",
        },
        {
          name: "Word Selection",
          description: "Double-click to select an entire word",
        },
        {
          name: "Paragraph Selection",
          description: "Triple-click to select an entire paragraph",
        },
        {
          name: "Keyboard Selection",
          description: "Hold Shift + Arrow Keys to extend text selection",
        },
      ],
    },
    {
      title: "Hovering Toolbar Features",
      items: [
        {
          name: "Text Formatting",
          description:
            "Quickly apply bold, italic, and underline to selected text",
        },
        {
          name: "Font Size",
          description:
            "Increase or decrease font size using +/- buttons or enter a custom size (8-72)",
        },
        {
          name: "Text Color",
          description:
            "Choose custom text colors or select from a preset color palette",
        },
        {
          name: "Font Family",
          description:
            "Switch between various font styles like Arial, Times New Roman, and more",
        },
        {
          name: "Emoji Insertion",
          description:
            "Browse and insert emojis from different categories directly into your text",
        },
        {
          name: "Line Spacing",
          description:
            "Adjust line spacing from 1.0 to 3.0 for better readability",
        },
        {
          name: "Text Alignment",
          description: "Align text left, center, or right with a single click",
        },
      ],
    },
    {
      title: "Lists",
      items: [
        {
          name: "Ordered List",
          shortcut: "Ctrl + O",
          description: "Create a numbered list",
        },
        {
          name: "Unordered List",
          shortcut: "Ctrl + L",
          description: "Create a bullet point list",
        },
      ],
    },
    {
      title: "Document Actions",
      items: [
        { name: "Undo", shortcut: "Ctrl + Z", description: "Undo last action" },
        {
          name: "Redo",
          shortcut: "Ctrl + Y",
          description: "Redo last undone action",
        },
        {
          name: "Tab Key",
          shortcut: "Tab",
          description: "Insert a tab character",
        },
      ],
    },
    {
      title: "Text Styling",
      items: [
        {
          name: "Text Alignment",
          description:
            "Use alignment buttons in the hovering toolbar to change text alignment",
        },
        {
          name: "Font Size",
          description:
            "Adjust font size using the +/- buttons in the hovering toolbar",
        },
        {
          name: "Line Spacing",
          description:
            "Modify line spacing using the line spacing option in the hovering toolbar",
        },
      ],
    },
    {
      title: "Additional Features",
      items: [
        {
          name: "Links",
          description: "Paste or type a URL to create a clickable link",
        },
        {
          name: "Emojis",
          description:
            "Use the emoji picker in the hovering toolbar to insert emojis",
        },
        {
          name: "Code Block",
          shortcut: "Ctrl + `",
          description: "Toggle code block formatting",
        },
        {
          name: "Placeholder Text",
          description: "Appears when no text is entered",
        },
      ],
    },
  ];

  return (
    <div
      className={`help-panel ${isOpen ? "open" : ""} ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      <h3 className="help-panel-title">How to use CreatiNote</h3>
      {helpSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="help-section">
          <h4 className="help-section-title">{section.title}</h4>
          {section.items.map((item, itemIndex) => (
            <div key={itemIndex} className="help-item">
              <div className="help-item-name">{item.name}</div>
              {item.shortcut && (
                <div className="help-item-shortcut">
                  Shortcut: {item.shortcut}
                </div>
              )}
              {item.description && (
                <div className="help-item-description">{item.description}</div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const NavButton = ({ text, onClick, darkMode }) => {
  return (
    <div
      className={`nav-button ${darkMode ? "dark-mode" : ""}`}
      onClick={onClick}
    >
      <span className="animate-character">{text}</span>
    </div>
  );
};

const ChevronButton = ({ isOpen, onClick, darkMode }) => {
  return (
    <div
      className={`chevron-button ${isOpen ? "open" : ""} ${
        darkMode ? "dark-mode" : ""
      }`}
      onClick={onClick}
    >
      <span className="animate-character">›</span>
    </div>
  );
};

const Note = ({
  id,
  formalname,
  timecreated,
  lastmodified,
  updatelist,
  editor,
}) => {
  const [title, setTitle] = useState(formalname);

  const renameNote = async () => {
    const newname = prompt("Please choose a new name for your note.");
    if (!newname) return;

    try {
      const response = await fetch("/renamesheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notename: newname,
          id: id,
        }),
      });
      const json = await response.json();
      if (json.success) {
        setTitle(newname);
      }
    } catch (error) {
      console.error("Error renaming note:", error);
    }
  };

  const deleteNote = async () => {
    try {
      const response = await fetch("/deletesheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      const json = await response.json();
      if (json.success) {
        // window.location.reload();
        updatelist();
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };
  const loadNote = async () => {
    console.log("loading text");
    // try {
    const response = await fetch("/servesheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    });
    const result = await response.json();
    console.log(result);
    if (result.success == true) {
      window.current_noteid = id;
      console.log("current note id: " + window.current_noteid);
      let conversion = b64DecodeUnicode(result.noteText);
      console.log(conversion);
      let parsed = JSON.parse(conversion);
      console.log(parsed);
      editor.children = parsed;
      editor.onChange();
    }
    // } catch (error) {
    //   console.error("Error creating note:", error);
    // }
  };

  return (
    <div
      className={`note-item ${darkMode ? "dark-mode" : ""}`}
      onClick={loadNote}
      style={{
        padding: "12px",
        backgroundColor: darkMode ? "#374151" : "white",
        color: darkMode ? "#f3f4f6" : "#333",
        borderRadius: "6px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        border: darkMode ? "1px solid #4b5563" : "none",
        cursor: "pointer",
        transition: "all 0.3s ease",
        marginBottom: "16px",
      }}
    >
      <h2
        style={{
          marginBottom: "8px",
          fontSize: "1.2rem",
          color: darkMode ? "#f3f4f6" : "#333",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          marginBottom: "16px",
          color: darkMode ? "#d1d5db" : "#555",
          fontSize: "0.9rem",
        }}
      >
        Created on {new Date(timecreated).toDateString()}, last updated{" "}
        {new Date(lastmodified).toDateString()}.
      </p>
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-start",
        }}
      >
        <div
          className={`nav-button hamburger-button note-button ${
            darkMode ? "dark-mode" : ""
          }`}
          onClick={renameNote}
          style={{
            backgroundColor: darkMode ? "#4b5563" : "#e2e8f0",
            color: darkMode ? "#f3f4f6" : "#333",
            padding: "7px 11px",
            borderRadius: "20px",
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: darkMode ? "1px solid #6b7280" : "1px solid transparent",
          }}
        >
          Rename
        </div>
        <div
          className={`nav-button hamburger-button note-button ${
            darkMode ? "dark-mode" : ""
          }`}
          onClick={deleteNote}
          style={{
            backgroundColor: darkMode ? "#ff4d4d" : "#ff4d4d",
            color: darkMode ? "#f3f4f6" : "white",
            padding: "7px 11px",
            borderRadius: "20px",
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: darkMode ? "1px solid #6b7280" : "1px solid transparent",
          }}
        >
          Delete
        </div>
      </div>
    </div>
  );
};

const NotesList = ({ darkMode, editor }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const handleCreateNote = async () => {
    try {
      const response = await fetch("/createsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: "Untitled Note",
        }),
      });
      const result = await response.json();

      console.log(result);
      if (result.success == true) {
        console.log("success!");
        window.current_noteid = result.id;
        // Refresh the notes list
        editor.children = initialValue;
        editor.onChange();
        getList();
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const getList = async () => {
    setLoading(true);
    try {
      const response = await fetch("/getsheets", {
        method: "POST",
      });
      const json = await response.json();
      setNotes(json || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getList();
  }, []);
  return (
    <div className="notes-list-wrapper">
      <div className="notes-panel-buttons">
        {/* Place Create Note button first */}
        <NavButton
          text="Create Note"
          onClick={handleCreateNote}
          darkMode={darkMode}
        />
      </div>
      <h3 className="notes-panel-title">Saved Notes</h3>
      <div className="notes-list" id="noteslist">
        {loading ? (
          <h4>Loading...</h4>
        ) : (
          notes.map((extractednote) => (
            <Note
              key={extractednote.id}
              id={extractednote.id}
              formalname={extractednote.formalname}
              lastmodified={extractednote.lastmodified}
              timecreated={extractednote.timecreated}
              updatelist={getList}
              editor={editor}
            />
          ))
        )}
      </div>
    </div>
  );
};

const NotesPanel = ({ isOpen, darkMode, editor }) => {
  // const handleGroups = () => {
  //   console.log("Groups clicked");
  // };

  // const handleShare = () => {
  //   console.log("Share clicked");
  // };

  return (
    <div
      className={`notes-panel ${isOpen ? "open" : ""} ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      <div className="notes-panel-buttons">
        {/* <NavButton text="Groups" onClick={handleGroups} darkMode={darkMode} />
        <NavButton text="Share" onClick={handleShare} darkMode={darkMode} /> */}
      </div>

      <NotesList darkMode={darkMode} editor={editor} />
    </div>
  );
};

export const NavigationPanel = ({ darkMode, editor }) => {
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);

  const toggleNotesPanel = (e) => {
    e.stopPropagation();
    setIsNotesPanelOpen(!isNotesPanelOpen);
  };

  return (
    <>
      <div className="nav-panel">
        <div className="create-note-wrapper">
          <ChevronButton
            isOpen={isNotesPanelOpen}
            onClick={toggleNotesPanel}
            darkMode={darkMode}
          />
        </div>
      </div>
      <NotesPanel
        isOpen={isNotesPanelOpen}
        darkMode={darkMode}
        editor={editor}
      ></NotesPanel>
    </>
  );
};

export const RightPanel = ({ darkMode, onThemeToggle }) => {
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);

  const handleHamburger = () => {
    console.log("Hamburger menu clicked");
  };

  const handleHelp = () => {
    setIsHelpPanelOpen(!isHelpPanelOpen);
  };

  return (
    <>
      <div className="right-panel">
        {/*<div
          className={`nav-button hamburger-button ${
            darkMode ? "dark-mode" : ""
          }`}
          onClick={handleHamburger}
        >
          <span className="animate-character">☰</span>
        </div> */}
        <div
          className={`nav-button help-button ${darkMode ? "dark-mode" : ""}`}
          onClick={handleHelp}
        >
          <span className="animate-character">?</span>
        </div>
        <div
          className={`nav-button theme-toggle ${darkMode ? "dark-mode" : ""}`}
          onClick={onThemeToggle}
        >
          <span className="animate-character">{darkMode ? "☀️" : "🌙"}</span>
        </div>
      </div>
      <HelpPanel isOpen={isHelpPanelOpen} darkMode={darkMode} />
    </>
  );
};

export default RightPanel;

// Initial value for the Slate editor
export const initialValue = [
  {
    type: "paragraph",
    align: "left",
    children: [{ text: "" }],
  },
];

// Custom plugin to handle text alignment in the editor
export const withLayout = (editor) => {
  const { apply } = editor;

  editor.apply = (operation) => {
    // Ensure new paragraphs have a default left alignment
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

// Default paragraph element renderer
export const DefaultElement = (props) => {
  return (
    <p
      {...props.attributes}
      style={{
        textAlign: props.element.align || "left",
        lineHeight: props.element.lineHeight || 1.0,
      }}
    >
      {props.children}
    </p>
  );
};

// Code block element renderer
export const CodeElement = (props) => {
  return (
    <pre
      {...props.attributes}
      style={{ textAlign: props.element.align || "left" }}
    >
      <code>{props.children}</code>
    </pre>
  );
};

// Ordered list element renderer
export const OrderedListElement = (props) => {
  return (
    <ol
      {...props.attributes}
      style={{ textAlign: props.element.align || "left" }}
    >
      {props.children}
    </ol>
  );
};

// Unordered list element renderer
export const UnorderedListElement = (props) => {
  return (
    <ul
      {...props.attributes}
      style={{ textAlign: props.element.align || "left" }}
    >
      {props.children}
    </ul>
  );
};

// List item element renderer
export const ListItemElement = (props) => {
  return (
    <li
      {...props.attributes}
      style={{ textAlign: props.element.align || "left" }}
    >
      {props.children}
    </li>
  );
};

// Text formatting renderer for bold, italic, underline, strike, subscript, and superscript
export const Leaf = (props) => {
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
        fontSize: props.leaf.fontSize || "inherit",
        fontFamily: props.leaf.fontFamily || "inherit",
        color: props.leaf.color || "inherit",
      }}
    >
      {props.children}
    </span>
  );
};

export const LinkElement = ({ attributes, children, element }) => {
  const { url } = element;

  // Ensure that clicking the link works by preventing Slate's default event handling
  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleMouseOver = (event) => {
    // Show full URL in tooltip
    event.target.title = url;
  };

  return (
    <a
      {...attributes}
      href={url}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      className="slate-link"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

// Element renderer selector based on element type
export const renderElement = (props) => {
  switch (props.element.type) {
    case "link":
      return <LinkElement {...props} />;
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
};

// Leaf renderer for text formatting
export const renderLeaf = (props) => {
  return <Leaf {...props} />;
};
