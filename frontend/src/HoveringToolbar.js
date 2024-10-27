import React, { useState, useEffect, useCallback } from "react";
import { Editor, Range, Transforms } from "slate";
import { useSlate, ReactEditor } from "slate-react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  toggleMark,
  isAlignmentActive,
  getFontSize,
  setFontSize,
} from "./utils";
import "./Toolbar.css";

export const HoveringToolbar = () => {
  const editor = useSlate();
  const [toolbarStyle, setToolbarStyle] = useState({
    opacity: 0,
    top: -10000,
    left: -10000,
  });
  const [fontSize, setFontSizeState] = useState(16);
  const [inputValue, setInputValue] = useState("16");

  const updateToolbar = useCallback(() => {
    const { selection } = editor;

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      setToolbarStyle({ opacity: 0, top: -10000, left: -10000 });
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    const currentFontSize = getFontSize(editor);
    setFontSizeState(currentFontSize);
    setInputValue(currentFontSize.toString());

    setToolbarStyle({
      opacity: 1,
      top: `${rect.top + window.scrollY - 35}px`,
      left: `${rect.left + window.scrollX}px`,
    });
  }, [editor]);

  useEffect(() => {
    const { selection } = editor;
    if (selection) {
      updateToolbar();
    }
  }, [editor.selection, updateToolbar]);

  const isMarkActive = (format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const toggleFormat = (e, format) => {
    e.preventDefault();
    toggleMark(editor, format);
  };

  const handleAlignment = (e, alignment) => {
    e.preventDefault();
    const { selection } = editor;
    if (!selection) return;

    const nodes = Array.from(
      Editor.nodes(editor, {
        at: selection,
        match: (n) => Editor.isBlock(editor, n),
      })
    );

    nodes.forEach(([node, path]) => {
      Transforms.setNodes(editor, { align: alignment }, { at: path });
    });
  };

  const handleFontSize = (e, increase) => {
    e.preventDefault();
    const currentSize = getFontSize(editor);
    const newSize = increase ? currentSize + 2 : currentSize - 2;
    if (newSize >= 8 && newSize <= 72) {
      setFontSize(editor, newSize);
      setFontSizeState(newSize);
      setInputValue(newSize.toString());
    }
  };

  const handleFontSizeInput = (e) => {
    const value = e.target.value;
    setInputValue(value);

    const newSize = parseInt(value) || 16;
    if (newSize >= 8 && newSize <= 72) {
      setFontSize(editor, newSize);
      setFontSizeState(newSize);
    }
  };

  const handleFontSizeBlur = () => {
    // Ensure the input shows a valid number when focus is lost
    const validSize = Math.min(Math.max(parseInt(inputValue) || 16, 8), 72);
    setInputValue(validSize.toString());
    setFontSize(editor, validSize);
    setFontSizeState(validSize);
  };

  return (
    <div
      className="hovering-toolbar"
      style={toolbarStyle}
      onMouseDown={(e) => {
        if (!(e.target instanceof HTMLInputElement)) {
          e.preventDefault();
        }
      }}
    >
      <button
        onMouseDown={(e) => toggleFormat(e, "b")}
        className={isMarkActive("b") ? "active" : ""}
        title="Bold"
      >
        B
      </button>
      <button
        onMouseDown={(e) => toggleFormat(e, "i")}
        className={isMarkActive("i") ? "active" : ""}
        title="Italic"
      >
        I
      </button>
      <button
        onMouseDown={(e) => toggleFormat(e, "u")}
        className={isMarkActive("u") ? "active" : ""}
        title="Underline"
      >
        U
      </button>

      <div className="toolbar-separator" />

      <button
        onMouseDown={(e) => handleFontSize(e, false)}
        title="Decrease Font Size"
      >
        <ChevronDown size={16} />
      </button>
      <input
        type="number"
        value={inputValue}
        onChange={handleFontSizeInput}
        onBlur={handleFontSizeBlur}
        onMouseDown={(e) => e.stopPropagation()}
        min="8"
        max="72"
        className="font-size-input"
        title="Font Size"
      />
      <button
        onMouseDown={(e) => handleFontSize(e, true)}
        title="Increase Font Size"
      >
        <ChevronUp size={16} />
      </button>

      <div className="toolbar-separator" />

      <button
        onMouseDown={(e) => handleAlignment(e, "left")}
        className={isAlignmentActive(editor, "left") ? "active" : ""}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onMouseDown={(e) => handleAlignment(e, "center")}
        className={isAlignmentActive(editor, "center") ? "active" : ""}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onMouseDown={(e) => handleAlignment(e, "right")}
        className={isAlignmentActive(editor, "right") ? "active" : ""}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>
    </div>
  );
};