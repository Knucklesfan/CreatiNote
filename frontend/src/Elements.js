import React, { useState } from "react";

// Reusable navigation button component with animated text
const NavButton = ({ text, onClick }) => {
  return (
    <div className="nav-button" onClick={onClick}>
      <span className="animate-character">{text}</span>
    </div>
  );
};

// Animated chevron button component for toggling panels
const ChevronButton = ({ isOpen, onClick }) => {
  return (
    <div className={`chevron-button ${isOpen ? "open" : ""}`} onClick={onClick}>
      <span className="animate-character">›</span>
    </div>
  );
};

// Side panel component for displaying saved notes
const NotesPanel = ({ isOpen }) => {
  return (
    <div className={`notes-panel ${isOpen ? "open" : ""}`}>
      <h3 className="notes-panel-title">Saved Notes</h3>
      <div className="notes-list">
        {/* Placeholder for notes list */}
        <div className="note-item">Example Note 1</div>
        <div className="note-item">Example Note 2</div>
        <div className="note-item">Example Note 3</div>
      </div>
    </div>
  );
};

// Left navigation panel with note management controls
export const NavigationPanel = () => {
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);

  const handleCreateNote = () => {
    console.log("Create Note clicked");
  };

  const toggleNotesPanel = (e) => {
    e.stopPropagation();
    setIsNotesPanelOpen(!isNotesPanelOpen);
  };

  const handleDeleteNote = () => {
    console.log("Delete Note clicked");
  };

  const handleGroups = () => {
    console.log("Groups clicked");
  };

  const handleShare = () => {
    console.log("Share clicked");
  };

  return (
    <>
      <div className="nav-panel">
        <div className="create-note-wrapper">
          <NavButton text="Create Note" onClick={handleCreateNote} />
          <ChevronButton isOpen={isNotesPanelOpen} onClick={toggleNotesPanel} />
        </div>
        <NavButton text="Delete Note" onClick={handleDeleteNote} />
        <NavButton text="Groups" onClick={handleGroups} />
        <NavButton text="Share" onClick={handleShare} />
      </div>
      <NotesPanel isOpen={isNotesPanelOpen} />
    </>
  );
};

// Right panel component with hamburger menu, help button, and theme toggle
export const RightPanel = () => {
  const handleHamburger = () => {
    console.log("Hamburger menu clicked");
  };

  const handleHelp = () => {
    console.log("Help clicked");
  };

  const handleThemeToggle = () => {
    console.log("Theme toggle clicked");
  };

  return (
    <div className="right-panel">
      <div className="nav-button hamburger-button" onClick={handleHamburger}>
        <span className="animate-character">☰</span>
      </div>
      <div className="nav-button help-button" onClick={handleHelp}>
        <span className="animate-character">?</span>
      </div>
      <div className="nav-button theme-toggle" onClick={handleThemeToggle}>
        <span className="animate-character">◐</span>
      </div>
    </div>
  );
};

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
      style={{ textAlign: props.element.align || "left" }}
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
      }}
    >
      {props.children}
    </span>
  );
};

// Element renderer selector based on element type
export const renderElement = (props) => {
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
};

// Leaf renderer for text formatting
export const renderLeaf = (props) => {
  return <Leaf {...props} />;
};
