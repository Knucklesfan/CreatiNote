import React from "react";

// Define custom elements for rendering with alignment support
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

// Custom component for rendering text with formatting
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
      }}
    >
      {props.children}
    </span>
  );
};

// Callback for rendering elements
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

// Callback for rendering leaves (text with formatting)
export const renderLeaf = (props) => {
  return <Leaf {...props} />;
};
