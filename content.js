const defaultSettings = {
  enabled: true,
  features: {
    navigatorMasking: true,
    timezoneMasking: true,
    canvasProtection: true,
    webglProtection: true,
    webrtcProtection: true,
    mediaDeviceProtection: true,
    permissionProtection: true,
    pluginSanitization: true,
    bluetoothDisable: true
  },
  sliders: {
    privacyLevel: 70,
    canvasNoise: 2,
    timerJitter: 12
  }
};

injectPrivacyScript().catch((error) => {
  console.error("Failed to inject privacy script", error);
});

async function injectPrivacyScript() {
  const { privacySettings } = await chrome.storage.local.get({
    privacySettings: defaultSettings
  });

  const settings = mergeSettings(privacySettings);
  if (!settings.enabled) {
    return;
  }

  document.documentElement.dataset.privacyShieldSettings = JSON.stringify(settings);
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  script.dataset.source = "privacy-shield";
  script.onload = () => {
    script.remove();
    delete document.documentElement.dataset.privacyShieldSettings;
  };
  (document.head || document.documentElement).appendChild(script);
}

function mergeSettings(rawSettings = {}) {
  return {
    enabled: rawSettings.enabled !== false,
    features: {
      ...defaultSettings.features,
      ...(rawSettings.features || {})
    },
    sliders: {
      ...defaultSettings.sliders,
      ...(rawSettings.sliders || {})
    }
  };
}
