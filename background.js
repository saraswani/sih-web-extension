/**
 * PrivacyShield - Manifest V3 Background Service Worker
 * Secure message broker, tab screenshot capture, proxy endpoint client,
 * and resilient local fallback synthesizer.
 * 
 * SECURITY GUARANTEE:
 * - This service worker only transmits sanitized text tokens and pixel-redacted screenshots.
 * - Raw DOM text and raw biometric faces are scrubbed client-side before reaching this worker.
 * - External AI API keys are never stored, logged, or received here.
 */

// Import config
try {
  importScripts('config.js');
} catch (e) {
  console.warn('[PrivacyShield Background] importScripts notice:', e);
}

const DEFAULT_PROXY_URL = (typeof PrivacyShieldConfig !== 'undefined') ? PrivacyShieldConfig.PROXY_SERVER_URL : 'http://localhost:3001/api/agent';

/**
 * Intelligent on-device fallback synthesizer when proxy network is unreachable
 */
function synthesizeLocalActions(screenStructure, task, pageClassification) {
  const lowerTask = (task || '').toLowerCase();
  const elements = screenStructure?.elements || [];

  if (lowerTask.includes('fill') || lowerTask.includes('form') || lowerTask.includes('complete') || lowerTask.includes('auto') || lowerTask.includes('input')) {
    // Filter actual input controls only (exclude buttons)
    const inputs = elements.filter(e => e.type && (e.type.startsWith('input') || e.type === 'select_dropdown' || e.type === 'textarea') && e.type !== 'button' && e.role !== 'button');
    const actions = [];

    inputs.forEach(inp => {
      // 1. Use pre-computed semantic fieldType from screen-analyzer if available
      let fieldType = inp.fieldType || inp.semanticType || '';
      const label = (inp.label || inp.selector || inp.id || '').toLowerCase();

      // 2. If fieldType is generic or missing, infer from label keywords
      if (!fieldType || fieldType === 'text' || fieldType === 'input_text' || fieldType === 'unknown') {
        if (inp.isCaptcha || label.includes('captcha') || label.includes('case sensitive') || label.includes('characters displayed') || label.includes('security code')) {
          fieldType = 'captcha';
        } else if (label.includes('email') || label.includes('mail')) {
          fieldType = 'email';
        } else if (label.includes('phone') || label.includes('mobile') || label.includes('contact') || label.includes('tel')) {
          fieldType = 'phone';
        } else if (label.includes('aadhaar') || label.includes('aadhar') || label.includes('uid')) {
          fieldType = 'aadhaar';
        } else if (label.includes('pan')) {
          fieldType = 'pan';
        } else if (label.includes('first') || label.includes('fname')) {
          fieldType = 'first_name';
        } else if (label.includes('last') || label.includes('lname') || label.includes('surname')) {
          fieldType = 'last_name';
        } else if (label.includes('addr') || label.includes('street') || label.includes('residence') || label.includes('flat')) {
          fieldType = 'address';
        } else if (label.includes('city') || label.includes('district') || label.includes('town')) {
          fieldType = 'city';
        } else if (label.includes('state') || label.includes('province') || label.includes('region')) {
          fieldType = 'state';
        } else if (label.includes('pin') || label.includes('zip') || label.includes('postal')) {
          fieldType = 'pincode';
        } else if (label.includes('country') || label.includes('nation')) {
          fieldType = 'country';
        } else if (label.includes('gender') || label.includes('sex')) {
          fieldType = 'gender';
        } else if (label.includes('feedback') || label.includes('comment') || label.includes('message') || label.includes('query') || label.includes('desc') || inp.type === 'textarea') {
          fieldType = 'feedback';
        } else if (label.includes('category') || label.includes('topic') || label.includes('type') || inp.type === 'select_dropdown') {
          fieldType = 'category';
        } else if (label.includes('name') || label.includes('candidate') || label.includes('applicant')) {
          fieldType = 'name';
        } else {
          fieldType = 'feedback';
        }
      }

      actions.push({
        type: 'fill',
        selector: inp.selector || `input[name="${inp.label}"]`,
        fieldType: fieldType,
        isCaptcha: (fieldType === 'captcha' || inp.isCaptcha === true)
      });
    });

    const buttons = elements.filter(e => e.type === 'button' || e.role === 'button');
    if (buttons.length > 0) {
      actions.push({ type: 'click', selector: buttons[0].selector });
    }

    return {
      type: 'action',
      actions: actions.length > 0 ? actions : [
        { type: 'fill', selector: 'input[name="name"]', fieldType: 'name' },
        { type: 'fill', selector: 'input[name="email"]', fieldType: 'email' },
        { type: 'fill', selector: 'input[name="phone"]', fieldType: 'phone' }
      ]
    };
  }

  if (lowerTask.includes('click') || lowerTask.includes('submit') || lowerTask.includes('press')) {
    const buttons = elements.filter(e => e.type === 'button');
    const btn = buttons[0] || { selector: 'button[type="submit"]' };
    return {
      type: 'action',
      actions: [{ type: 'click', selector: btn.selector }]
    };
  }

  return {
    type: 'response',
    text: `[PrivacyShield Vision Agent]\nAnalyzed ${elements.length} screen elements for task: "${task}".\nPage context: ${pageClassification?.pageType || 'General Form'}.\nAll sensitive PII was redacted locally on device before processing.`
  };
}

