(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  /**
   * Given a URL to a beast image, remove all existing beasts, then
   * create and style an IMG node pointing to
   * that image, then insert the node into the document.
   */
  function insertMeme(memeURL) {
    removeexistingMemes();
    let memeImage = document.createElement("img");
    memeImage.setAttribute("src", memeURL);
    memeImage.style.height = "100vh";
    memeImage.className = "memify-image";
    document.body.appendChild(memeImage);
  }

  /**
   * Remove every meme from the page.
   */
  function removeexistingMemes() {
    let existingMemes = document.querySelectorAll(".memify-image");
    for (let meme of existingMemes) {
      meme.remove();
    }
  }

  /**
   * Listen for messages from the background script.
   * Call "memify()" or "reset()".
  */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "memify") {
      insertMeme(message.memeURL);
    } else if (message.command === "reset") {
      removeexistingMemes();
    }
  });

})();