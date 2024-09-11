window.onload = function () {
  var cacheTable = [];
  var conn;

  let chunks = [
    `
        Hello **world**!
        *this is a test, so see if **mixed stuff** works, if at all...*
        How about ***bold and italic*** together?
        **this is a *sentence* that tests a few things**
        \*\*\*this shouldnt be bold\*\*\*
        **what if we give it **dumb stupid code** that shouldnt work?**\*
        If you want to draw a textbox, you can do it **like this**
        [!] Checked! \[!\]
        [ ] Unchecked \[ \]
      `,
    `
        But hey, what if you want a link?
        [DOWNLOAD MORE RAM \(FREE\)\!\!\!](https://example.com)
        href
        Woooooooah dude, howd you do that????
        Oh, it's actually pretty easy:
        \[DOWNLOAD MORE RAM \\(FREE\\\)\\!\\!\\!\]\(https://example.com\)
        ![The MacOS 10.5 Default wallpaper](10-5.png)
        x^2^ or x~2~ i dont ~~understand either way~~ but hey, __thats **OKAY**__
      `,
    `
        And hey, maybe the chunk system works, maybe it doesnt! Who caaaares?
        ...Actually, I care because *this* is how the project __works__
      `,
  ];
  let msg = document.getElementById("rawsource");
  let log = document.getElementById("log");

  function checkCached(address) {
    for (let i = 0; i < cacheTable.length; i += 2) {
      if (cacheTable[i] === address) {
        return true;
      }
    }
    return false;
  }

  function getCaretIndex(element) {
    let position = 0;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported) {
      const selection = window.getSelection();
      if (selection.rangeCount !== 0) {
        const range = window.getSelection().getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        position = preCaretRange.toString().length;
      }
    }
    return position;
  }

  function textboxUpdated(e) {
    selection = getCaretIndex(log);
    if (e.type == "keydown") {
      e.preventDefault();
      console.log(e.charCode);
    }
    console.log(e);
    render();
  }

  let renderText = "";
  for (let i = 0; i < chunks.length; i++) {
    renderText += '<div id="chunk' + i + '">' + render(chunks[i]) + "</div>";
  }
  log.innerHTML = renderText;

  log.addEventListener("input", (e) => {
    caret = getCaretIndex(log);
    chunk = 0;
    const activeTextarea = document.activeElement;
    for (let i = 0; i < chunks.length; i++) {
      console.log(caret - chunks[i].length);
      if (caret - chunks[i].length < 0) {
        break;
      }
      chunk++;
      caret -= chunks[i].length;
    }
    console.log(chunk);
    console.log("EDITED");
  });
};
