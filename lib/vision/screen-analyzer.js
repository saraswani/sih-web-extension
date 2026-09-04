/**
 * PrivacyShield - Local Screen-Understanding & UI Structure Model (Component 1)
 * Hybrid Vision + DOM Accessibility Tree Engine.
 * Extracts structured UI regions, semantic labels, viewport bounding boxes, confidence scores,
 * and generates a topological screen structure fingerprint.
 */
(function() {
  'use strict';

  class ScreenUnderstandingModel {
    constructor() {
      this.lastScreenFingerprint = null;
      this.lastAnalysis = null;
    }

    /**
     * Helper to compute a unique and reproducible CSS selector for a DOM element.
     */
    getElementSelector(el) {
      if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
      if (el.id) return `#${el.id}`;

      // Check name attribute for form fields
      if (el.name) {
        const tag = el.tagName.toLowerCase();
        return `${tag}[name="${el.name}"]`;
      }

      // Check unique placeholder or aria-label
      if (el.getAttribute('placeholder')) {
        return `${el.tagName.toLowerCase()}[placeholder="${el.getAttribute('placeholder')}"]`;
      }
      if (el.getAttribute('aria-label')) {
        return `${el.tagName.toLowerCase()}[aria-label="${el.getAttribute('aria-label')}"]`;
      }

      // Path based selector
      const path = [];
      let current = el;
      while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
        let selector = current.tagName.toLowerCase();
        let sibling = current;
        let nth = 1;
        while (sibling.previousElementSibling) {
          sibling = sibling.previousElementSibling;
          if (sibling.tagName === current.tagName) nth++;
        }
        if (nth > 1) {
          selector += `:nth-of-type(${nth})`;
        }
        path.unshift(selector);
        current = current.parentElement;
      }
      return path.join(' > ') || el.tagName.toLowerCase();
    }

    /**
     * Extracts readable human semantic label for a UI element.
     */
    getElementLabel(el) {
      if (!el) return '';

      // 1. Check aria-label / aria-labelledby
      if (el.getAttribute('aria-label')) {
        return el.getAttribute('aria-label').trim();
      }
      if (el.getAttribute('aria-labelledby')) {
        const labelEl = document.getElementById(el.getAttribute('aria-labelledby'));
        if (labelEl) return labelEl.innerText.trim();
      }

      // 2. Check HTML <label for="id">
      if (el.id) {
        const labelEl = document.querySelector(`label[for="${el.id}"]`);
        if (labelEl) return labelEl.innerText.trim();
      }

      // 3. Check enclosing <label>
      const parentLabel = el.closest('label');
      if (parentLabel) {
        return parentLabel.innerText.trim();
      }

      // 4. Check placeholder or name or title
      if (el.getAttribute('placeholder')) return el.getAttribute('placeholder').trim();
      if (el.getAttribute('title')) return el.getAttribute('title').trim();

      // 5. Check text content for buttons / links / headings
      const tag = el.tagName.toLowerCase();
      if (['button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'summary'].includes(tag)) {
        return el.innerText.trim().slice(0, 60);
      }

      // 6. Check nearby preceding sibling text (e.g. standard form label before input)
      if (el.previousElementSibling && ['LABEL', 'SPAN', 'P'].includes(el.previousElementSibling.tagName)) {
        return el.previousElementSibling.innerText.trim().slice(0, 50);
      }

      return el.name || el.id || tag;
    }

    /**
     * Checks if an element is associated with CAPTCHA challenges.
     */
    isCaptchaElement(el, label = '') {
      if (!el) return false;
      const combined = `${label} ${el.name || ''} ${el.id || ''} ${el.getAttribute('placeholder') || ''} ${el.className || ''}`.toLowerCase();
      
      // Direct keyword matches
      if (
        combined.includes('captcha') ||
        combined.includes('recaptcha') ||
        combined.includes('hcaptcha') ||
        combined.includes('turnstile') ||
        combined.includes('case sensitive') ||
        combined.includes('characters displayed') ||
        combined.includes('security code') ||
        combined.includes('verification code') ||
        combined.includes('code shown') ||
        combined.includes('image code') ||
        combined.includes('bot detection')
      ) {
        return true;
      }

      // Check surrounding DOM context (e.g. adjacent <img> with captcha in alt/src or nearby text)
      try {
        const parent = el.closest('.form-group, .form-row, td, div, form');
        if (parent) {
          const parentText = parent.innerText.toLowerCase();
          if (
            parentText.includes('captcha') ||
            parentText.includes('case sensitive') ||
            parentText.includes('characters displayed') ||
            parentText.includes('characters below')
          ) {
            return true;
          }
          const captchaImg = parent.querySelector('img[src*="captcha" i], img[alt*="captcha" i], img[id*="captcha" i], img[class*="captcha" i]');
          if (captchaImg) return true;
        }
      } catch (e) {
        // ignore
      }

      return false;
    }

    /**
     * Accurately infers distinct semantic field types (name, email, phone, aadhaar, pan, address, feedback, etc.)
     */
    inferSemanticFieldType(el, label = '') {
      if (!el) return 'unknown';

      // 1. CAPTCHA Check (Highest Priority)
      if (this.isCaptchaElement(el, label)) {
        return 'captcha';
      }

      const tag = el.tagName.toLowerCase();
      const type = (el.type || '').toLowerCase();
      const autocomplete = (el.getAttribute('autocomplete') || '').toLowerCase();
      const combined = `${label} ${el.name || ''} ${el.id || ''} ${el.getAttribute('placeholder') || ''} ${autocomplete}`.toLowerCase();

      // 2. Select Dropdowns
      if (tag === 'select') {
        if (combined.includes('gender') || combined.includes('sex')) return 'gender';
        if (combined.includes('state') || combined.includes('province') || combined.includes('region')) return 'state';
        if (combined.includes('city') || combined.includes('district') || combined.includes('town')) return 'city';
        if (combined.includes('country') || combined.includes('nation')) return 'country';
        if (combined.includes('category') || combined.includes('topic') || combined.includes('feedback_type') || combined.includes('type') || combined.includes('department')) return 'category';
        return 'dropdown';
      }

      // 3. Textareas
      if (tag === 'textarea') {
        return 'feedback';
      }

      // 4. HTML5 Input Types
      if (type === 'email' || autocomplete === 'email') return 'email';
      if (type === 'tel' || autocomplete === 'tel') return 'phone';
      if (type === 'date') return 'dob';
      if (type === 'password') return 'password';

      // 5. Semantic keyword inspection
      if (combined.includes('email') || combined.includes('e-mail') || combined.includes('mail_id')) return 'email';
      if (combined.includes('phone') || combined.includes('mobile') || combined.includes('contact') || combined.includes('cell') || combined.includes('whatsapp')) return 'phone';
      if (combined.includes('aadhaar') || combined.includes('aadhar') || combined.includes('uid') || combined.includes('uidai')) return 'aadhaar';
      if (combined.includes('pan') || combined.includes('pancard') || combined.includes('pan_no')) return 'pan';
      
      // Names
      if (combined.includes('first') || combined.includes('fname') || autocomplete === 'given-name') return 'first_name';
      if (combined.includes('last') || combined.includes('lname') || combined.includes('surname') || autocomplete === 'family-name') return 'last_name';
      if (combined.includes('fullname') || combined.includes('full_name') || combined.includes('user_name') || combined.includes('name') || combined.includes('candidate') || combined.includes('applicant')) return 'name';

      // Address & Location
      if (combined.includes('addr') || combined.includes('street') || combined.includes('flat') || combined.includes('building') || combined.includes('residence') || combined.includes('line1') || combined.includes('line2')) return 'address';
      if (combined.includes('city') || combined.includes('district') || combined.includes('town') || autocomplete === 'address-level2') return 'city';
      if (combined.includes('state') || combined.includes('province') || autocomplete === 'address-level1') return 'state';
      if (combined.includes('pin') || combined.includes('zip') || combined.includes('postal') || autocomplete === 'postal-code') return 'pincode';
      if (combined.includes('country') || combined.includes('nation') || autocomplete === 'country') return 'country';

      // Feedback & Messages
      if (combined.includes('feedback') || combined.includes('comment') || combined.includes('message') || combined.includes('query') || combined.includes('desc') || combined.includes('remark') || combined.includes('review') || combined.includes('suggestion')) return 'feedback';

      return 'text';
    }

    /**
     * Determines whether an element is visible in the current viewport.
     */
    isElementVisible(el, rect) {
      if (!rect || rect.width <= 0 || rect.height <= 0) return false;
      if (el.offsetParent === null && el.tagName !== 'BODY') return false;

      const style = window.getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none' || parseFloat(style.opacity) === 0) {
        return false;
      }

      const vw = window.innerWidth || document.documentElement.clientWidth;
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // Check if partially inside viewport
      return (
        rect.top < vh &&
        rect.bottom > 0 &&
        rect.left < vw &&
        rect.right > 0
      );
    }

    /**
     * Analyzes the entire on-screen viewport and produces structured UI regions.
     * @returns {Object} Structured screen description JSON
     */
    analyzeScreen() {
      const startTime = performance.now();
      const elements = [];
      let elementIdCounter = 1;

      // Track distribution for page classification and fingerprinting
      const counts = {
        inputs: 0,
        buttons: 0,
        forms: 0,
        images: 0,
        headings: 0,
        tables: 0,
        textBlocks: 0,
        navigation: 0
      };

      // 1. Detect Form Inputs (excluding button inputs)
      const inputEls = document.querySelectorAll('input, select, textarea');
      inputEls.forEach((el) => {
        // Skip hidden types, buttons, and privacy shield panel elements
        const buttonTypes = ['submit', 'button', 'reset', 'image'];
        if (el.type === 'hidden' || buttonTypes.includes(el.type) || el.closest('#privacyshield-root')) return;

        const rect = el.getBoundingClientRect();
        if (!this.isElementVisible(el, rect)) return;

        const tag = el.tagName.toLowerCase();
        let type = 'input_text';
        let confidence = 0.96;

        if (tag === 'select') type = 'select_dropdown';
        else if (tag === 'textarea') type = 'textarea';
        else if (el.type === 'password') type = 'input_password';
        else if (el.type === 'email') type = 'input_email';
        else if (el.type === 'checkbox') type = 'input_checkbox';
        else if (el.type === 'radio') type = 'input_radio';
        else if (el.type === 'number') type = 'input_number';
        else if (el.type === 'date') type = 'input_date';

        const label = this.getElementLabel(el);
        const fieldType = this.inferSemanticFieldType(el, label);
        const isCaptcha = (fieldType === 'captcha');

        counts.inputs++;

        elements.push({
          id: `elem_${elementIdCounter++}`,
          type: type,
          role: el.getAttribute('role') || tag,
          label: label,
          fieldType: fieldType,
          semanticType: fieldType,
          isCaptcha: isCaptcha,
          bbox: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)],
          selector: this.getElementSelector(el),
          confidence: confidence,
          interactable: true,
          value: el.type === 'password' ? '••••••••' : (el.value ? el.value.slice(0, 30) : '')
        });
      });

      // 2. Detect Buttons & Interactive Action Triggers
      const buttonEls = document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"], a.btn, a.button');
      buttonEls.forEach((el) => {
        if (el.closest('#privacyshield-root')) return;

        const rect = el.getBoundingClientRect();
        if (!this.isElementVisible(el, rect)) return;

        counts.buttons++;
        elements.push({
          id: `elem_${elementIdCounter++}`,
          type: 'button',
          role: 'button',
          label: this.getElementLabel(el) || 'Submit / Action',
          bbox: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)],
          selector: this.getElementSelector(el),
          confidence: 0.94,
          interactable: true
        });
      });

      // 3. Detect Forms & Semantic Containers
      const formEls = document.querySelectorAll('form, [role="form"]');
      formEls.forEach((el) => {
        if (el.closest('#privacyshield-root')) return;

        const rect = el.getBoundingClientRect();
        if (!this.isElementVisible(el, rect)) return;

        counts.forms++;
        elements.push({
          id: `elem_${elementIdCounter++}`,
          type: 'form_container',
          role: 'form',
          label: el.getAttribute('aria-label') || el.name || el.id || 'Web Form',
          bbox: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)],
          selector: this.getElementSelector(el),
          confidence: 0.90,
          interactable: false
        });
      });

      // 4. Detect Images & Visual Media
      const imageEls = document.querySelectorAll('img, svg, canvas, [role="img"]');
      imageEls.forEach((el) => {
        if (el.closest('#privacyshield-root')) return;

        const rect = el.getBoundingClientRect();
        if (!this.isElementVisible(el, rect)) return;
        // Ignore tiny icon images
        if (rect.width < 24 || rect.height < 24) return;

        counts.images++;
        elements.push({
          id: `elem_${elementIdCounter++}`,
          type: 'image_media',
          role: 'image',
          label: el.alt || el.getAttribute('aria-label') || el.title || 'Image Content',
          bbox: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)],
          selector: this.getElementSelector(el),
          confidence: 0.92,
          interactable: false,
          src: (el.src || '').slice(0, 120)
        });
      });

      // 5. Detect Headings & Key Typography
      const headingEls = document.querySelectorAll('h1, h2, h3, [role="heading"]');
      headingEls.forEach((el) => {
        if (el.closest('#privacyshield-root')) return;

        const rect = el.getBoundingClientRect();
        if (!this.isElementVisible(el, rect)) return;

        counts.headings++;
        elements.push({
          id: `elem_${elementIdCounter++}`,
          type: 'heading',
          role: 'heading',
          label: el.innerText.trim().slice(0, 80),
          bbox: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)],
          selector: this.getElementSelector(el),
          confidence: 0.88,
          interactable: false
        });
      });

      // 6. Detect Tables & Data Grids
      const tableEls = document.querySelectorAll('table, [role="table"], [role="grid"]');
      tableEls.forEach((el) => {
        if (el.closest('#privacyshield-root')) return;

        const rect = el.getBoundingClientRect();
        if (!this.isElementVisible(el, rect)) return;

        counts.tables++;
        elements.push({
          id: `elem_${elementIdCounter++}`,
          type: 'table_grid',
          role: 'table',
          label: el.getAttribute('aria-label') || 'Data Table',
          bbox: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)],
          selector: this.getElementSelector(el),
          confidence: 0.89,
          interactable: false
        });
      });

      // 7. Detect Navigation Bars
      const navEls = document.querySelectorAll('nav, [role="navigation"]');
      navEls.forEach((el) => {
        if (el.closest('#privacyshield-root')) return;

        const rect = el.getBoundingClientRect();
        if (!this.isElementVisible(el, rect)) return;

        counts.navigation++;
        elements.push({
          id: `elem_${elementIdCounter++}`,
          type: 'navigation',
          role: 'navigation',
          label: el.getAttribute('aria-label') || 'Navigation Bar',
          bbox: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)],
          selector: this.getElementSelector(el),
          confidence: 0.86,
          interactable: true
        });
      });

      // 8. Compute Screen Structure Fingerprint (Topology Hash)
      const fingerprint = this.computeFingerprint(elements, counts);
      const isChanged = (this.lastScreenFingerprint !== fingerprint);
      this.lastScreenFingerprint = fingerprint;

      const durationMs = performance.now() - startTime;

      const result = {
        elements: elements,
        totalElements: elements.length,
        interactableCount: counts.inputs + counts.buttons,
        summaryCounts: counts,
        viewport: {
          width: window.innerWidth || document.documentElement.clientWidth,
          height: window.innerHeight || document.documentElement.clientHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY
        },
        fingerprint: fingerprint,
        isStateChanged: isChanged,
        durationMs: Math.round(durationMs * 100) / 100
      };

      this.lastAnalysis = result;
      return result;
    }

    /**
     * Computes a deterministic structural fingerprint for the current screen state.
     */
    computeFingerprint(elements, counts) {
      const parts = [
        `i:${counts.inputs}`,
        `b:${counts.buttons}`,
        `f:${counts.forms}`,
        `img:${counts.images}`,
        `h:${counts.headings}`,
        `t:${counts.tables}`
      ];

      // Sample first 8 elements' types & coordinates
      const sample = elements.slice(0, 8).map(e => `${e.type}@${e.bbox[0]},${e.bbox[1]}`).join('|');
      parts.push(sample);

      // Simple fast hash
      const raw = parts.join(';');
      let hash = 0;
      for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
      }
      return `SF_${Math.abs(hash).toString(16)}`;
    }
  }

  const screenAnalyzerInstance = new ScreenUnderstandingModel();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ScreenUnderstandingModel,
      screenAnalyzer: screenAnalyzerInstance
    };
  } else if (typeof window !== 'undefined') {
    window.ScreenUnderstandingModel = ScreenUnderstandingModel;
    window.screenAnalyzer = screenAnalyzerInstance;
  }
})();
