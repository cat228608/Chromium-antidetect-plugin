document.addEventListener('DOMContentLoaded', async () => {
  const button = document.getElementById('toggle');

  const { spoofingEnabled } = await chrome.storage.local.get({ spoofingEnabled: true });
  updateButton(spoofingEnabled);

  button.addEventListener('click', async () => {
    const { spoofingEnabled } = await chrome.storage.local.get({ spoofingEnabled: true });
    await chrome.storage.local.set({ spoofingEnabled: !spoofingEnabled });
    updateButton(!spoofingEnabled);
  });

  function updateButton(enabled) {
    button.textContent = enabled ? "Антидетект: ВКЛ" : "Антидетект: ВЫКЛ";
    button.style.backgroundColor = enabled ? "#4CAF50" : "#f44336";
  }
});