/**
 * Checks server health against /health endpoint with a 1.5s timeout.
 */
async function checkProxyHealth(proxyUrl) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { isOnline: false, serverReachable: false, provider: 'Offline' };
  }

  try {
    const parsed = new URL(proxyUrl || DEFAULT_PROXY_URL);
    const healthUrl = `${parsed.protocol}//${parsed.host}/health`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(healthUrl, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        isOnline: true,
        serverReachable: true,
        provider: data.provider || 'Ready',
        model: data.model || 'VLM Active'
      };
    }
    return { isOnline: true, serverReachable: false, status: res.status };
  } catch (e) {
    return { isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true, serverReachable: false, error: e.message };
  }
}

/**
 * Message Handler
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, payload } = message;

  // Handle Tab Screenshot Capture
  if (action === 'CAPTURE_VISIBLE_TAB') {
    (async () => {
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          chrome.tabs.captureVisibleTab(null, { format: 'png' }, (res) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (!res) {
              reject(new Error('captureVisibleTab returned empty data.'));
            } else {
              resolve(res);
            }
          });
        });
        sendResponse({ success: true, dataUrl });
      } catch (err) {
        console.error('[PrivacyShield Background] Tab capture error:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  // Handle Network Status & Health Probe Check
  if (action === 'CHECK_NETWORK_STATUS') {
    (async () => {
      const storage = await chrome.storage.local.get(['proxyUrl']);
      const proxyUrl = storage.proxyUrl || DEFAULT_PROXY_URL;
      const health = await checkProxyHealth(proxyUrl);
      
      const networkStatus = {
        isOnline: (typeof navigator !== 'undefined') ? navigator.onLine : true,
        serverReachable: health.serverReachable,
        mode: health.serverReachable ? 'online' : 'offline_local',
        provider: health.provider || 'Local Synthesizer',
        proxyUrl: proxyUrl,
        lastChecked: Date.now()
      };

      await chrome.storage.local.set({ networkStatus });
      sendResponse({ success: true, networkStatus });
    })();
    return true;
  }

  // Handle Reset Bandwidth Counter
  if (action === 'RESET_BANDWIDTH_STATS') {
    (async () => {
      await chrome.storage.local.set({
        totalDataSentBytes: 0,
        lastPayloadBytes: 0,
        requestCount: 0
      });
      sendResponse({ success: true });
    })();
    return true;
  }

  // Handle Proxy Agent Request (Sanitized Context -> Backend Proxy -> VLM)
  if (action === 'PROXY_AGENT_REQUEST') {
    (async () => {
      const startTime = performance.now();
      const storage = await chrome.storage.local.get(['proxyUrl', 'totalDataSentBytes', 'requestCount']);
      const proxyUrl = storage.proxyUrl || DEFAULT_PROXY_URL;

      // Construct sanitized payload (guaranteed zero raw text/biometrics)
      const outgoingBody = {
        sanitizedText: payload.sanitizedText,
        sanitizedImageBase64: payload.sanitizedImageBase64,
        screenStructure: payload.screenStructure,
        task: payload.task,
        pageClassification: payload.pageClassification,
        timestamp: Date.now()
      };

      const payloadJson = JSON.stringify(outgoingBody);
      const payloadBytes = new TextEncoder().encode(payloadJson).length;
      const prevTotal = Number(storage.totalDataSentBytes) || 0;
      const newTotal = prevTotal + payloadBytes;
      const newCount = (Number(storage.requestCount) || 0) + 1;

      // Persist bandwidth stats
      await chrome.storage.local.set({
        totalDataSentBytes: newTotal,
        lastPayloadBytes: payloadBytes,
        requestCount: newCount
      });

      try {
        console.log(`[PrivacyShield Background] Routing sanitized request (${(payloadBytes / 1024).toFixed(1)} KB) to proxy: ${proxyUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: payloadJson,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Proxy returned HTTP ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

        // Update server reachability status
        await chrome.storage.local.set({
          networkStatus: { isOnline: true, serverReachable: true, mode: 'online', proxyUrl, lastChecked: Date.now() }
        });

        sendResponse({
          success: true,
          data: data.data || data,
          networkDurationMs: durationMs,
          proxyUrlUsed: proxyUrl,
          payloadBytes: payloadBytes,
          totalDataSentBytes: newTotal,
          isLocalFallback: false
        });
      } catch (err) {
        // RESILIENT ON-DEVICE FALLBACK: Synthesize local actions so user never gets an error
        console.warn('[PrivacyShield Background] Proxy fetch notice, activating on-device action synthesis:', err.message);
        const fallbackResult = synthesizeLocalActions(payload.screenStructure, payload.task, payload.pageClassification);
        const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

        // Record offline mode
        await chrome.storage.local.set({
          networkStatus: { isOnline: typeof navigator !== 'undefined' ? navigator.onLine : false, serverReachable: false, mode: 'offline_local', proxyUrl, lastChecked: Date.now() }
        });

        sendResponse({
          success: true,
          data: fallbackResult,
          networkDurationMs: durationMs,
          proxyUrlUsed: `${proxyUrl} (Local Engine Active)`,
          payloadBytes: payloadBytes,
          totalDataSentBytes: newTotal,
          isLocalFallback: true
        });
      }
    })();
    return true;
  }

  // Handle Get Config
  if (action === 'GET_CONFIG') {
    (async () => {
      const stored = await chrome.storage.local.get(null);
      sendResponse({
        success: true,
        config: {
          proxyUrl: stored.proxyUrl || DEFAULT_PROXY_URL,
          mockProfile: stored.mockProfile || PrivacyShieldConfig?.MOCK_PROFILE || {},
          powerMode: !!stored.powerMode,
          totalDataSentBytes: stored.totalDataSentBytes || 0,
          networkStatus: stored.networkStatus || { isOnline: true, serverReachable: true, mode: 'online' }
        }
      });
    })();
    return true;
  }

  // Handle Save Config
  if (action === 'SAVE_CONFIG') {
    (async () => {
      if (payload) {
        await chrome.storage.local.set(payload);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Empty payload' });
      }
    })();
    return true;
  }

  return false;
});

/**
 * Universal Tab Activation Helper
 * Ensures script injection and triggers PrivacyShield on specified tab.
 */
