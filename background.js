importScripts("utils/settings.js");

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({
    privacySettings: DEFAULT_PRIVACY_SETTINGS
  });

  console.log("Privacy Shield installed");
});
