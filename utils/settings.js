const DEFAULT_PRIVACY_SETTINGS = {
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

function normalizePrivacySettings(rawSettings = {}) {
  const features = {
    ...DEFAULT_PRIVACY_SETTINGS.features,
    ...(rawSettings.features || {})
  };

  const sliders = {
    ...DEFAULT_PRIVACY_SETTINGS.sliders,
    ...(rawSettings.sliders || {})
  };

  return {
    enabled: rawSettings.enabled !== false,
    features,
    sliders: {
      privacyLevel: clamp(sliders.privacyLevel, 0, 100),
      canvasNoise: clamp(sliders.canvasNoise, 0, 8),
      timerJitter: clamp(sliders.timerJitter, 0, 40)
    }
  };
}

function clamp(value, min, max) {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : min;
  return Math.min(max, Math.max(min, numericValue));
}
