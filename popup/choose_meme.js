/**
 * CSS to hide everything on the page,
 * except for elements that have the "memify-image" class.
 */
const hidePage = `body > :not(.memify-image) {
                    display: none;
                  }`;

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {

    /**
     * Given the name of a meme, get the URL to the corresponding image.
     */
    function memeNameToURL(memeName) {
      switch (memeName) {
        case "Meme1":
          return browser.extension.getURL("memes/meme1.jpg");
        case "Meme2":
          return browser.extension.getURL("memes/meme2.jpg");
        case "Meme3":
          return browser.extension.getURL("memes/meme3.jpg");
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the meme URL and
     * send a "memify" message to the content script in the active tab.
     */
    function memify(tabs) {
      browser.tabs.insertCSS({code: hidePage}).then(() => {
        let url = memeNameToURL(e.target.textContent);
        browser.tabs.sendMessage(tabs[0].id, {
          command: "memify",
          memeURL: url
        });
      });
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      browser.tabs.removeCSS({code: hidePage}).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "reset",
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not memify: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "memify()" or "reset()" as appropriate.
     */
    if (e.target.classList.contains("meme")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(memify)
        .catch(reportError);
    }
    else if (e.target.classList.contains("reset")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(reset)
        .catch(reportError);
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute memify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({file: "/content_scripts/memify.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);