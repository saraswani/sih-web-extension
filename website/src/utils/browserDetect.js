/**
 * Browser & OS Detection Utility
 * Determines client operating system, browser engine, and recommended download package.
 * Lightweight, privacy-friendly, 100% client-side.
 */

export function detectUserEnv() {
  if (typeof window === 'undefined') {
    return {
      os: 'Unknown OS',
      browser: 'Chrome',
      isChromium: true,
      isFirefox: false,
      isMobile: false,
      recommendedPackage: 'chrome',
      downloadUrl: '/downloads/phantom-ai-chrome.zip',
      packageName: 'phantom-ai-chrome.zip',
      label: 'Detected: Desktop · Chrome'
    };
  }

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';

  // 1. Detect OS
  let os = 'Desktop';
  let isMobile = false;

  if (/android/i.test(ua)) {
    os = 'Android';
    isMobile = true;
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
    isMobile = true;
  } else if (/mac/i.test(platform) || /macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/win/i.test(platform) || /windows/i.test(ua)) {
    os = 'Windows';
  } else if (/linux/i.test(platform) || /linux/i.test(ua)) {
    os = 'Linux';
  } else if (/cros/i.test(ua)) {
    os = 'ChromeOS';
  }

  // 2. Detect Browser
  let browser = 'Chrome';
  let isFirefox = false;
  let isChromium = true;

  if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
    isFirefox = true;
    isChromium = false;
  } else if (/edg\//i.test(ua)) {
    browser = 'Edge';
    isChromium = true;
  } else if (/brave/i.test(navigator.brave ? 'brave' : '')) {
    browser = 'Brave';
    isChromium = true;
  } else if (/opr\/|opera/i.test(ua)) {
    browser = 'Opera';
    isChromium = true;
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = 'Safari';
    isChromium = false;
  } else if (/chrome|crios/i.test(ua)) {
    browser = 'Chrome';
    isChromium = true;
  }

  // 3. Recommended package & download URLs
  const recommendedPackage = isFirefox ? 'firefox' : 'chrome';
  const downloadUrl = isFirefox 
    ? '/downloads/phantom-ai-firefox.xpi' 
    : '/downloads/phantom-ai-chrome.zip';
  const packageName = isFirefox ? 'phantom-ai-firefox.xpi' : 'phantom-ai-chrome.zip';

  const label = `Detected: ${os} · ${browser}`;

  return {
    os,
    browser,
    isChromium,
    isFirefox,
    isMobile,
    recommendedPackage,
    downloadUrl,
    packageName,
    label
  };
}