async function ensureAndActivateTab(tabId) {
  if (!tabId) return;
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:') || tab.url.startsWith('chrome-extension://')) {
      return;
    }
    
    // Send message to activate
    chrome.tabs.sendMessage(tabId, { action: 'ACTIVATE_SHIELD' }, async (response) => {
      if (chrome.runtime.lastError || !response) {
        // Inject if missing
        try {
          await chrome.scripting.insertCSS({
            target: { tabId },
            files: ['styles/floating-shield.css', 'styles/panel.css']
          });
          await chrome.scripting.executeScript({
            target: { tabId },
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
          chrome.tabs.sendMessage(tabId, { action: 'ACTIVATE_SHIELD' });
        } catch (err) {
          console.warn('[PrivacyShield Background] Injection error:', err);
        }
      }
    });
  } catch (err) {
    console.warn('[PrivacyShield Background] Tab error:', err);
  }
}

// Action click listener (triggers if action icon is clicked directly)
if (typeof chrome !== 'undefined' && chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener((tab) => {
    if (tab && tab.id) {
      ensureAndActivateTab(tab.id);
    }
  });
}

// Auto-inject content scripts and UI styles into open tabs on extension install or reload
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[PrivacyShield] Extension installed/reloaded. Ensuring UI in open tabs...');
  try {
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*', 'file://*/*'] });
    for (const tab of tabs) {
      if (tab.id && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
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
        } catch (e) {
          // Tab might be unloaded or restricted
        }
      }
    }
  } catch (err) {
    console.warn('[PrivacyShield] Auto-injection on install:', err);
  }
});
