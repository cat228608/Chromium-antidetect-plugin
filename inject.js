(() => {
  const settings = normalizeInjectedSettings();
  const profile = pickProfile(settings.sliders.privacyLevel);
  const timerOffset = buildStableOffset(`${profile.id}:timer`, settings.sliders.timerJitter);
  const canvasShift = buildCanvasShift(
    `${profile.id}:canvas`,
    settings.sliders.canvasNoise
  );

  if (settings.features.navigatorMasking) {
    patchNavigator(profile, settings.sliders.privacyLevel);
    patchHardwareHints(settings.sliders.privacyLevel);
  }

  if (settings.features.timezoneMasking) {
    patchTimezone(profile.timezone);
  }

  if (settings.features.webglProtection) {
    patchWebGL(profile.gpu, settings.sliders.privacyLevel);
  }

  if (settings.features.canvasProtection) {
    patchCanvas(canvasShift);
  }

  if (settings.features.mediaDeviceProtection) {
    patchMediaDevices();
  }

  if (settings.features.bluetoothDisable) {
    disableBluetooth();
  }

  if (settings.features.permissionProtection) {
    patchPermissions();
  }

  if (settings.features.pluginSanitization) {
    sanitizePlugins();
  }

  if (settings.features.webrtcProtection) {
    patchWebRTC();
  }

  if (settings.sliders.timerJitter > 0) {
    patchTimers(timerOffset);
  }

  function pickProfile(privacyLevel) {
    const stableProfiles = [
      {
        id: "win-chrome-en",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        appVersion:
          "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        platform: "Win32",
        vendor: "Google Inc.",
        languages: ["en-US", "en"],
        timezone: "America/New_York",
        gpu: {
          vendor: "Google Inc. (Intel)",
          renderer: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0)"
        }
      },
      {
        id: "mac-chrome-en",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        appVersion:
          "5.0 (Macintosh; Intel Mac OS X 13_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        platform: "MacIntel",
        vendor: "Google Inc.",
        languages: ["en-US", "en"],
        timezone: "America/Los_Angeles",
        gpu: {
          vendor: "Google Inc. (Apple)",
          renderer: "ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)"
        }
      },
      {
        id: "linux-chrome-en",
        userAgent:
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        appVersion:
          "5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        platform: "Linux x86_64",
        vendor: "Google Inc.",
        languages: ["en-US", "en"],
        timezone: "Europe/Berlin",
        gpu: {
          vendor: "Google Inc. (NVIDIA)",
          renderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)"
        }
      }
    ];

    const index = privacyLevel >= 85 ? 0 : privacyLevel >= 55 ? 1 : 2;
    return stableProfiles[index];
  }

  function normalizeInjectedSettings() {
    const payload = document.documentElement.dataset.privacyShieldSettings;
    let parsedSettings = {};

    if (payload) {
      try {
        parsedSettings = JSON.parse(payload);
      } catch (error) {
        console.warn("Privacy Shield settings parse failed", error);
      }
    }

    const defaults = {
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

    return {
      enabled: parsedSettings.enabled !== false,
      features: {
        ...defaults.features,
        ...(parsedSettings.features || {})
      },
      sliders: {
        privacyLevel: clampValue(parsedSettings.sliders?.privacyLevel, defaults.sliders.privacyLevel, 0, 100),
        canvasNoise: clampValue(parsedSettings.sliders?.canvasNoise, defaults.sliders.canvasNoise, 0, 8),
        timerJitter: clampValue(parsedSettings.sliders?.timerJitter, defaults.sliders.timerJitter, 0, 40)
      }
    };
  }

  function patchNavigator(profile, privacyLevel) {
    defineGetter(Navigator.prototype, "userAgent", () => profile.userAgent);
    defineGetter(Navigator.prototype, "appVersion", () => profile.appVersion);
    defineGetter(Navigator.prototype, "platform", () => profile.platform);
    defineGetter(Navigator.prototype, "vendor", () => profile.vendor);
    defineGetter(Navigator.prototype, "languages", () => profile.languages.slice());
    defineGetter(Navigator.prototype, "language", () => profile.languages[0]);
    defineGetter(Navigator.prototype, "webdriver", () => false);

    if (privacyLevel >= 50) {
      defineGetter(Navigator.prototype, "pdfViewerEnabled", () => false);
      defineGetter(Navigator.prototype, "doNotTrack", () => "1");
    }
  }

  function patchHardwareHints(privacyLevel) {
    const hardwareConcurrency = privacyLevel >= 80 ? 4 : privacyLevel >= 50 ? 6 : 8;
    const deviceMemory = privacyLevel >= 80 ? 4 : privacyLevel >= 50 ? 8 : 16;

    defineGetter(Navigator.prototype, "hardwareConcurrency", () => hardwareConcurrency);
    defineGetter(Navigator.prototype, "deviceMemory", () => deviceMemory);
    defineGetter(Screen.prototype, "colorDepth", () => 24);
    defineGetter(Screen.prototype, "pixelDepth", () => 24);
  }

  function patchTimezone(timezone) {
    const OriginalDateTimeFormat = Intl.DateTimeFormat;
    Intl.DateTimeFormat = function (...args) {
      const formatter = new OriginalDateTimeFormat(...args);
      const originalResolvedOptions = formatter.resolvedOptions.bind(formatter);
      formatter.resolvedOptions = () => ({
        ...originalResolvedOptions(),
        timeZone: timezone
      });
      return formatter;
    };
    Intl.DateTimeFormat.prototype = OriginalDateTimeFormat.prototype;
  }

  function patchWebGL(gpu, privacyLevel) {
    const numericSalt = Math.round(privacyLevel / 10);

    [window.WebGLRenderingContext, window.WebGL2RenderingContext]
      .filter(Boolean)
      .forEach((WebGLContext) => {
        const proto = WebGLContext.prototype;
        if (!proto || proto.__privacyShieldPatched) {
          return;
        }

        const originalGetParameter = proto.getParameter;
        proto.getParameter = function (parameter) {
          if (parameter === 37445) {
            return gpu.vendor;
          }

          if (parameter === 37446) {
            return gpu.renderer;
          }

          if (parameter === 3415) {
            return 8;
          }

          if (parameter === 3386) {
            return 4096 - numericSalt;
          }

          return originalGetParameter.call(this, parameter);
        };

        Object.defineProperty(proto, "__privacyShieldPatched", {
          value: true,
          configurable: false,
          enumerable: false
        });
      });
  }

  function patchCanvas(shift) {
    const contextProto = window.CanvasRenderingContext2D && window.CanvasRenderingContext2D.prototype;
    if (!contextProto) {
      return;
    }

    const originalGetImageData = contextProto.getImageData;
    contextProto.getImageData = function (...args) {
      const imageData = originalGetImageData.apply(this, args);
      applyCanvasNoise(imageData.data, shift);
      return imageData;
    };

    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...args) {
      injectNoiseIntoCanvas(this, shift);
      return originalToDataURL.apply(this, args);
    };
  }

  function patchMediaDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return;
    }

    const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices.bind(
      navigator.mediaDevices
    );
    navigator.mediaDevices.enumerateDevices = async () => {
      const devices = await originalEnumerateDevices();
      return devices.map((device) => ({
        ...device,
        deviceId: "",
        groupId: "",
        label: ""
      }));
    };
  }

  function disableBluetooth() {
    defineGetter(Navigator.prototype, "bluetooth", () => undefined);
  }

  function patchPermissions() {
    if (!navigator.permissions || !navigator.permissions.query) {
      return;
    }

    const originalQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = async (params) => {
      const protectedPermissions = new Set([
        "camera",
        "microphone",
        "clipboard-read",
        "clipboard-write"
      ]);

      if (params && protectedPermissions.has(params.name)) {
        return {
          state: "denied",
          onchange: null
        };
      }

      return originalQuery(params);
    };
  }

  function sanitizePlugins() {
    defineGetter(Navigator.prototype, "plugins", () => createEmptyPluginArray());
    defineGetter(Navigator.prototype, "mimeTypes", () => createEmptyMimeTypeArray());
  }

  function patchWebRTC() {
    if (!window.RTCPeerConnection) {
      return;
    }

    const originalAddIceCandidate = RTCPeerConnection.prototype.addIceCandidate;
    RTCPeerConnection.prototype.addIceCandidate = function (candidate, ...args) {
      if (candidate && typeof candidate.candidate === "string") {
        candidate = {
          ...candidate,
          candidate: candidate.candidate.replace(
            /(\d{1,3}\.){3}\d{1,3}/g,
            "0.0.0.0"
          )
        };
      }
      return originalAddIceCandidate.call(this, candidate, ...args);
    };
  }

  function patchTimers(offset) {
    const originalNow = Date.now.bind(Date);
    Date.now = () => originalNow() + offset;

    if (window.performance && typeof window.performance.now === "function") {
      const originalPerformanceNow = window.performance.now.bind(window.performance);
      window.performance.now = () => originalPerformanceNow() + offset / 10;
    }
  }

  function applyCanvasNoise(buffer, shift) {
    if (!shift.r && !shift.g && !shift.b) {
      return;
    }

    for (let index = 0; index < buffer.length; index += 4) {
      buffer[index] = clampChannel(buffer[index] + shift.r);
      buffer[index + 1] = clampChannel(buffer[index + 1] + shift.g);
      buffer[index + 2] = clampChannel(buffer[index + 2] + shift.b);
    }
  }

  function injectNoiseIntoCanvas(canvas, shift) {
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      applyCanvasNoise(imageData.data, shift);
      context.putImageData(imageData, 0, 0);
    } catch (error) {
      console.debug("Canvas privacy patch skipped", error);
    }
  }

  function createEmptyPluginArray() {
    const plugins = [];
    plugins.item = () => null;
    plugins.namedItem = () => null;
    return plugins;
  }

  function createEmptyMimeTypeArray() {
    const mimeTypes = [];
    mimeTypes.item = () => null;
    mimeTypes.namedItem = () => null;
    return mimeTypes;
  }

  function buildStableOffset(seed, magnitude) {
    if (!magnitude) {
      return 0;
    }

    return stableHash(seed) % (magnitude * 2 + 1) - magnitude;
  }

  function buildCanvasShift(seed, magnitude) {
    if (!magnitude) {
      return { r: 0, g: 0, b: 0 };
    }

    return {
      r: buildStableOffset(`${seed}:r`, magnitude),
      g: buildStableOffset(`${seed}:g`, magnitude),
      b: buildStableOffset(`${seed}:b`, magnitude)
    };
  }

  function defineGetter(target, property, getter) {
    Object.defineProperty(target, property, {
      configurable: true,
      enumerable: true,
      get: getter
    });
  }

  function stableHash(input) {
    let hash = 0;
    for (let index = 0; index < input.length; index += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function clampChannel(value) {
    return Math.max(0, Math.min(255, value));
  }

  function clampValue(value, fallback, min, max) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, numericValue));
  }
})();
