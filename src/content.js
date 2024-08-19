import * as InboxSDK from '@inboxsdk/core';

const PANZA_API_URL = 'http://localhost:5001/generate';

async function getPanzaSuggestionStreamAndUpdate({input, onUpdate, onComplete}) {
  console.log("fetching panza suggestion");
  const response = await fetch(PANZA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY,
    },
    body: JSON.stringify({text: input}),
  })
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let result;
  let textSoFar = '';

  while (!result?.done) {
      result = await reader.read();
      const chunk = decoder.decode(result.value || new Uint8Array(), { stream: !result.done });
      textSoFar += chunk;
      onUpdate(textSoFar);
  }

  onComplete();
}

function toHtml(text) {
  // Replace \r and \n with <br> tag
  text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
  return `<div>${text}</div>`;
}

const PanzaButton = ({composeView}) => {

  // Button state
  let loadingStartTime;
  let loadingInterval;
  let loadingTime;

  // Event handlers
  const panzaResponseOnUpdate = (out) => composeView.setBodyHTML(toHtml(out));
  const panzaResponseOnComplete = () => {
    clearInterval(loadingInterval);
    panzaButton.dropdown.el.innerHTML = `Loaded in ${loadingTime} seconds`;
  }
  const panzaButtonOnClick = (event) => {
    loadingStartTime = Date.now();
    loadingInterval = setInterval(() => {
      loadingTime = ((Date.now() - loadingStartTime) / 1000).toFixed(2);
      event.dropdown.el.innerHTML = `Loading... ${loadingTime} seconds elapsed`;
    }, 1000);
    const input = composeView.getTextContent();
    getPanzaSuggestionStreamAndUpdate({
      input: input,
      onUpdate: panzaResponseOnUpdate,
      onComplete: panzaResponseOnComplete,
    })
  };

  // Button configuration
  return {
    title: "Panza",
    iconUrl: 'https://i.imgur.com/w6NxSwi.png',
    hasDropdown: true,
    onClick: panzaButtonOnClick,
    dropdown: {
      el: document.createElement('div'),
      persistOnClick: true,
    },
  }
};

InboxSDK.load(2, "sdk_panza_4e702e3f8e").then((sdk) => {
  sdk.Compose.registerComposeViewHandler((composeView) => {
    composeView.addButton(PanzaButton({composeView: composeView}));
  });
});
