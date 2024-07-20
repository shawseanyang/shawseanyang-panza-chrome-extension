import * as InboxSDK from '@inboxsdk/core';

const PANZA_API_URL = 'http://localhost:5000/generate';

async function get_panza_suggestion(text) {
  return await fetch(PANZA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY,
    },
    body: JSON.stringify({text: text}),
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  })
}

function toHtml(text) {
  // Replace \r and \n with <br> tag
  text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
  return `<div>${text}</div>`;
}

InboxSDK.load(2, "sdk_panza_4e702e3f8e").then((sdk) => {
  sdk.Compose.registerComposeViewHandler((composeView) => {
    let loadingStartTime;
    let loadingInterval;
    let button = composeView.addButton({
      title: "Panza",
      iconUrl: 'https://i.imgur.com/w6NxSwi.png',
      hasDropdown: true,
      onClick(event) {
        loadingStartTime = Date.now();
        loadingInterval = setInterval(() => {
          const loadingTime = ((Date.now() - loadingStartTime) / 1000).toFixed(2);
          event.dropdown.el.innerHTML = `Loading... ${loadingTime} seconds elapsed`;
        }, 1000);
        const text = composeView.getTextContent();
        get_panza_suggestion(text).then((suggestion) => {
          const loadingTime = ((Date.now() - loadingStartTime) / 1000).toFixed(2);
          event.dropdown.el.innerHTML = `Loaded in ${loadingTime} seconds`;
          composeView.setBodyHTML(toHtml(suggestion));
        })
        .catch((error) => {
          event.dropdown.el.innerHTML = `Error: ${error}`;
        })
        .finally(() => {
          clearInterval(loadingInterval);
        })
      },
      dropdown: {
        el: document.createElement('div'),
        persistOnClick: true,
      },
    });
  });
});
