function render(text) {
  //welcome to the crackhead zone
  //this is a VERY small proof of concept of our renderer, the real deal will be more than just this ofc
  //renders to the log, but only at the specified index in the text, and only how much was told to be rendered, and removes any user typed code as well
  //or at least, thats what its gonna do when its done, for now it just renders the whole document
  // const split = text.split("\n");
  let textCache = "";
  let componentCache = "";
  let element = null;
  // console.log(text.length + " " + split.length)
  //these two functions inside another function is just a thing we can do cuz this is JS and who gives a damn!
  function singleStyleByte(styleByte, index, blockname) {
    //for the folks at home confused, here's a quick breakdown of this lil equation: styleByte>>6&1
    //tldr; styleByte is our byte described above, and we shift it right 6 times,
    //such that the 7th bit is the last bit in the byte,
    //and then AND it by 1 to make sure it's equal to 1 to determine if that bit is enabled or disabled.
    //We could just hardcode the AND values here, but in favor of ease of reading, i won't do that lol
    //its basic chemistry

    // } else if (mode == 5) {
    //   mode = 0; // Exit italic mode
    //   element.innerText = componentCache; // Set italic text content
    //   textCache += element.outerHTML; // Add the <i> tag and content to the textCache
    //   componentCache = ""; // Clear component cache for future use
    // }

    if (!((styleByte >> index) & 1)) {
      //if the next character is a ~, and bit 4 of the styleByte is NOT set to 1
      componentCache += "<" + blockname + ">";
      styleByte = styleByte ^ (1 << index);
    } else {
      if ((styleByte >> index) & 1) {
        componentCache += "</" + blockname + ">";
        styleByte = styleByte ^ (1 << index);
      }
      if (styleByte == 0) {
        styleByte = 0;
        textCache += componentCache;
        componentCache = "";
      }
    }
    return styleByte;
  }

  function doubleStyleByte(text, a, styleByte, char, indexes, blocknames) {
    if (text.charAt(a + 1) == char && !((styleByte >> indexes[1]) & 1)) {
      //if the next character is a star, and bit 6 of the styleByte is NOT set to 1
      componentCache += "<" + blocknames[1] + ">";
      styleByte = styleByte ^ (1 << indexes[1]);
      a++; //add, so that we avoid parsing the next *
    } else if (!((styleByte >> indexes[0]) & 1) && text.charAt(a + 1) != char) {
      componentCache += "<" + blocknames[0] + ">";
      styleByte = styleByte ^ (1 << indexes[0]);
    } else {
      if ((styleByte >> indexes[0]) & 1 && text.charAt(a + 1) != char) {
        componentCache += "</" + blocknames[0] + ">";
        styleByte = styleByte ^ (1 << indexes[0]);
      } else if (text.charAt(a + 1) == char && (styleByte >> indexes[1]) & 1) {
        componentCache += "</" + blocknames[1] + ">";
        styleByte = styleByte ^ (1 << indexes[1]);
        a++; //add, so that we avoid parsing the next *
      }
      if (styleByte == 0) {
        styleByte = 0;
        textCache += componentCache;
        componentCache = "";
      }
    }
    return [styleByte, a];
  }
  // for (let i = 0; i < split.length; i++) {
  //this runs for every line of the innertext
  //implement this code based on https://www.markdownguide.org/cheat-sheet/
  //here is the basic idea that I had:
  //textcache works as the cache for text, wherein all text that is written to be added to the document is written there
  //component cache is used while working on making an element: say for example you're writing a <a>, then during the step where the url is being written,
  //the <a>'s url is stored in componentcache, before being finished and actually being added to the element which is made and stored in element
  // console.log(text.length)
  let skip = false; //if true, we skip this char during parsing, and treat it as a normal char
  let mode = 0; //this is the character mode setter, and depending on the setting, we parse in a few different ways:
  // 0 - Run normally, append characters if need be, but other than that we chillin
  // 1 - We are in text mod mode, open a span and wait for a span to end here because this is just basic text editing stuff
  // 2 - We are in URL mode and in particular are setting the URL's name during creation
  // 3 - We are in URL mode and in particular are setting the URL's URL during creation
  // 4 - We are in widget mode and awaiting a second $ to generate the widget
  // 5 - We are in Style mode, but otherwise are writing normal text
  // 6 - unusued
  // 7 - unusued
  // 8 - unusued
  // 9 - unusued
  // 10 - We are in Image mode and in particular are setting the Image's alt-text during creation
  // 11 - We are in Image mode and in particular are setting the Image's URL during creation
  // 12 - unusued
  // 13 - unusued
  // 14 - We are in checkbox mode and awaiting closure

  let styleByte = 0; //style is handled effectively as a very small bitwise int, and we just handle that as is
  //00000000
  //IBMSMWHU
  //I - Italic 7
  //B - Bold 6
  //M - Code 5
  //S - Strikethrough 4
  //M - Subscript 3
  //W - Superscript 2
  //H - Highlight 1
  //U - Underline 0
  for (let a = 0; a < text.length; a++) {
    console.log("Mode: " + mode);
    //this runs for every char of a list and basically, we're gonna iterate on this
    if (!skip) {
      switch (
        text.charAt(a) //switch over the chars, we doin basic char detection time boys
      ) {
        case "\\":
          {
            console.log("skipping next char");
            //if we backslash, then skip the next character in parsing
            skip = true;
          }
          break;
        case "@":
          {
            if (text.charAt(a + 1) == "{") {
              mode = 1;
            } else {
              if (mode == 0) {
                textCache += "@";
              } else {
                componentCache += "@";
              }
            }
          }
          break;
        case "[":
          {
            if (mode == 0) {
              // console.log(text.charAt(a+1))
              if (text.charAt(a + 1) == "!" || text.charAt(a + 1) == " ") {
                // console.log("checkbox")
                mode = 14;
                element = document.createElement("input");
                element.setAttribute("type", "checkbox");
                element.setAttribute("name", "checkbox");

                if (text.charAt(a + 1) == "!") {
                  element.setAttribute("checked", "true");
                }
              } else {
                // console.log("link")
                mode = 2;
                element = document.createElement("a");
              }
            }
          }
          break;
        case "!":
          {
            if (mode == 0) {
              // console.log(text.charAt(a+1))
              if (text.charAt(a + 1) == "[") {
                // we makin an image here
                mode = 10;
                element = document.createElement("image");
                a++;
              }
            }
          }
          break;

        case "]":
          {
            switch (mode) {
              case 14:
                {
                  mode = 0;
                  textCache += element.outerHTML;
                  componentCache = "";
                }
                break;
              case 2:
                {
                  mode = 3;
                  // console.log(componentCache)
                  element.innerText = componentCache;
                  componentCache = "";
                  a++;
                }
                break;
              case 10: {
                mode = 11;
                element.setAttribute("alt", componentCache);
                componentCache = "";
                a++;
              }
            }
          }
          break;
        case ")":
          {
            //since there is no case where the letter "(" is parsed, we can basically just skip it and treat it as a normal char
            switch (mode) {
              case 3:
                {
                  mode = 0;
                  element.setAttribute("href", componentCache);
                  textCache += element.outerHTML;
                  componentCache = "";
                  // console.log(componentCache)
                }
                break;
              case 11: {
                mode = 0;
                element.setAttribute("src", componentCache);
                textCache += element.outerHTML;
                componentCache = "";
              }
            }
          }
          break;
        case "*":
          const byteData = doubleStyleByte(
            text,
            a,
            styleByte,
            "*",
            [7, 6],
            ["i", "strong"]
          ); //store this to a variable so that we can extract the two things we need
          styleByte = byteData[0]; //extract em
          a = byteData[1];
          break;
        case "~":
          {
            const byteData = doubleStyleByte(
              text,
              a,
              styleByte,
              "~",
              [3, 4],
              ["sup", "s"]
            );
            styleByte = byteData[0]; //extract em
            a = byteData[1];
          }
          break;
        case "`":
          {
            styleByte = singleStyleByte(styleByte, 5, "code");
          }
          break;
        case "=":
          {
            const byteData = doubleStyleByte(
              text,
              a,
              styleByte,
              "=",
              [8, 1],
              ["span", 'span class="highlight"']
            );
            styleByte = byteData[0]; //extract em
            a = byteData[1];
          }
          break;
        case "^":
          {
            styleByte = singleStyleByte(styleByte, 2, "sub");
          }
          break;
        case "_":
          {
            const byteData = doubleStyleByte(
              text,
              a,
              styleByte,
              "_",
              [9, 0],
              ["span", "u"]
            );
            styleByte = byteData[0]; //extract em
            a = byteData[1];
          }
          break;
        case "\n": {
          textCache += "<br>";
        }
        default:
          {
            if (mode <= 0 && styleByte == 0) {
              textCache += text.charAt(a);
            } else {
              componentCache += text.charAt(a);
            }
          }
          break;
      }
      // log.innerHTML += text.charAt(a);
    } else {
      if (mode == 0 && styleByte == 0) {
        textCache += text.charAt(a);
      } else {
        console.log("componenting " + text.charAt(a));
        componentCache += text.charAt(a);
      }
      skip = false;
    }
  }
  // }
  return textCache;
}

