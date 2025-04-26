export function generateRandomFingerprint() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/135.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
  ];

  const platforms = [
    "Win32",
    "Linux x86_64",
    "MacIntel"
  ];

  const languagesList = [
    ["en-US", "en"],
    ["en-GB", "en"],
    ["ru-RU", "ru"],
    ["fr-FR", "fr"],
    ["de-DE", "de"]
  ];

  return {
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    languages: languagesList[Math.floor(Math.random() * languagesList.length)]
  };
}

export function generateRandomGPU() {
  const gpus = [
    { vendor: "NVIDIA Corporation", renderer: "NVIDIA GeForce RTX 3060/PCIe/SSE2" },
    { vendor: "NVIDIA Corporation", renderer: "NVIDIA GeForce RTX 4070/PCIe/SSE2" },
    { vendor: "AMD", renderer: "AMD Radeon RX 7900 XT" },
    { vendor: "Intel", renderer: "Intel(R) Iris(R) Xe Graphics" },
    { vendor: "Apple Inc.", renderer: "Apple M2 Pro" }
  ];

  return gpus[Math.floor(Math.random() * gpus.length)];
}

export function generateRandomTimezone() {
  const timezones = [
    "America/New_York",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Europe/Paris",
    "America/Los_Angeles",
    "Asia/Hong_Kong"
  ];

  return timezones[Math.floor(Math.random() * timezones.length)];
}
