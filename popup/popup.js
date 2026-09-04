/**
 * PrivacyShield Popup Controller
 * Automatically activates PrivacyShield on the active browser tab when opened,
 * and allows manual re-triggers, benchmarking, and option configuration.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const badgeNetwork = document.getElementById('badge-network');
  const networkModeDisplay = document.getElementById('network-mode-display');
  const dataSentDisplay = document.getElementById('data-sent-display');
  const latencyAvgDisplay = document.getElementById('latency-avg-display');
  const triggerBtn = document.getElementById('btn-trigger-active-tab');
  const benchmarkBtn = document.getElementById('btn-open-benchmark');
  const optionsBtn = document.getElementById('btn-open-options');

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0.0 KB';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  function updatePopupStats(data) {
    // 1. Data Sent Counter
    const bytes = Number(data.totalDataSentBytes) || 0;
    const reqCount = Number(data.requestCount) || 0;
    if (dataSentDisplay) {
      dataSentDisplay.textContent = `${formatBytes(bytes)} (${reqCount} req${reqCount === 1 ? '' : 's'})`;
    }

    // 2. Rolling Average Latency
    const history = Array.isArray(data.latencyHistory) ? data.latencyHistory : [];
    if (latencyAvgDisplay) {
      if (history.length > 0) {
        const sum = history.reduce((a, b) => a + b, 0);
        const avg = Math.round((sum / history.length) * 10) / 10;
        latencyAvgDisplay.textContent = `~${avg} ms (${history.length} scans)`;
      } else {
        latencyAvgDisplay.textContent = '~0 ms';
      }
    }

    // 3. Network Mode & Health Status
    const net = data.networkStatus;
    if (!net || !net.serverReachable) {
      if (badgeNetwork) {
        badgeNetwork.textContent = 'OFFLINE (LOCAL)';
        badgeNetwork.className = 'badge offline';
      }
      if (networkModeDisplay) {
        networkModeDisplay.textContent = '🟠 100% Local Fallback';
        networkModeDisplay.className = 'value offline';
      }
    } else {
      if (badgeNetwork) {
        badgeNetwork.textContent = 'ONLINE';
        badgeNetwork.className = 'badge active';
      }
      if (networkModeDisplay) {
        networkModeDisplay.textContent = '🟢 Proxy Connected';
        networkModeDisplay.className = 'value verified';
      }
    }
  }

  /**
   * Activates PrivacyShield on the current active browser tab.
   * Auto-injects content scripts and CSS if not already present on the page.
   */
  async function activateOnActiveTab(shouldClosePopup = false) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:'))) {
        if (shouldClosePopup) {
          alert('PrivacyShield cannot run on internal browser management pages. Please navigate to a standard webpage or the test benchmark page!');
        }
        return;
      }

      // 1. Try messaging the content script first
      chrome.tabs.sendMessage(tab.id, { action: 'ACTIVATE_SHIELD' }, async (response) => {
        if (chrome.runtime.lastError || !response) {
          // Content script not yet present on this tab — dynamically inject CSS and scripts!
          try {
            await chrome.scripting.insertCSS({
              target: { tabId: tab.id },
              files: ['styles/floating-shield.css', 'styles/panel.css']
            });
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: [
                'config.js',
                'lib/browser-polyfill.js',
                'lib/pii/verhoeff.js',
                'lib/pii/luhn.js',
                'lib/pii/regex-rules.js',
                'lib/pii/text-detector.js',
                'lib/vision/tf.min.js',
                'lib/vision/blazeface.min.js',
                'lib/vision/face-detector.js',
                'lib/vision/screen-analyzer.js',
                'lib/decision/local-decision-engine.js',
                'lib/redactor/dom-redactor.js',
                'lib/redactor/canvas-redactor.js',
                'lib/executor/action-executor.js',
                'lib/telemetry/instrumentation.js',
                'content.js'
              ]
            });
            // Trigger activation once injected
            chrome.tabs.sendMessage(tab.id, { action: 'ACTIVATE_SHIELD' });
          } catch (injectErr) {
            console.warn('[PrivacyShield Popup] Script injection fallback failed:', injectErr);
          }
        }
        if (shouldClosePopup) {
          window.close();
        }
      });
    } catch (e) {
      console.error(e);
      if (shouldClosePopup) window.close();
    }
  }

  // AUTO-ACTIVATE IMMEDIATELY WHEN EXTENSION IS CLICKED/OPENED ON ANY TAB
  activateOnActiveTab(false);

  // Load initial data and trigger health check
  try {
    chrome.runtime.sendMessage({ action: 'CHECK_NETWORK_STATUS' }, () => {});
    chrome.storage.local.get(['totalDataSentBytes', 'requestCount', 'latencyHistory', 'networkStatus'], (data) => {
      updatePopupStats(data || {});
    });
  } catch (e) {
    console.warn(e);
  }

  // Live storage change listener
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      chrome.storage.local.get(['totalDataSentBytes', 'requestCount', 'latencyHistory', 'networkStatus'], (data) => {
        updatePopupStats(data || {});
      });
    }
  });

  // Re-trigger button click handler
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      activateOnActiveTab(true);
    });
  }

  // Open Benchmark Test Page
  if (benchmarkBtn) {
    benchmarkBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('test/evaluation_page.html') });
      window.close();
    });
  }

  // Open Options Page
  if (optionsBtn) {
    optionsBtn.addEventListener('click', () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
      }
      window.close();
    });
  }
});
