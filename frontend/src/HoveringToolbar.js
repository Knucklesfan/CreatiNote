import React, { useState, useEffect, useCallback } from "react";
import { Editor, Range, Transforms } from "slate";
import { useSlate, ReactEditor } from "slate-react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronUp,
  ChevronDown,
  Palette,
  TypeIcon,
  Smile,
} from "lucide-react";
import {
  toggleMark,
  isAlignmentActive,
  getFontSize,
  setFontSize,
} from "./utils";
import "./Toolbar.css";

// Font family options - Grouped and expanded list of popular fonts
const fontFamilies = [
  // System Default
  { name: "Default", value: "inherit" },

  // Sans-serif fonts
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Helvetica", value: "Helvetica Neue, Helvetica, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Tahoma", value: "Tahoma, sans-serif" },
  { name: "Segoe UI", value: "Segoe UI, sans-serif" },
  { name: "Calibri", value: "Calibri, sans-serif" },

  // Serif fonts
  { name: "Times New Roman", value: "Times New Roman, Times, serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Garamond", value: "Garamond, serif" },
  { name: "Baskerville", value: "Baskerville, serif" },

  // Monospace fonts
  { name: "Courier New", value: "Courier New, monospace" },
  { name: "Consolas", value: "Consolas, monospace" },
  { name: "Monaco", value: "Monaco, monospace" },

  // Display fonts
  { name: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
  { name: "Impact", value: "Impact, sans-serif" },
  { name: "Arial Black", value: "Arial Black, sans-serif" },
];

// Common emojis grouped by category
const commonEmojis = {
  "Smileys & People": [
    "😊",
    "😂",
    "🥰",
    "😎",
    "🤔",
    "😴",
    "😭",
    "🤗",
    "🤓",
    "😉",
    "👍",
    "👋",
    "🤝",
    "👏",
    "🙌",
  ],
  "Animals & Nature": [
    "🐶",
    "🐱",
    "🦁",
    "🐼",
    "🐨",
    "🦊",
    "🦋",
    "🌺",
    "🌸",
    "🌲",
    "⭐",
    "🌙",
    "☀️",
    "🌈",
    "❄️",
  ],
  "Food & Drink": [
    "🍕",
    "🍔",
    "🍟",
    "🌮",
    "🍜",
    "🍱",
    "🍎",
    "🍓",
    "🍇",
    "☕",
    "🍺",
    "🍷",
    "🥤",
    "🧃",
    "🍪",
  ],
  Activities: [
    "⚽",
    "🏀",
    "🎮",
    "🎨",
    "🎭",
    "🎪",
    "🎯",
    "🎲",
    "🎸",
    "🎹",
    "✈️",
    "🚗",
    "🚲",
    "⛺",
    "🎉",
  ],
  Symbols: [
    "❤️",
    "💜",
    "💙",
    "✅",
    "☑️",
    "✔️",
    "❌",
    "⭕",
    "❗",
    "❓",
    "⚠️",
    "💯",
    "✨",
    "💫",
    "📌",
  ],
};

// Extended color palette
const commonColors = [
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#808080", // Gray
  "#FFA500", // Orange
  "#800080", // Purple
  "#A52A2A", // Brown
  "#FFC0CB", // Pink
  "#006400", // Dark Green
  "#000080", // Navy
  "#008080", // Teal
  "#808000", // Olive
  "#FFD700", // Gold
  "#C0C0C0", // Silver
  "#FF4500", // Orange Red
];

// Component for the floating toolbar that appears when text is selected
export const HoveringToolbar = ({ darkMode }) => {
  const editor = useSlate();
  // State for toolbar position and visibility
  const [toolbarStyle, setToolbarStyle] = useState({
    opacity: 0,
    top: -10000,
    left: -10000,
  });
  // State for font size management
  const [fontSize, setFontSizeState] = useState(16);
  const [inputValue, setInputValue] = useState("16");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState("Smileys & People");

  const updateToolbar = useCallback(() => {
    const { selection } = editor;

    // Hide toolbar if there's no valid selection
    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      setToolbarStyle({ opacity: 0, top: -10000, left: -10000 });
      return;
    }

    // Position toolbar above the selected text
    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    // Update font size display to match current selection
    const currentFontSize = getFontSize(editor);
    setFontSizeState(currentFontSize);
    setInputValue(currentFontSize.toString());

    // Position toolbar above the selection
    setToolbarStyle({
      opacity: 1,
      top: `${rect.top + window.scrollY - 35}px`,
      left: `${rect.left + window.scrollX}px`,
    });
  }, [editor]);

  // Update toolbar position when selection changes
  useEffect(() => {
    const { selection } = editor;
    if (selection) {
      updateToolbar();
    }
  }, [editor.selection, updateToolbar]);

  // Check if a formatting mark is currently active
  const isMarkActive = (format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const getCurrentColor = () => {
    const marks = Editor.marks(editor);
    return marks?.color || "#000000";
  };

  const getCurrentFontFamily = () => {
    const marks = Editor.marks(editor);
    return marks?.fontFamily || "inherit";
  };

  const toggleFormat = (e, format) => {
    e.preventDefault();
    toggleMark(editor, format);
  };

  // Handle text alignment changes
  const handleAlignment = (e, alignment) => {
    e.preventDefault();
    const { selection } = editor;
    if (!selection) return;

    // Apply alignment to all blocks in selection
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

  // Handle font size increment/decrement
  const handleFontSize = (e, increase) => {
    e.preventDefault();
    const currentSize = getFontSize(editor);
    const newSize = increase ? currentSize + 2 : currentSize - 2;
    // Ensure font size stays within valid range (8-72)
    if (newSize >= 8 && newSize <= 72) {
      setFontSize(editor, newSize);
      setFontSizeState(newSize);
      setInputValue(newSize.toString());
    }
  };

  // Handle direct font size input
  const handleFontSizeInput = (e) => {
    const value = e.target.value;
    setInputValue(value);

    const newSize = parseInt(value) || 16;
    if (newSize >= 8 && newSize <= 72) {
      setFontSize(editor, newSize);
      setFontSizeState(newSize);
    }
  };

  // Validate and apply font size when input loses focus
  const handleFontSizeBlur = () => {
    const validSize = Math.min(Math.max(parseInt(inputValue) || 16, 8), 72);
    setInputValue(validSize.toString());
    setFontSize(editor, validSize);
    setFontSizeState(validSize);
  };

  const handleColorChange = (e) => {
    e.preventDefault();
    const color = e.target.value;
    Editor.addMark(editor, "color", color);
  };

  const handleCommonColorClick = (e, color) => {
    e.preventDefault();
    Editor.addMark(editor, "color", color);
  };

  const handleFontFamilyChange = (e, fontFamily) => {
    e.preventDefault();
    Editor.addMark(editor, "fontFamily", fontFamily);
    setShowFontFamily(false);
  };

  const handleEmojiSelect = (e, emoji) => {
    e.preventDefault();
    // Insert the emoji at the current selection
    Transforms.insertText(editor, emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div
      className={`hovering-toolbar ${darkMode ? "dark-mode" : ""}`}
      style={toolbarStyle}
      onMouseDown={(e) => {
        // Prevent toolbar from taking focus except for input elements
        if (!(e.target instanceof HTMLInputElement)) {
          e.preventDefault();
        }
      }}
    >
      {/* Text formatting buttons */}
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

      {/* Font size controls */}
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

      {/* Color picker */}
      <div className="color-picker-container">
        <button
          className="color-picker-toggle"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowColorPicker(!showColorPicker);
          }}
          title="Text Color"
        >
          <Palette size={16} style={{ color: getCurrentColor() }} />
        </button>
        {showColorPicker && (
          <div
            className="color-picker-popup"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              type="color"
              value={getCurrentColor()}
              onChange={handleColorChange}
              className="color-input"
            />
            <div className="common-colors">
              {commonColors.map((color) => (
                <button
                  key={color}
                  className="color-preset"
                  style={{ backgroundColor: color }}
                  onMouseDown={(e) => handleCommonColorClick(e, color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="toolbar-separator" />

      {/* Font Family Dropdown */}
      <div className="font-family-container">
        <button
          className="font-family-toggle"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowFontFamily(!showFontFamily);
          }}
          title="Font Family"
        >
          <TypeIcon size={16} />
        </button>
        {showFontFamily && (
          <div
            className="font-family-popup"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {fontFamilies.map((font) => (
              <button
                key={font.value}
                className="font-family-option"
                style={{ fontFamily: font.value }}
                onMouseDown={(e) => handleFontFamilyChange(e, font.value)}
              >
                {font.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="toolbar-separator" />

      {/* Emoji Picker */}
      <div className="emoji-picker-container">
        <button
          className="emoji-picker-toggle"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowEmojiPicker(!showEmojiPicker);
          }}
          title="Insert Emoji"
        >
          <Smile size={16} />
        </button>
        {showEmojiPicker && (
          <div
            className="emoji-picker-popup"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="emoji-categories">
              {Object.keys(commonEmojis).map((category) => (
                <button
                  key={category}
                  className={`emoji-category-button ${
                    selectedEmojiCategory === category ? "active" : ""
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelectedEmojiCategory(category);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="emoji-grid">
              {commonEmojis[selectedEmojiCategory].map((emoji) => (
                <button
                  key={emoji}
                  className="emoji-button"
                  onMouseDown={(e) => handleEmojiSelect(e, emoji)}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="toolbar-separator" />

      {/* Text alignment buttons */}
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
