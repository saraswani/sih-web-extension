/**
 * PrivacyShield - In-Place Reversible DOM Redaction Engine (Component 5)
 * Traverses visible DOM text nodes with TreeWalker, redacts PII in-place with styled badges,
 * and maintains in-memory token maps with instantaneous "Restore Page" and "Reveal Original" toggles.
 */
(function() {
  'use strict';

  const textDetector = (typeof window !== 'undefined' && window.textPIIDetector) || (typeof require !== 'undefined' ? require('../pii/text-detector').detector : null);

  class DOMRedactor {
    constructor() {
      this.mutatedElements = []; // [{ element, originalHTML, originalText, spans, tokens }]
      this.faceOverlays = []; // [{ overlay, face }] - Injected face blur overlay elements
      this.redactedNodeRects = []; // Bounding boxes for screenshot pixel masking
      this.isRedacted = false;
      this.revealedTokens = new Set();
    }

    /**
     * Resets redactor state and cleans tracking arrays.
     */
    reset() {
      this.clearDOMFaceOverlays();
      this.mutatedElements = [];
      this.redactedNodeRects = [];
      this.isRedacted = false;
      this.revealedTokens.clear();
    }

    /**
     * Filters out non-content or internal extension DOM subtrees.
     */
    shouldSkipElement(el) {
      if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
      const tag = el.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'textarea', 'iframe', 'svg', 'canvas'].includes(tag)) {
        return true;
      }
      if (el.id === 'privacyshield-root' || el.closest('#privacyshield-root')) {
        return true;
      }
      if (el.classList && el.classList.contains('ps-injected')) {
        return true;
      }
      return false;
    }

    /**
     * Scans all visible text nodes in the DOM, redacts sensitive entities,
     * and injects subtle interactive privacy badges with reveal tooltips.
     * @returns {Object} Redaction summary { totalRedacted, tokens, boundingBoxes }
     */
    redactPageDOM() {
      const startTime = performance.now();
      this.reset();

      if (!textDetector) {
        console.error('[PrivacyShield] TextPIIDetector not initialized.');
        return { totalRedacted: 0, durationMs: 0 };
      }

      // Collect eligible text nodes using TreeWalker
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent || this.shouldSkipElement(parent)) {
              return NodeFilter.FILTER_REJECT;
            }
            if (!node.nodeValue || node.nodeValue.trim().length === 0) {
              return NodeFilter.FILTER_SKIP;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes = [];
      let currentNode;
      while ((currentNode = walker.nextNode())) {
        textNodes.push(currentNode);
      }

      let totalRedacted = 0;
      const allTokens = [];
      const allEntities = [];

      for (const textNode of textNodes) {
        const rawText = textNode.nodeValue;
        const result = textDetector.detectAndSanitize(rawText);

        if (result.detectedSpans.length > 0) {
          totalRedacted += result.detectedSpans.length;
          const parent = textNode.parentElement;

          // Save mutation state for lossless restoration
          this.mutatedElements.push({
            parent: parent,
            textNode: textNode,
            originalText: rawText,
            spans: result.detectedSpans
          });

          // Replace text node content with sanitized token spans
          const fragment = document.createDocumentFragment();
          let lastIdx = 0;

          for (const span of result.detectedSpans) {
            allTokens.push(span.token);
            const confPct = Math.round((span.confidence || 0.95) * 100);
            allEntities.push({
              token: span.token,
              category: span.category,
              prefix: span.prefix,
              ruleId: span.ruleId,
              confidence: span.confidence || 0.95,
              confidencePercent: confPct,
              verificationMethod: span.verificationMethod || 'Checksum / Regex Check'
            });

            // Preceding text
            if (span.start > lastIdx) {
              fragment.appendChild(document.createTextNode(rawText.substring(lastIdx, span.start)));
            }

            // Create interactive redacted badge
            const badge = document.createElement('span');
            badge.className = 'ps-redacted-badge';
            badge.setAttribute('data-token', span.token);
            badge.setAttribute('data-category', span.prefix);
            badge.setAttribute('data-confidence', `${confPct}%`);
            badge.setAttribute('title', `PrivacyShield: ${span.category} Masked (${confPct}% Confidence: ${span.verificationMethod}) - Click to Reveal`);
            badge.textContent = span.token;

            // Inline badge styling for robust encapsulation
            badge.style.cssText = `
              background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
              color: #38bdf8;
              border: 1px solid #0284c7;
              border-radius: 4px;
              padding: 1px 5px;
              font-family: ui-monospace, monospace;
              font-size: 0.88em;
              font-weight: 600;
              letter-spacing: 0.03em;
              cursor: pointer;
              box-shadow: 0 0 8px rgba(2, 132, 199, 0.25);
              transition: all 0.2s ease;
              display: inline-block;
              user-select: all;
            `;

            // Click-to-reveal toggle event
            badge.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              this.toggleRevealBadge(badge, span.token, span.text);
            });

            fragment.appendChild(badge);
            lastIdx = span.end;
          }

          // Trailing text
          if (lastIdx < rawText.length) {
            fragment.appendChild(document.createTextNode(rawText.substring(lastIdx)));
          }

          // Swap text node with fragment in live DOM
          parent.replaceChild(fragment, textNode);

          // Record bounding rect of the redacted region for canvas synchronization
          const parentRect = parent.getBoundingClientRect();
          this.redactedNodeRects.push({
            x: Math.round(parentRect.left + window.scrollX),
            y: Math.round(parentRect.top + window.scrollY),
            width: Math.round(parentRect.width),
            height: Math.round(parentRect.height),
            tokens: result.detectedSpans.map(s => s.token)
          });
        }
      }

      // Log to local on-device audit ring buffer (zero raw PII)
      if (typeof window !== 'undefined' && window.instrumentation && allEntities.length > 0) {
        window.instrumentation.logRedactionAuditEvents(allEntities, window.location.href);
      }

      this.isRedacted = true;
      const durationMs = performance.now() - startTime;
      const categorySummary = this.getCategorySummary(allEntities);

      return {
        totalRedacted: totalRedacted,
        tokens: allTokens,
        entities: allEntities,
        categorySummary: categorySummary,
        mutatedCount: this.mutatedElements.length,
        boundingBoxes: this.redactedNodeRects,
        durationMs: Math.round(durationMs * 100) / 100
      };
    }

    /**
     * Generates a structured breakdown and human-readable summary of redacted categories and counts.
     * e.g. "Redacted: 2 Emails, 1 Aadhaar Number, 1 Phone Number"
     * @param {Array} entities
     * @returns {Object} { totalCount, categoryCounts, summaryString, formattedList }
     */
    getCategorySummary(entities = []) {
      if (!entities || entities.length === 0) {
        return {
          totalCount: 0,
          categoryCounts: {},
          summaryString: 'No sensitive entities detected on page.',
          formattedList: []
        };
      }

      // Deduplicate by token to get exact distinct entity count
      const uniqueEntities = [];
      const seenTokens = new Set();
      for (const ent of entities) {
        if (!seenTokens.has(ent.token)) {
          seenTokens.add(ent.token);
          uniqueEntities.push(ent);
        }
      }

      const categoryCounts = {};
      const categoryNames = {
        AADHAAR: 'Aadhaar UID',
        PAN: 'PAN Card',
        CARD: 'Payment Card',
        EMAIL: 'Email',
        PHONE: 'Phone Number',
        AWS_KEY: 'AWS Key',
        GITHUB_TOKEN: 'GitHub Token',
        GOOGLE_KEY: 'Google API Key',
        GENERIC_SECRET: 'API Secret',
        HIGH_ENTROPY: 'Secret Token',
        PASSPORT: 'Passport',
        DRIVING_LICENSE: 'Driving License',
        VOTER_ID: 'Voter ID'
      };

      for (const ent of uniqueEntities) {
        const catKey = ent.prefix || ent.category || 'PII';
        categoryCounts[catKey] = (categoryCounts[catKey] || 0) + 1;
      }

      const formattedList = [];
      const summaryParts = [];

      for (const [key, count] of Object.entries(categoryCounts)) {
        const readableName = categoryNames[key] || key;
        const pluralName = count === 1 ? readableName : (readableName.endsWith('s') ? `${readableName}es` : `${readableName}s`);
        summaryParts.push(`${count} ${pluralName.toLowerCase()}`);
        formattedList.push({
          categoryKey: key,
          label: readableName,
          count: count,
          text: `${count} ${pluralName}`
        });
      }

      const summaryString = `Redacted: ${summaryParts.join(', ')}`;

      return {
        totalCount: uniqueEntities.length,
        categoryCounts,
        summaryString,
        formattedList
      };
    }

    /**
     * Toggles reveal/mask for an individual redacted badge.
     */
    toggleRevealBadge(badge, token, originalText) {
      if (this.revealedTokens.has(token)) {
        // Re-mask
        this.revealedTokens.delete(token);
        badge.textContent = token;
        badge.style.color = '#38bdf8';
        badge.style.borderColor = '#0284c7';
        badge.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))';
      } else {
        // Reveal
        this.revealedTokens.add(token);
        badge.textContent = originalText;
        badge.style.color = '#f59e0b';
        badge.style.borderColor = '#f59e0b';
        badge.style.background = 'rgba(245, 158, 11, 0.15)';
      }
    }

    /**
     * Injects live DOM face blur overlays and photo badges over all detected face regions.
     * @param {Array} faceBoxes - [{ x, y, width, height, confidence, isHeuristic, element }]
     */
    redactDOMFaces(faceBoxes = []) {
      this.clearDOMFaceOverlays();

      if (!faceBoxes || faceBoxes.length === 0) return;

      for (const face of faceBoxes) {
        // Calculate padded bounding box around the detected face
        const padX = Math.round(face.width * 0.18);
        const padY = Math.round(face.height * 0.18);
        const fx = Math.max(0, face.x - padX);
        const fy = Math.max(0, face.y - padY);
        const fw = Math.round(face.width + padX * 2);
        const fh = Math.round(face.height + padY * 2);

        const overlay = document.createElement('div');
        overlay.className = 'ps-face-redact-overlay ps-injected';
        overlay.setAttribute('title', `PrivacyShield BlazeFace: Photo Detected (${Math.round((face.confidence || 0.9) * 100)}% Confidence) - Click to Toggle Blur`);

        const pageX = fx + window.scrollX;
        const pageY = fy + window.scrollY;

        overlay.style.cssText = `
          position: absolute !important;
          left: ${pageX}px !important;
          top: ${pageY}px !important;
          width: ${Math.max(70, fw)}px !important;
          height: ${Math.max(50, fh)}px !important;
          z-index: 2147483640 !important;
          backdrop-filter: blur(24px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
          background: rgba(15, 23, 42, 0.8) !important;
          border: 1.5px dashed #00f2fe !important;
          border-radius: 10px !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(0, 242, 254, 0.4) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.25s ease !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          user-select: none !important;
        `;

        const badge = document.createElement('div');
        badge.className = 'ps-face-badge-inner';
        badge.style.cssText = `
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)) !important;
          color: #38bdf8 !important;
          border: 1px solid #0284c7 !important;
          border-radius: 5px !important;
          padding: 3px 7px !important;
          font-family: ui-monospace, monospace, sans-serif !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          letter-spacing: 0.03em !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6) !important;
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
          white-space: nowrap !important;
          pointer-events: none !important;
        `;
        badge.innerHTML = `<span>📷</span> <span>[PHOTO / FACE REDACTED]</span>`;

        overlay.appendChild(badge);

        // Click to toggle reveal / re-blur
        let isRevealed = false;
        overlay.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          isRevealed = !isRevealed;
          if (isRevealed) {
            overlay.style.backdropFilter = 'none';
            overlay.style.webkitBackdropFilter = 'none';
            overlay.style.background = 'rgba(245, 158, 11, 0.15)';
            overlay.style.borderColor = '#f59e0b';
            badge.style.color = '#f59e0b';
            badge.style.borderColor = '#f59e0b';
            badge.innerHTML = `<span>👁️</span> <span>[ORIGINAL PHOTO REVEALED]</span>`;
          } else {
            overlay.style.backdropFilter = 'blur(24px) saturate(180%)';
            overlay.style.webkitBackdropFilter = 'blur(24px) saturate(180%)';
            overlay.style.background = 'rgba(15, 23, 42, 0.8)';
            overlay.style.borderColor = '#00f2fe';
            badge.style.color = '#38bdf8';
            badge.style.borderColor = '#0284c7';
            badge.innerHTML = `<span>📷</span> <span>[PHOTO / FACE REDACTED]</span>`;
          }
        });

        document.body.appendChild(overlay);
        this.faceOverlays.push(overlay);
      }
    }

    /**
     * Clears all active DOM face overlays.
     */
    clearDOMFaceOverlays() {
      if (this.faceOverlays && this.faceOverlays.length > 0) {
        for (const el of this.faceOverlays) {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }
      }
      this.faceOverlays = [];
    }

    /**
     * Completely restores the webpage DOM back to original unredacted text and images.
     */
    restorePageDOM() {
      if (!this.isRedacted && (!this.faceOverlays || this.faceOverlays.length === 0)) return;

      for (const item of this.mutatedElements) {
        // Find and replace badges in parent with original plain text
        if (item.parent && item.parent.isConnected) {
          const badges = item.parent.querySelectorAll('.ps-redacted-badge');
          if (badges.length > 0) {
            item.parent.innerText = item.originalText;
          }
        }
      }

      this.clearDOMFaceOverlays();
      this.reset();
    }
  }

  const domRedactorInstance = new DOMRedactor();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      DOMRedactor,
      domRedactor: domRedactorInstance
    };
  } else if (typeof window !== 'undefined') {
    window.DOMRedactor = DOMRedactor;
    window.domRedactor = domRedactorInstance;
  }
})();
