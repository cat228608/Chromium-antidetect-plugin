chrome.storage.local.get('spoofingEnabled', ({ spoofingEnabled }) => {
  if (spoofingEnabled !== false) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  }
});
