/**
 * PrivacyShield - Core Content Script & One-Button Pipeline Coordinator
 * 
 * Orchestrates:
 * 1. DOM Scan & Text PII / NER Detection (with Verhoeff, Luhn, Regex, Entropy)
 * 2. Local Face / Visual PII Detection (BlazeFace ML + Heuristic Fallback)
 * 3. Local Screen-Understanding & UI Structure Model (Structured JSON + Topology Fingerprint)
 * 4. In-Place DOM Redaction & Canvas Screenshot Redaction (Solid Masks + Gaussian Face Blurs)
 * 5. Local Decision Engine (Page Classification + State Delta Analysis)
 * 6. Proxy Server Communication & Live DOM Action Execution (Visual Highlight + Mock Profile Autofill)
 */
(function() {
  'use strict';

  // Prevent duplicate instances, but guarantee UI presence
  if (window.__PRIVACY_SHIELD_INITIALIZED__) {
    if (typeof window.__PRIVACY_SHIELD_INJECT_UI__ === 'function') {
      window.__PRIVACY_SHIELD_INJECT_UI__();
    }
    return;
  }
  window.__PRIVACY_SHIELD_INITIALIZED__ = true;

  console.log('[PrivacyShield] Initializing Privacy-Preserving Vision Agent...');

  // Module References (loaded in order via manifest or global scripts)
  const config = window.PrivacyShieldConfig || {};
  const textDetector = window.textPIIDetector;
  const domRedactor = window.domRedactor;
  const faceDetector = window.faceDetector;
  const screenAnalyzer = window.screenAnalyzer;
  const canvasRedactor = window.canvasRedactor;
  const decisionEngine = window.decisionEngine;
  const actionExecutor = window.actionExecutor;
  const instrumentation = window.instrumentation;

  // Pipeline State
  let pipelineState = {
    isScanning: false,
    isRedacted: false,
    currentScreenshot: null,
    sanitizedScreenshotBase64: null,
    sanitizedTextBundle: '',
    screenStructure: null,
    localDecision: null,
    lastTask: '',
    lastTelemetry: null
  };

  /**
   * Safe check if the extension runtime context is still valid (not invalidated by extension reload).
   */
  function isExtensionContextValid() {
    return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
  }

  /**
   * Safe wrapper for chrome.runtime.sendMessage that gracefully catches Extension context invalidated.
   */
  function safeSendMessage(message) {
    return new Promise((resolve) => {
      try {
        if (!isExtensionContextValid()) {
          resolve({ success: false, contextInvalidated: true, error: 'Extension was reloaded. Please refresh the page.' });
          return;
        }
        chrome.runtime.sendMessage(message, (res) => {
          if (chrome.runtime.lastError) {
            const errText = chrome.runtime.lastError.message || '';
            resolve({
              success: false,
              error: errText,
              contextInvalidated: errText.includes('Extension context invalidated')
            });
          } else {
            resolve(res || { success: true });
          }
        });
      } catch (err) {
        resolve({
          success: false,
          error: err.message,
          contextInvalidated: (err.message || '').includes('Extension context invalidated')
        });
      }
    });
  }

  /**
   * Safe wrapper for chrome.storage.local.get.
   */
  function safeStorageGet(keys) {
    return new Promise((resolve) => {
      try {
        if (!isExtensionContextValid() || !chrome.storage || !chrome.storage.local) {
          resolve({});
          return;
        }
        chrome.storage.local.get(keys, (res) => {
          if (chrome.runtime.lastError) {
            resolve({});
          } else {
            resolve(res || {});
          }
        });
      } catch (e) {
        resolve({});
      }
    });
  }

  /**
   * Builds and injects the floating action button and inspection panel into the host page.
   */
  function injectUI() {
    try {
      const existing = document.getElementById('privacyshield-root');
      if (existing) {
        const fabEl = existing.querySelector('.ps-fab-button');
        if (fabEl) {
          fabEl.style.display = 'flex';
          fabEl.style.visibility = 'visible';
          fabEl.style.opacity = '1';
        }
        return;
      }

      const targetParent = document.body || document.documentElement;
      if (!targetParent) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', injectUI, { once: true });
        } else {
          setTimeout(injectUI, 100);
        }
        return;
      }

      const host = document.createElement('div');
      host.id = 'privacyshield-root';

    // SVG Shield Icon
    const shieldSvg = `
      <svg class="ps-shield-svg" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4" stroke-width="2.2"/>
      </svg>
    `;

    // Floating Button
    const fab = document.createElement('button');
    fab.className = 'ps-fab-button';
    fab.setAttribute('title', 'PrivacyShield: Click to Scan, Redact & Launch Vision Agent');
    fab.innerHTML = `
      ${shieldSvg}
      <span class="ps-fab-badge" id="ps-fab-badge">LOCAL</span>
      <span class="ps-fab-latency" id="ps-fab-latency">0 ms</span>
      <span class="ps-fab-tooltip">PrivacyShield Agent (1-Click)</span>
    `;

    // Panel
    const panel = document.createElement('div');
    panel.className = 'ps-panel';
    panel.id = 'ps-panel';
    panel.style.display = 'none';

    panel.innerHTML = `
      <!-- Header -->
      <div class="ps-header">
        <div class="ps-header-title">
          <svg style="width:18px;height:18px;stroke:#00f2fe;fill:none;" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2"/>
          </svg>
          <h3>PrivacyShield Agent</h3>
          <span class="ps-version-pill">Local ML</span>
          <span class="ps-mode-pill" id="ps-mode-pill">ONLINE</span>
        </div>
        <div class="ps-header-actions">
          <span class="ps-latency-pill" id="ps-header-latency" title="Live / Rolling 10x Avg Latency">⚡ 0 ms</span>
          <button class="ps-icon-btn" id="ps-close-btn" title="Close Panel">✕</button>
        </div>
      </div>

      <!-- Main Body -->
      <div class="ps-body">
        <!-- Progress Bar -->
        <div class="ps-progress-container" id="ps-progress-box">
          <div class="ps-progress-header">
            <span id="ps-progress-status">Ready to Scan</span>
            <span id="ps-progress-percent">0%</span>
          </div>
          <div class="ps-progress-track">
            <div class="ps-progress-fill" id="ps-progress-fill"></div>
          </div>
          <div class="ps-stage-badges">
            <div class="ps-stage-badge" id="badge-dom"><span>•</span> DOM Scan</div>
            <div class="ps-stage-badge" id="badge-pii"><span>•</span> PII Redaction</div>
            <div class="ps-stage-badge" id="badge-face"><span>•</span> Face ML</div>
            <div class="ps-stage-badge" id="badge-screen"><span>•</span> Screen Model</div>
            <div class="ps-stage-badge" id="badge-pixel"><span>•</span> Pixel Blur</div>
          </div>
        </div>

        <!-- Sanitized Stats Grid -->
        <div class="ps-stats-grid" id="ps-stats-grid" style="display:none;">
          <div class="ps-stat-card">
            <div class="ps-stat-value" id="stat-pii-count">0</div>
            <div class="ps-stat-label">PII Masked</div>
          </div>
          <div class="ps-stat-card">
            <div class="ps-stat-value" id="stat-faces-count">0</div>
            <div class="ps-stat-label">Faces Blurred</div>
          </div>
          <div class="ps-stat-card">
            <div class="ps-stat-value" id="stat-elements-count">0</div>
            <div class="ps-stat-label">UI Elements</div>
          </div>
        </div>

        <!-- Surfaced PII & Confidence Breakdown List -->
        <div class="ps-pii-card" id="ps-pii-card" style="display:none;">
          <div class="ps-doc-summary-banner" id="ps-doc-summary-banner">
            <span>🛡️ Redacted: 0 items</span>
          </div>
          <div class="ps-pii-header">
            <span>Redacted PII Confidence Breakdown</span>
            <span id="ps-pii-summary-label" style="color:#94a3b8;font-size:10px;font-weight:600;">0 entities</span>
          </div>
          <div class="ps-pii-list" id="ps-pii-list"></div>
        </div>

        <!-- Redacted Image Preview -->
        <div class="ps-preview-box" id="ps-preview-box" style="display:none;">
          <div class="ps-preview-header">
            <span>Sanitized Screen Preview (Zero PII Leaked)</span>
            <span style="color:#10b981;font-size:10px;font-weight:700;">● REDACTED</span>
          </div>
          <img class="ps-preview-img" id="ps-preview-img" alt="Redacted Screen"/>
        </div>

        <!-- Task Input Box -->
        <div class="ps-task-box" id="ps-task-box" style="display:none;">
          <label class="ps-task-label" for="ps-task-input">What do you want me to do?</label>
          <div class="ps-input-row">
            <input type="text" class="ps-task-input" id="ps-task-input" placeholder="e.g., fill this application form, click submit, summarize"/>
            <button class="ps-go-btn" id="ps-go-btn">
              <span>Go</span>
              <svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <!-- Agent Response / Action Result Card -->
        <div class="ps-result-card" id="ps-result-card" style="display:none;">
          <div class="ps-result-header">
            <span id="ps-result-icon">⚡</span>
            <span id="ps-result-title">Agent Execution Result</span>
          </div>
          <div class="ps-result-content" id="ps-result-content"></div>
        </div>
      </div>

      <!-- Telemetry & Decision Drawer (Collapsible) -->
      <div class="ps-drawer" id="ps-drawer">
        <div class="ps-drawer-header" id="ps-drawer-toggle">
          <span>⚙ Telemetry & Decision Audit (<span id="ps-total-latency">0 ms</span>)</span>
          <span id="ps-drawer-arrow">▼</span>
        </div>
        <div class="ps-drawer-body" id="ps-drawer-body" style="display:none;">
          <div style="margin-bottom:6px;color:#94a3b8;font-size:10px;" id="ps-telemetry-meta">
            Hardware: <strong id="meta-hw">Detecting...</strong> | Face ML: <strong id="meta-face">BlazeFace</strong>
          </div>
          <div style="margin-bottom:6px;color:#94a3b8;font-size:10px;" id="ps-decision-meta">
            Decision: <strong id="meta-decision" style="color:#38bdf8;">Evaluating...</strong>
          </div>
          <div id="ps-waterfall-container"></div>
        </div>
      </div>

      <!-- Footer Controls -->
      <div class="ps-footer">
        <button class="ps-text-btn" id="ps-restore-btn">Restore Original DOM</button>
        <button class="ps-text-btn" id="ps-rescan-btn">Re-Scan & Redact</button>
      </div>
    `;

    host.appendChild(panel);
    host.appendChild(fab);
    targetParent.appendChild(host);

    // Initial check of network status
    syncNetworkBadge();

    // Event Bindings
    fab.addEventListener('click', onOneButtonClick);
    panel.querySelector('#ps-close-btn').addEventListener('click', () => panel.style.display = 'none');
    panel.querySelector('#ps-restore-btn').addEventListener('click', onRestorePage);
    panel.querySelector('#ps-rescan-btn').addEventListener('click', () => onOneButtonClick(true));
    panel.querySelector('#ps-drawer-toggle').addEventListener('click', toggleTelemetryDrawer);

    const taskInput = panel.querySelector('#ps-task-input');
    const goBtn = panel.querySelector('#ps-go-btn');

    goBtn.addEventListener('click', onTaskSubmit);
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onTaskSubmit();
      }
    });
  } catch (err) {
    console.error('[PrivacyShield] Failed to inject UI:', err);
  }
}

  /**
   * Toggles the telemetry drawer open/closed.
   */
  function toggleTelemetryDrawer() {
    const body = document.getElementById('ps-drawer-body');
    const arrow = document.getElementById('ps-drawer-arrow');
    if (body.style.display === 'none') {
      body.style.display = 'flex';
      arrow.textContent = '▲';
    } else {
      body.style.display = 'none';
      arrow.textContent = '▼';
    }
  }

  /**
   * Updates progress bar and active stage badge.
   */
  function updateProgress(percent, label, activeBadgeId) {
    const statusEl = document.getElementById('ps-progress-status');
    const percentEl = document.getElementById('ps-progress-percent');
    const fillEl = document.getElementById('ps-progress-fill');

    if (statusEl) statusEl.textContent = label;
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;

    const badges = ['badge-dom', 'badge-pii', 'badge-face', 'badge-screen', 'badge-pixel'];
    badges.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === activeBadgeId) {
        el.className = 'ps-stage-badge active';
      } else if (badges.indexOf(id) < badges.indexOf(activeBadgeId)) {
        el.className = 'ps-stage-badge done';
      }
    });
  }

  /**
   * Synchronizes network and offline status badge on FAB and panel.
   */
  async function syncNetworkBadge() {
    try {
      const res = await safeSendMessage({ action: 'CHECK_NETWORK_STATUS' });
      const net = res?.networkStatus;
      const fabBadge = document.getElementById('ps-fab-badge');
      const modePill = document.getElementById('ps-mode-pill');

      if (!net || !net.serverReachable || res.contextInvalidated) {
        if (fabBadge) {
          fabBadge.textContent = 'OFFLINE';
          fabBadge.className = 'ps-fab-badge offline';
        }
        if (modePill) {
          modePill.textContent = 'OFFLINE (LOCAL)';
          modePill.className = 'ps-mode-pill offline';
          modePill.title = '100% on-device action synthesis and local redaction active.';
        }
      } else {
        if (fabBadge) {
          fabBadge.textContent = 'ONLINE';
          fabBadge.className = 'ps-fab-badge';
        }
        if (modePill) {
          modePill.textContent = 'ONLINE (PROXY)';
          modePill.className = 'ps-mode-pill';
          modePill.title = `Connected to proxy: ${net.provider || 'Ready'}`;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Renders the detected PII items and their verified confidence scores in the on-page panel.
   */
  function renderPIIConfidenceList(entities = [], categorySummary = null, detectedFaces = []) {
    const card = document.getElementById('ps-pii-card');
    const list = document.getElementById('ps-pii-list');
    const label = document.getElementById('ps-pii-summary-label');
    const banner = document.getElementById('ps-doc-summary-banner');

    if (!card || !list) return;

    const hasFaces = detectedFaces && detectedFaces.length > 0;
    const hasEntities = entities && entities.length > 0;

    if (!hasEntities && !hasFaces) {
      card.style.display = 'none';
      list.innerHTML = '';
      return;
    }

    card.style.display = 'flex';
    label.textContent = `${entities.length} PII items${hasFaces ? ` + ${detectedFaces.length} face photo(s)` : ''}`;
    list.innerHTML = '';

    // Render prominent human-readable Document Redaction Summary Banner
    if (banner) {
      let summaryText = categorySummary?.summaryString || (hasEntities ? `Redacted: ${entities.length} sensitive items` : 'No text PII detected');
      if (hasFaces) {
        summaryText += ` | 📷 Photo Detected (${detectedFaces.length} face${detectedFaces.length > 1 ? 's' : ''} blurred with BlazeFace ML)`;
      }
      banner.innerHTML = `<span>🛡️ <strong>${summaryText}</strong></span>`;
      banner.style.display = 'flex';
    }

    // Render face photo row if faces were detected
    if (hasFaces) {
      const faceRow = document.createElement('div');
      faceRow.className = 'ps-pii-item';
      faceRow.style.borderLeft = '3px solid #00f2fe';
      faceRow.innerHTML = `
        <div class="ps-pii-token-wrap">
          <span class="ps-pii-token">📷 [PHOTO / FACE REDACTED]</span>
          <span class="ps-pii-cat">(BlazeFace ML Vision)</span>
        </div>
        <span class="ps-conf-badge high" title="BlazeFace ML Bounding Box Face Blur Active">95% Conf</span>
      `;
      list.appendChild(faceRow);
    }

    // Deduplicate by token for clean display
    const seen = new Set();
    for (const ent of entities) {
      if (seen.has(ent.token)) continue;
      seen.add(ent.token);

      const row = document.createElement('div');
      row.className = 'ps-pii-item';

      const conf = ent.confidencePercent || Math.round((ent.confidence || 0.95) * 100);
      const confClass = conf >= 95 ? 'high' : 'med';

      row.innerHTML = `
        <div class="ps-pii-token-wrap">
          <span class="ps-pii-token">${ent.token}</span>
          <span class="ps-pii-cat">(${ent.category || ent.prefix})</span>
        </div>
        <span class="ps-conf-badge ${confClass}" title="${ent.verificationMethod || 'Validated'}">${conf}% Conf</span>
      `;
      list.appendChild(row);
    }
  }

  /**
   * The One-Button Flow Trigger:
   * Single click scans visible DOM + takes screenshot + runs local PII + runs BlazeFace + runs screen model + redacts DOM & pixels.
   * @param {boolean} [forceRescan=false]
   */
  async function onOneButtonClick(forceRescan = false) {
    if (pipelineState.isScanning) return;

    const panel = document.getElementById('ps-panel');
    const fab = document.querySelector('.ps-fab-button');
    if (panel) panel.style.display = 'flex';
    if (fab) fab.classList.add('ps-active');

    // Handle extension reload / context invalidation cleanly
    if (!isExtensionContextValid()) {
      updateProgress(0, 'Extension reloaded. Please refresh tab to reconnect.', 'badge-dom');
      const statusEl = document.getElementById('ps-progress-status');
      if (statusEl) {
        statusEl.innerHTML = `Extension reloaded. <button id="ps-tab-reload-btn" style="background:#0284c7;color:#ffffff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:10px;margin-left:6px;font-weight:700;">🔄 Refresh Tab</button>`;
        document.getElementById('ps-tab-reload-btn')?.addEventListener('click', () => location.reload());
      }
      return;
    }

    pipelineState.isScanning = true;

    // Check Power Mode setting
    let isPowerMode = false;
    try {
      const stored = await safeStorageGet(['powerMode']);
      isPowerMode = !!stored?.powerMode;
    } catch (e) {
      // ignore
    }

    // POWER MODE OPTIMIZATION: Check if screen state is unchanged and already redacted
    if (isPowerMode && !forceRescan && pipelineState.isRedacted && pipelineState.screenStructure) {
      const fastScreenAnalysis = screenAnalyzer.analyzeScreen();
      if (!fastScreenAnalysis.isStateChanged) {
        console.log('[PrivacyShield PowerMode] Screen fingerprint unchanged (' + fastScreenAnalysis.fingerprint + '). Skipping redundant scan & ML inference.');
        updateProgress(100, 'Power Saver: DOM Unchanged (Reusing Redaction)', 'badge-pixel');
        ['badge-dom', 'badge-pii', 'badge-face', 'badge-screen', 'badge-pixel'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.className = 'ps-stage-badge done';
        });

        const metrics = instrumentation.getLatencyMetrics();
        const latencyEl = document.getElementById('ps-header-latency');
        const fabLatency = document.getElementById('ps-fab-latency');
        if (latencyEl) latencyEl.textContent = `⚡ 0 ms (Pwr Mode)`;
        if (fabLatency) fabLatency.textContent = `0 ms`;

        pipelineState.isScanning = false;
        fab.classList.remove('ps-active');
        return;
      }
    }

    // Reset view states
    document.getElementById('ps-stats-grid').style.display = 'none';
    document.getElementById('ps-preview-box').style.display = 'none';
    document.getElementById('ps-task-box').style.display = 'none';
    document.getElementById('ps-result-card').style.display = 'none';

    // Start Telemetry Session
    instrumentation.startSession('one_button_scan_and_redact');

    try {
      // 1. DOM Scan & Text PII / NER Detection
      updateProgress(15, 'Scanning DOM & Analyzing Text PII...', 'badge-dom');
      instrumentation.startStage('dom_text_pii_scan');
      
      const domRedactionResult = domRedactor.redactPageDOM();
      instrumentation.endStage('dom_text_pii_scan', { piiCount: domRedactionResult.totalRedacted });

      // 2. Face / Visual PII Detection (BlazeFace ML + Fallback)
      updateProgress(35, 'Running Local BlazeFace Face Detection...', 'badge-face');
      instrumentation.startStage('local_face_detection');

      const detectedFaces = await faceDetector.scanPageImages();
      const faceStatus = faceDetector.getStatus();

      // Inject Live DOM Face Overlays & Photo Redacted Badges
      if (domRedactor && typeof domRedactor.redactDOMFaces === 'function') {
        domRedactor.redactDOMFaces(detectedFaces);
      }

      instrumentation.endStage('local_face_detection', { facesCount: detectedFaces.length, backend: faceStatus.activeBackend });

      // 3. Screen-Understanding & UI Structure Model (Component 1)
      updateProgress(55, 'Executing Local Screen-Understanding Model...', 'badge-screen');
      instrumentation.startStage('screen_structure_model');

      const screenAnalysis = screenAnalyzer.analyzeScreen();
      pipelineState.screenStructure = screenAnalysis;
      instrumentation.endStage('screen_structure_model', { totalElements: screenAnalysis.totalElements });

      // 4. Tab Screenshot Capture & Pixel-Level Canvas Redaction
      updateProgress(75, 'Capturing & Redacting Screenshot Pixels...', 'badge-pixel');
      instrumentation.startStage('screenshot_capture_and_canvas_redaction');

      // Request tab screenshot from background service worker safely
      const captureResponse = await safeSendMessage({ action: 'CAPTURE_VISIBLE_TAB' });

      let sanitizedImageBase64 = null;
      if (captureResponse && captureResponse.success && captureResponse.dataUrl) {
        const redactCanvasResult = await canvasRedactor.redactScreenshot(
          captureResponse.dataUrl,
          domRedactionResult.boundingBoxes,
          detectedFaces
        );
        sanitizedImageBase64 = redactCanvasResult.sanitizedImageBase64;
      }
      pipelineState.sanitizedScreenshotBase64 = sanitizedImageBase64;
      instrumentation.endStage('screenshot_capture_and_canvas_redaction');

      // 5. Local Decision-Making Engine (Component 4)
      updateProgress(90, 'Evaluating Local Strategy & Delta Fingerprint...', 'badge-screen');
      instrumentation.startStage('local_decision_engine');

      const decision = decisionEngine.evaluateDecision(screenAnalysis, '');
      pipelineState.localDecision = decision;
      instrumentation.endStage('local_decision_engine', { pageType: decision.pageClassification.pageType });

      // Finalize Telemetry Session
      const sessionSummary = instrumentation.endSession();
      pipelineState.lastTelemetry = sessionSummary;

      // Update UI with Results
      updateProgress(100, 'Redaction Complete (Zero PII Transmitted)', 'badge-pixel');
      ['badge-dom', 'badge-pii', 'badge-face', 'badge-screen', 'badge-pixel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = 'ps-stage-badge done';
      });

      // Show Statistics
      document.getElementById('stat-pii-count').textContent = domRedactionResult.totalRedacted;
      document.getElementById('stat-faces-count').textContent = detectedFaces.length;
      document.getElementById('stat-elements-count').textContent = screenAnalysis.totalElements;
      document.getElementById('ps-stats-grid').style.display = 'grid';

      // Render Surfaced PII Confidence List & Document Redaction Summary
      renderPIIConfidenceList(domRedactionResult.entities || [], domRedactionResult.categorySummary, detectedFaces);

      // Show Redacted Preview Image
      if (sanitizedImageBase64) {
        const previewImg = document.getElementById('ps-preview-img');
        previewImg.src = sanitizedImageBase64;
        document.getElementById('ps-preview-box').style.display = 'block';
      }

      // Render Telemetry Waterfall Breakdown & Live Header Latency
      renderTelemetryUI(sessionSummary, faceStatus, decision);

      // Reveal Task Input Pre-Focused
      const taskBox = document.getElementById('ps-task-box');
      taskBox.style.display = 'flex';
      const taskInput = document.getElementById('ps-task-input');
      taskInput.focus();

      pipelineState.isRedacted = true;
    } catch (err) {
      console.error('[PrivacyShield] Error in pipeline execution:', err);
      const isContextErr = (err.message || '').includes('Extension context invalidated');
      if (isContextErr) {
        updateProgress(0, 'Extension reloaded. Please refresh tab to reconnect.', 'badge-dom');
        const statusEl = document.getElementById('ps-progress-status');
        if (statusEl) {
          statusEl.innerHTML = `Extension reloaded. <button id="ps-tab-reload-btn" style="background:#0284c7;color:#ffffff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:10px;margin-left:6px;font-weight:700;">🔄 Refresh Tab</button>`;
          document.getElementById('ps-tab-reload-btn')?.addEventListener('click', () => location.reload());
        }
      } else {
        updateProgress(0, `Error: ${err.message}`, 'badge-dom');
      }
    } finally {
      pipelineState.isScanning = false;
      fab.classList.remove('ps-active');
    }
  }

  /**
   * Renders the latency waterfall chart, memory snapshots, and decision audit logs in the drawer.
   */
  function renderTelemetryUI(session, faceStatus, decision) {
    if (!session) return;

    const latencyMetrics = instrumentation.getLatencyMetrics();

    // Update live latency in floating FAB and Header pill
    const headerLatency = document.getElementById('ps-header-latency');
    const fabLatency = document.getElementById('ps-fab-latency');
    if (headerLatency) {
      headerLatency.textContent = `⚡ ${session.totalDurationMs} ms (avg: ${latencyMetrics.rollingAvgDurationMs}ms)`;
      headerLatency.setAttribute('title', `Latest: ${session.totalDurationMs} ms | Rolling Avg (last ${latencyMetrics.sampleCount} scans): ${latencyMetrics.rollingAvgDurationMs} ms`);
    }
    if (fabLatency) {
      fabLatency.textContent = `${session.totalDurationMs} ms`;
    }

    document.getElementById('ps-total-latency').textContent = `${session.totalDurationMs} ms (avg: ${latencyMetrics.rollingAvgDurationMs} ms)`;
    document.getElementById('meta-hw').textContent = instrumentation.getSystemDiagnostics().hardwareProvider;
    document.getElementById('meta-face').textContent = faceStatus.activeBackend;
    document.getElementById('meta-decision').textContent = `[${decision.pageClassification.pageType}] ${decision.selectedStrategy}`;

    const container = document.getElementById('ps-waterfall-container');
    container.innerHTML = '';

    const stageLabels = {
      dom_text_pii_scan: '1. DOM PII Scan & Mask',
      local_face_detection: '2. BlazeFace Face ML',
      screen_structure_model: '3. Screen Understanding',
      screenshot_capture_and_canvas_redaction: '4. Canvas Pixel Redaction',
      local_decision_engine: '5. Local Decision Delta',
      server_agent_roundtrip: '6. Server VLM Proxy',
      action_execution_dom: '7. Live Action Runner'
    };

    for (const [key, stage] of Object.entries(session.stages)) {
      const label = stageLabels[key] || key;
      const row = document.createElement('div');
      row.className = 'ps-waterfall-row';
      row.innerHTML = `
        <div class="ps-waterfall-name" title="${label}">${label}</div>
        <div class="ps-waterfall-bar-track">
          <div class="ps-waterfall-bar" style="width: ${Math.max(4, Math.min(100, (stage.durationMs / session.totalDurationMs) * 100))}%;"></div>
        </div>
        <div class="ps-waterfall-val">${stage.durationMs}ms</div>
      `;
      container.appendChild(row);
    }
  }

  /**
   * Submits the user's task prompt along with sanitized screen context to the secure proxy server.
   */
  async function onTaskSubmit() {
    const taskInput = document.getElementById('ps-task-input');
    const task = (taskInput.value || '').trim();
    if (!task) return;

    const goBtn = document.getElementById('ps-go-btn');
    const resultCard = document.getElementById('ps-result-card');
    const resultContent = document.getElementById('ps-result-content');
    const resultTitle = document.getElementById('ps-result-title');

    goBtn.disabled = true;
    goBtn.innerHTML = `<span>Synthesizing...</span>`;

    resultCard.style.display = 'flex';
    resultContent.innerHTML = `<div style="color:#94a3b8;">Processing sanitized context with proxy agent...</div>`;

    // Start Action Roundtrip Session
    const actionSession = instrumentation.startSession('agent_task_execution');
    instrumentation.startStage('server_agent_roundtrip');

    try {
      // 1. Evaluate Decision for Task
      const decision = decisionEngine.evaluateDecision(pipelineState.screenStructure, task);

      // 2. Prepare Sanitized Text Context (Extracted from DOM without real PII)
      const sanitizedDOMText = document.body.innerText.slice(0, 4000);

      // 3. Send Proxy Agent Request (Background -> Proxy Server)
      const response = await safeSendMessage({
        action: 'PROXY_AGENT_REQUEST',
        payload: {
          sanitizedText: sanitizedDOMText,
          sanitizedImageBase64: pipelineState.sanitizedScreenshotBase64,
          screenStructure: pipelineState.screenStructure,
          task: task,
          pageClassification: decision.pageClassification
        }
      });

      instrumentation.endStage('server_agent_roundtrip', { durationMs: response?.networkDurationMs });

      if (!response || !response.success) {
        if (response?.contextInvalidated) {
          throw new Error('Extension was reloaded. Please refresh this tab to reconnect.');
        }
        throw new Error(response?.error || 'Proxy server response failed.');
      }

      const agentData = response.data;
      console.log('[PrivacyShield] Agent Response:', agentData);

      // 4. Handle Server Response (Action vs Text Response)
      if (agentData.type === 'action' && Array.isArray(agentData.actions)) {
        resultTitle.textContent = `Autonomous Actions (${agentData.actions.length})`;
        resultContent.innerHTML = `
          <div style="margin-bottom:8px;color:#38bdf8;">Executing ${agentData.actions.length} UI actions on live DOM:</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${agentData.actions.map(a => `<div class="ps-action-pill">⚡ ${a.type.toUpperCase()}: ${a.selector || a.fieldType || 'viewport'}</div>`).join('')}
          </div>
        `;

        // Execute Actions on live unredacted DOM with CAPTCHA safety handling
        instrumentation.startStage('action_execution_dom');
        let isPausedForCaptcha = false;

        const execResults = await actionExecutor.executeActions(agentData.actions, {
          onCaptchaPause: ({ action, targetEl, actionIndex, remainingActions }) => {
            isPausedForCaptcha = true;
            resultTitle.textContent = 'Action Sequence (Paused at CAPTCHA)';
            resultContent.innerHTML = `
              <div class="ps-captcha-alert-card">
                <div style="display:flex;align-items:center;gap:6px;font-weight:700;color:#fbbf24;font-size:12px;">
                  <span>⚠️</span> <span>CAPTCHA Challenge Detected</span>
                </div>
                <p style="font-size:11px;color:#cbd5e1;line-height:1.4;">
                  Form auto-fill was <strong>paused for security reasons</strong>. CAPTCHA fields are skipped to preserve anti-bot protections. Please solve the CAPTCHA manually on the page, then click below to resume remaining actions.
                </p>
                <button class="ps-resume-btn" id="ps-captcha-resume-btn">
                  <span>Resume Actions (${remainingActions.length} remaining)</span>
                  <svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            `;

            const resumeBtn = document.getElementById('ps-captcha-resume-btn');
            if (resumeBtn) {
              resumeBtn.addEventListener('click', async () => {
                resumeBtn.disabled = true;
                resumeBtn.innerHTML = `<span>Resuming Remaining Actions...</span>`;
                const resumedResults = await actionExecutor.executeActions(remainingActions);
                resultContent.innerHTML = `
                  <div style="color:#34d399;font-weight:600;font-size:12px;display:flex;flex-direction:column;gap:6px;">
                    <div>✔ CAPTCHA verified manually and remaining actions (${resumedResults.length}) executed successfully!</div>
                    <div style="font-size:11px;color:#94a3b8;">Form submission completed.</div>
                  </div>
                `;
              });
            }
          }
        });

        instrumentation.endStage('action_execution_dom', { resultsCount: execResults.length });

        if (!isPausedForCaptcha) {
          resultContent.innerHTML += `
            <div style="margin-top:8px;color:#34d399;font-weight:600;">✔ Actions executed with distinct local profile data safely injected!</div>
          `;
        }
      } else {
        // Plain conversational answer / summary
        resultTitle.textContent = 'Agent Response';
        resultContent.innerHTML = `<div style="white-space:pre-wrap;">${agentData.text || agentData.response || JSON.stringify(agentData)}</div>`;
      }

      // Complete Session
      const completedSession = instrumentation.endSession();
      renderTelemetryUI(completedSession, faceDetector.getStatus(), decision);
    } catch (err) {
      console.error('[PrivacyShield] Task submission error:', err);
      resultTitle.textContent = 'Error';
      resultContent.innerHTML = `
        <div style="color:#ef4444;">${err.message}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px;">
          Make sure your local proxy server is running at <code>http://localhost:3001</code> with a valid API key in <code>server/.env</code>.
        </div>
      `;
    } finally {
      goBtn.disabled = false;
      goBtn.innerHTML = `<span>Go</span> <svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    }
  }

  /**
   * Restores original DOM content when requested.
   */
  function onRestorePage() {
    domRedactor.restorePageDOM();
    pipelineState.isRedacted = false;
    updateProgress(0, 'Page Restored to Original', 'badge-dom');
    document.getElementById('ps-stats-grid').style.display = 'none';
  }

  // Message listener for popup & background triggers
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'ACTIVATE_SHIELD' || message.action === 'TRIGGER_SCAN') {
        injectUI();
        onOneButtonClick();
        sendResponse({ success: true, activated: true });
      } else if (message.action === 'PING') {
        sendResponse({ pong: true, injected: true });
      }
      return true;
    });
  }

  // Export global handles
  if (typeof window !== 'undefined') {
    window.__PRIVACY_SHIELD_INJECT_UI__ = injectUI;
    window.__PRIVACY_SHIELD_SCAN__ = onOneButtonClick;
  }

  // Initialize UI on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI, { once: true });
  } else {
    injectUI();
  }
  window.addEventListener('load', injectUI, { once: true });

  // Persistent anchor: Re-inject if SPA frameworks (React, Angular, Vue, Canva, etc.) wipe the host container
  try {
    const observer = new MutationObserver(() => {
      if (!document.getElementById('privacyshield-root')) {
        injectUI();
      }
    });
    const obsTarget = document.body || document.documentElement;
    if (obsTarget) {
      observer.observe(obsTarget, { childList: true });
    }
  } catch (obsErr) {
    // ignore
  }
})();
