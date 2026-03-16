document.addEventListener("DOMContentLoaded", async () => {
  const formElements = {
    enabled: document.getElementById("enabled"),
    privacyLevel: document.getElementById("privacyLevel"),
    canvasNoise: document.getElementById("canvasNoise"),
    timerJitter: document.getElementById("timerJitter")
  };

  const outputs = {
    privacyLevel: document.getElementById("privacyLevelValue"),
    canvasNoise: document.getElementById("canvasNoiseValue"),
    timerJitter: document.getElementById("timerJitterValue")
  };

  const featureInputs = Array.from(document.querySelectorAll("[data-feature]"));

  const { privacySettings } = await chrome.storage.local.get({
    privacySettings: DEFAULT_PRIVACY_SETTINGS
  });
  const settings = normalizePrivacySettings(privacySettings);

  hydrateForm(settings);
  bindEvents();

  function hydrateForm(currentSettings) {
    formElements.enabled.checked = currentSettings.enabled;
    formElements.privacyLevel.value = currentSettings.sliders.privacyLevel;
    formElements.canvasNoise.value = currentSettings.sliders.canvasNoise;
    formElements.timerJitter.value = currentSettings.sliders.timerJitter;

    featureInputs.forEach((input) => {
      input.checked = Boolean(currentSettings.features[input.dataset.feature]);
    });

    syncOutputs();
    syncDisabledState();
  }

  function bindEvents() {
    Object.values(formElements).forEach((element) => {
      element.addEventListener("input", handleChange);
      element.addEventListener("change", handleChange);
    });

    featureInputs.forEach((input) => {
      input.addEventListener("change", handleChange);
    });
  }

  async function handleChange() {
    syncOutputs();
    syncDisabledState();

    const nextSettings = normalizePrivacySettings({
      enabled: formElements.enabled.checked,
      sliders: {
        privacyLevel: Number(formElements.privacyLevel.value),
        canvasNoise: Number(formElements.canvasNoise.value),
        timerJitter: Number(formElements.timerJitter.value)
      },
      features: featureInputs.reduce((accumulator, input) => {
        accumulator[input.dataset.feature] = input.checked;
        return accumulator;
      }, {})
    });

    await chrome.storage.local.set({ privacySettings: nextSettings });
  }

  function syncOutputs() {
    outputs.privacyLevel.textContent = formElements.privacyLevel.value;
    outputs.canvasNoise.textContent = formElements.canvasNoise.value;
    outputs.timerJitter.textContent = `${formElements.timerJitter.value} ms`;
  }

  function syncDisabledState() {
    const disabled = !formElements.enabled.checked;
    featureInputs.forEach((input) => {
      input.disabled = disabled;
    });

    [formElements.privacyLevel, formElements.canvasNoise, formElements.timerJitter].forEach(
      (element) => {
        element.disabled = disabled;
      }
    );
  }
});