/*

// Renders text with custom markup into HTML.
// @param {string} text - The input text with custom markup to be rendered.
// @returns {string} The rendered HTML string.
function render(text) {
  // Output variables
  let renderedText = ""; // Stores the final rendered HTML
  let currentComponent = ""; // Temporarily stores the current component being built
  let currentElement = null; // Stores the current DOM element being created

  // Parsing control variables
  let skipNextChar = false; // Flag to skip parsing the next character (used for escape characters)
  let parsingMode = 0; // Current parsing mode (determines how characters are interpreted)
  let styleFlags = 0; // Bitwise flags for current text styles

  // Parsing mode constants
  const PARSE_NORMAL = 0; // Normal text parsing
  const PARSE_TEXT_MOD = 1; // Parsing text modification (unused in current implementation)
  const PARSE_URL_NAME = 2; // Parsing URL name for links
  const PARSE_URL_LINK = 3; // Parsing URL for links
  const PARSE_WIDGET = 4; // Parsing widget (unused in current implementation)
  const PARSE_STYLE = 5; // Parsing style (unused in current implementation)
  const PARSE_IMAGE_ALT = 10; // Parsing image alt text
  const PARSE_IMAGE_URL = 11; // Parsing image URL
  const PARSE_CHECKBOX = 14; // Parsing checkbox

  // Style flag bit positions
  const STYLE_ITALIC = 7;
  const STYLE_BOLD = 6;
  const STYLE_CODE = 5;
  const STYLE_STRIKETHROUGH = 4;
  const STYLE_SUBSCRIPT = 3;
  const STYLE_SUPERSCRIPT = 2;
  const STYLE_HIGHLIGHT = 1;
  const STYLE_UNDERLINE = 0;

  // Toggles a single-character style (like italic or bold) and updates the HTML accordingly.
  // @param {number} styleBit - The bit position of the style flag to toggle.
  // @param {string} tagName - The HTML tag name for this style.
  // @returns {number} The updated styleFlags.
  function toggleSingleStyle(styleBit, tagName) {
    if (!(styleFlags & (1 << styleBit))) {
      // Style is not active, so we're opening a new tag
      currentComponent += "<" + tagName + ">";
      styleFlags = styleFlags ^ (1 << styleBit);
    } else {
      // Style is active, so we're closing the tag
      currentComponent += "</" + tagName + ">";
      styleFlags = styleFlags ^ (1 << styleBit);
      if (styleFlags === 0) {
        // If all styles are closed, add the component to rendered text
        renderedText += currentComponent;
        currentComponent = "";
      }
    }
    return styleFlags;
  }

  // Toggles a double-character style (like ** for bold) and updates the HTML accordingly.
  // @param {string} nextChar - The next character in the input string.
  // @param {string} char - The character that triggers this style.
  // @param {number[]} styleBits - Array with two style bit positions: [single-char style, double-char style].
  // @param {string[]} tagNames - Array with two tag names: [single-char tag, double-char tag].
  // @returns {[number, boolean]} Array with updated styleFlags and a boolean indicating whether to skip the next character.
  function toggleDoubleStyle(nextChar, char, styleBits, tagNames) {
    let singleBit = styleBits[0];
    let doubleBit = styleBits[1];
    let singleTag = tagNames[0];
    let doubleTag = tagNames[1];
    let skipNext = false;

    if (nextChar === char && !(styleFlags & (1 << doubleBit))) {
      // Opening a double-character style
      currentComponent += "<" + doubleTag + ">";
      styleFlags = styleFlags ^ (1 << doubleBit);
      skipNext = true;
    } else if (!(styleFlags & (1 << singleBit)) && nextChar !== char) {
      // Opening a single-character style
      currentComponent += "<" + singleTag + ">";
      styleFlags = styleFlags ^ (1 << singleBit);
    } else {
      // Closing styles
      if (styleFlags & (1 << singleBit) && nextChar !== char) {
        currentComponent += "</" + singleTag + ">";
        styleFlags = styleFlags ^ (1 << singleBit);
      } else if (nextChar === char && styleFlags & (1 << doubleBit)) {
        currentComponent += "</" + doubleTag + ">";
        styleFlags = styleFlags ^ (1 << doubleBit);
        skipNext = true;
      }
      if (styleFlags === 0) {
        renderedText += currentComponent;
        currentComponent = "";
      }
    }
    return [styleFlags, skipNext];
  }

  // Main parsing loop
  for (let i = 0; i < text.length; i++) {
    let currentChar = text[i];
    let nextChar = text[i + 1];

    if (!skipNextChar) {
      switch (currentChar) {
        case "\\":
          // Escape character: skip parsing the next character
          skipNextChar = true;
          break;

        case "@":
          // Handle @ symbol (potential text modification, currently only partially implemented)
          if (nextChar === "{") {
            parsingMode = PARSE_TEXT_MOD;
          } else {
            if (parsingMode === PARSE_NORMAL) {
              renderedText += "@";
            } else {
              currentComponent += "@";
            }
          }
          break;

        case "[":
          // Opening bracket: start of URL or checkbox
          if (parsingMode === PARSE_NORMAL) {
            if (nextChar === "!" || nextChar === " ") {
              // Checkbox
              parsingMode = PARSE_CHECKBOX;
              currentElement = document.createElement("input");
              currentElement.setAttribute("type", "checkbox");
              currentElement.setAttribute("name", "checkbox");
              if (nextChar === "!") {
                currentElement.setAttribute("checked", "true");
              }
            } else {
              // URL
              parsingMode = PARSE_URL_NAME;
              currentElement = document.createElement("a");
            }
          }
          break;

        case "!":
          // Exclamation mark: potential start of image tag
          if (parsingMode === PARSE_NORMAL && nextChar === "[") {
            parsingMode = PARSE_IMAGE_ALT;
            currentElement = document.createElement("image");
            i++;
          }
          break;

        case "]":
          // Closing bracket: end of URL name, image alt, or checkbox
          switch (parsingMode) {
            case PARSE_CHECKBOX:
              parsingMode = PARSE_NORMAL;
              renderedText += currentElement.outerHTML;
              currentComponent = "";
              break;
            case PARSE_URL_NAME:
              parsingMode = PARSE_URL_LINK;
              currentElement.innerText = currentComponent;
              currentComponent = "";
              i++;
              break;
            case PARSE_IMAGE_ALT:
              parsingMode = PARSE_IMAGE_URL;
              currentElement.setAttribute("alt", currentComponent);
              currentComponent = "";
              i++;
              break;
          }
          break;

        case ")":
          // Closing parenthesis: end of URL or image URL
          if (parsingMode === PARSE_URL_LINK) {
            parsingMode = PARSE_NORMAL;
            currentElement.setAttribute("href", currentComponent);
            renderedText += currentElement.outerHTML;
            currentComponent = "";
          } else if (parsingMode === PARSE_IMAGE_URL) {
            parsingMode = PARSE_NORMAL;
            currentElement.setAttribute("src", currentComponent);
            renderedText += currentElement.outerHTML;
            currentComponent = "";
          }
          break;

        case "*":
          // Asterisk: toggle italic or bold
          var result = toggleDoubleStyle(
            nextChar,
            "*",
            [STYLE_ITALIC, STYLE_BOLD],
            ["i", "strong"]
          );
          styleFlags = result[0];
          if (result[1]) i++;
          break;

        case "~":
          // Tilde: toggle superscript or strikethrough
          var result = toggleDoubleStyle(
            nextChar,
            "~",
            [STYLE_SUPERSCRIPT, STYLE_STRIKETHROUGH],
            ["sup", "s"]
          );
          styleFlags = result[0];
          if (result[1]) i++;
          break;

        case "`":
          // Backtick: toggle code
          styleFlags = toggleSingleStyle(STYLE_CODE, "code");
          break;

        case "=":
          // Equal sign: toggle highlight
          var result = toggleDoubleStyle(
            nextChar,
            "=",
            [8, STYLE_HIGHLIGHT],
            ["span", 'span class="highlight"']
          );
          styleFlags = result[0];
          if (result[1]) i++;
          break;

        case "^":
          // Caret: toggle subscript
          styleFlags = toggleSingleStyle(STYLE_SUBSCRIPT, "sub");
          break;

        case "_":
          // Underscore: toggle underline
          var result = toggleDoubleStyle(
            nextChar,
            "_",
            [9, STYLE_UNDERLINE],
            ["span", "u"]
          );
          styleFlags = result[0];
          if (result[1]) i++;
          break;

        case "\n":
          // Newline: add <br> tag
          renderedText += "<br>";
          break;

        default:
          // Regular character: add to rendered text or current component
          if (parsingMode === PARSE_NORMAL && styleFlags === 0) {
            renderedText += currentChar;
          } else {
            currentComponent += currentChar;
          }
          break;
      }
    } else {
      // Skipped character (due to escape): add it as-is
      if (parsingMode === PARSE_NORMAL && styleFlags === 0) {
        renderedText += currentChar;
      } else {
        currentComponent += currentChar;
      }
      skipNextChar = false;
    }
  }

  return renderedText;
}

*/
