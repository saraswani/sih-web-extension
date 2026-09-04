/**
 * PrivacyShield - Performance & Telemetry Instrumentation Engine
 * Precision latency tracking (performance.now()), memory delta snapshots (performance.memory),
 * and centralized diagnostic health reporting across all local AI/vision modules.
 */
(function() {
  'use strict';

  class InstrumentationTracker {
    constructor() {
      this.sessions = [];
      this.currentSession = null;
      this.latencyHistory = []; // rolling last 10 scans
      this.loadLatencyHistory();
    }

    /**
     * Loads rolling latency history from storage.
     */
    async loadLatencyHistory() {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
          const res = await new Promise(r => chrome.storage.local.get(['latencyHistory'], r));
          if (Array.isArray(res?.latencyHistory)) {
            this.latencyHistory = res.latencyHistory.slice(-10);
          }
        } catch (e) {
          // ignore
        }
      }
    }

    /**
     * Starts a new pipeline telemetry session.
     */
    startSession(sessionName = 'scan_and_execute') {
      const memBefore = this.getMemorySnapshot();
      this.currentSession = {
        name: sessionName,
        startTimestamp: Date.now(),
        startPerf: performance.now(),
        endPerf: 0,
        totalDurationMs: 0,
        stages: {},
        memory: {
          startBytes: memBefore,
          endBytes: 0,
          deltaBytes: 0
        },
        metadata: {}
      };
      return this.currentSession;
    }

    /**
     * Records the start of a specific stage.
     */
    startStage(stageKey) {
      if (!this.currentSession) return;
      this.currentSession.stages[stageKey] = {
        key: stageKey,
        start: performance.now(),
        end: 0,
        durationMs: 0,
        memBefore: this.getMemorySnapshot()
      };
    }

    /**
     * Records the completion of a specific stage.
     */
    endStage(stageKey, extraData = {}) {
      if (!this.currentSession || !this.currentSession.stages[stageKey]) return;
      const stage = this.currentSession.stages[stageKey];
      stage.end = performance.now();
      stage.durationMs = Math.max(0.1, Math.round((stage.end - stage.start) * 100) / 100);
      stage.memAfter = this.getMemorySnapshot();
      stage.memDeltaBytes = stage.memAfter - stage.memBefore;
      stage.data = extraData;
      return stage;
    }

    /**
     * Finalizes the current telemetry session and computes latency waterfall.
     */
    endSession(metadata = {}) {
      if (!this.currentSession) return null;
      this.currentSession.endPerf = performance.now();
      this.currentSession.totalDurationMs = Math.round((this.currentSession.endPerf - this.currentSession.startPerf) * 100) / 100;

      const memAfter = this.getMemorySnapshot();
      this.currentSession.memory.endBytes = memAfter;
      this.currentSession.memory.deltaBytes = memAfter - this.currentSession.memory.startBytes;
      this.currentSession.metadata = metadata;

      // Compute percentage shares
      for (const key in this.currentSession.stages) {
        const stage = this.currentSession.stages[key];
        stage.percentShare = Math.round((stage.durationMs / (this.currentSession.totalDurationMs || 1)) * 1000) / 10;
      }

      // Record to rolling latency history
      if (this.currentSession.totalDurationMs > 0) {
        this.latencyHistory.push(this.currentSession.totalDurationMs);
        if (this.latencyHistory.length > 10) this.latencyHistory.shift();

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          try {
            chrome.storage.local.set({ latencyHistory: this.latencyHistory });
          } catch (e) {
            // ignore
          }
        }
      }

      const completed = { ...this.currentSession };
      this.sessions.unshift(completed);
      if (this.sessions.length > 20) this.sessions.pop();
      this.currentSession = null;

      return completed;
    }

    /**
     * Computes rolling average latency across the last 10 scans.
     */
    getLatencyMetrics() {
      const history = this.latencyHistory.length > 0 ? this.latencyHistory : [this.sessions[0]?.totalDurationMs || 0];
      const valid = history.filter(v => typeof v === 'number' && v > 0);
      const sum = valid.reduce((acc, v) => acc + v, 0);
      const avg = valid.length > 0 ? Math.round((sum / valid.length) * 10) / 10 : 0;
      const latest = valid.length > 0 ? valid[valid.length - 1] : 0;

      return {
        latestDurationMs: latest,
        rollingAvgDurationMs: avg,
        sampleCount: valid.length,
        history: [...valid]
      };
    }

    /**
     * Appends redaction audit log entries to local-only device storage.
     * ZERO raw sensitive text is ever stored or transmitted.
     * @param {Array} entities - [{ token, category, confidence, verificationMethod }]
     * @param {string} url - Hostpage URL
     */
    async logRedactionAuditEvents(entities = [], url = '') {
      if (!Array.isArray(entities) || entities.length === 0) return;
      const cleanUrl = url || (typeof window !== 'undefined' ? window.location.hostname || window.location.href : 'local');

      const auditEntries = entities.map(e => ({
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: Date.now(),
        url: cleanUrl.replace(/[\?#].*$/, ''), // strip query params for extra safety
        category: e.category || 'PII Entity',
        token: e.token || '[REDACTED]',
        confidence: Math.round((e.confidence || 0.95) * 100),
        verificationMethod: e.verificationMethod || 'Checksum / Regex Validation',
        deviceOnly: true
      }));

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
          chrome.storage.local.get(['localRedactionAuditLog'], (result) => {
            const existing = Array.isArray(result?.localRedactionAuditLog) ? result.localRedactionAuditLog : [];
            const updated = [...auditEntries, ...existing].slice(0, 150); // FIFO cap 150 items
            chrome.storage.local.set({ localRedactionAuditLog: updated });
          });
        } catch (e) {
          console.warn('[PrivacyShield Telemetry] Failed to write local audit log:', e);
        }
      }
    }

    /**
     * Captures current JS heap usage in bytes (supported on Chromium).
     */
    getMemorySnapshot() {
      if (typeof performance !== 'undefined' && performance.memory && performance.memory.usedJSHeapSize) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    }

    /**
     * Formats bytes into human readable KB/MB string.
     */
    formatBytes(bytes) {
      if (!bytes || bytes === 0) return 'N/A';
      if (Math.abs(bytes) < 1024) return `${bytes} B`;
      if (Math.abs(bytes) < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    /**
     * Compiles complete diagnostic report of all active models and hardware acceleration.
     */
    getSystemDiagnostics() {
      const faceStatus = (typeof window !== 'undefined' && window.faceDetector) ? window.faceDetector.getStatus() : { status: 'offline', activeBackend: 'None' };

      let hwBackend = 'CPU / JavaScript Runtime';
      if (typeof navigator !== 'undefined' && navigator.gpu) {
        hwBackend = 'WebGPU (Hardware Accelerated)';
      } else if (typeof WebAssembly !== 'undefined') {
        hwBackend = 'WASM (WebAssembly SIMD)';
      }

      const latency = this.getLatencyMetrics();

      return {
        timestamp: Date.now(),
        hardwareProvider: hwBackend,
        faceDetectorStatus: faceStatus.status,
        faceDetectorBackend: faceStatus.activeBackend,
        faceTotalDetections: faceStatus.totalDetections || 0,
        memoryUsed: this.formatBytes(this.getMemorySnapshot()),
        memoryRawBytes: this.getMemorySnapshot(),
        latestLatencyMs: latency.latestDurationMs,
        rollingAvgLatencyMs: latency.rollingAvgDurationMs,
        lastSession: this.sessions[0] || null
      };
    }
  }

  const instrumentationInstance = new InstrumentationTracker();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      InstrumentationTracker,
      instrumentation: instrumentationInstance
    };
  } else if (typeof window !== 'undefined') {
    window.InstrumentationTracker = InstrumentationTracker;
    window.instrumentation = instrumentationInstance;
  }
})();
