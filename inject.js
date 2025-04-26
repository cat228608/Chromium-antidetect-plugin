(() => {
  console.log("Ultimate AntiDetect running...");

  const userAgents = [
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
	  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
	  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
	  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/122.0.2365.80",
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.97 Safari/537.36",
	  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:119.0) Gecko/20100101 Firefox/119.0",
	  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.110 Safari/537.36",
	  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.198 Safari/537.36",
	  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.126 Safari/537.36",
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:116.0) Gecko/20100101 Firefox/116.0",
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.138 Safari/537.36",
	  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5563.147 Safari/537.36",
	  "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_7_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/117.0.2045.47",
	  "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_7_10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.215 Safari/537.36",
	  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.5304.121 Safari/537.36",
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.119 Safari/537.36",
	  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15",
	  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.5195.125 Safari/537.36"
	];
  const platforms = ["Win32", "Linux x86_64", "MacIntel"];
  const languagesList = [["en-US", "en"], ["ru-RU", "ru"], ["de-DE", "de"]];
  const gpus = [
    { vendor: "NVIDIA Corporation", renderer: "NVIDIA GeForce RTX 4070 Ti/PCIe/SSE2" },
    { vendor: "AMD", renderer: "AMD Radeon RX 7900 XT" },
    { vendor: "Intel", renderer: "Intel Iris Xe Graphics" }
  ];
  const timezones = [
    "America/New_York",
    "Europe/London",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Europe/Berlin"
  ];

  const fingerprint = {
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    languages: languagesList[Math.floor(Math.random() * languagesList.length)],
    gpu: gpus[Math.floor(Math.random() * gpus.length)],
    timezone: timezones[Math.floor(Math.random() * timezones.length)]
  };

  Object.defineProperty(navigator, 'userAgent', { get: () => fingerprint.userAgent });
  Object.defineProperty(navigator, 'platform', { get: () => fingerprint.platform });
  Object.defineProperty(navigator, 'languages', { get: () => fingerprint.languages });
  Object.defineProperty(navigator, 'webdriver', { get: () => false });

  const originalDateTimeFormat = Intl.DateTimeFormat;
  Intl.DateTimeFormat = function(...args) {
    const instance = new originalDateTimeFormat(...args);
    const originalResolvedOptions = instance.resolvedOptions;
    instance.resolvedOptions = function() {
      const options = originalResolvedOptions.apply(this, arguments);
      options.timeZone = fingerprint.timezone;
      return options;
    };
    return instance;
  };

  const spoofWebGL = (contextName) => {
	  const proto = window[contextName] && window[contextName].prototype;
	  if (!proto) return;

	  const originalGetParameter = proto.getParameter;
	  proto.getParameter = function(parameter) {
		const paramSpoof = {
		  37445: fingerprint.gpu.vendor,    // UNMASKED_VENDOR_WEBGL
		  37446: fingerprint.gpu.renderer   // UNMASKED_RENDERER_WEBGL
		};

		if (parameter in paramSpoof) {
		  return paramSpoof[parameter];
		}

		try {
		  return originalGetParameter.call(this, parameter);
		} catch (err) {
		  // Если оригинальный WebGL падает с ошибкой, просто вернуть null
		  return null;
		}
	  };
	};

	spoofWebGL('WebGLRenderingContext');
	spoofWebGL('WebGL2RenderingContext');

  // Spoof Canvas
  const getImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function() {
    const imageData = getImageData.apply(this, arguments);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] += 1;
      imageData.data[i+1] += 1;
      imageData.data[i+2] += 1;
    }
    return imageData;
  };

  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices = () => Promise.resolve([]);
  }

  if (navigator.bluetooth) {
    navigator.bluetooth = undefined;
  }

  if (navigator.permissions && navigator.permissions.query) {
    const originalQuery = navigator.permissions.query;
    navigator.permissions.query = (params) => (
      params.name === 'camera' || params.name === 'microphone'
        ? Promise.resolve({ state: 'denied' })
        : originalQuery(params)
    );
  }

  Object.defineProperty(navigator, 'plugins', { get: () => [] });
  Object.defineProperty(navigator, 'mimeTypes', { get: () => [] });

})();
