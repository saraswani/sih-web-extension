/**
 * PrivacyShield - Client-Side AI Action Executor
 * Executes UI actions (click, fill, scroll) on the real, live DOM with glowing visual feedback.
 * Safely substitutes form field values from the local mock user profile (zero server roundtrip of real PII).
 */
(function() {
  'use strict';

  const config = (typeof window !== 'undefined' && window.PrivacyShieldConfig) || (typeof require !== 'undefined' ? require('../../config') : null);

  class ActionExecutor {
    constructor() {
      this.isExecuting = false;
      this.actionHistory = [];
    }

    /**
     * Highlights an element with an animated glowing neon aura before performing an action.
     */
    async highlightElement(el, durationMs = 700) {
      if (!el || !el.getBoundingClientRect) return;

      const rect = el.getBoundingClientRect();
      const highlight = document.createElement('div');
      highlight.className = 'ps-action-highlight-overlay';
      highlight.style.cssText = `
        position: fixed;
        left: ${rect.left - 4}px;
        top: ${rect.top - 4}px;
        width: ${rect.width + 8}px;
        height: ${rect.height + 8}px;
        border: 2px solid #00f2fe;
        border-radius: 6px;
        background: rgba(0, 242, 254, 0.2);
        box-shadow: 0 0 20px #00f2fe, inset 0 0 10px #00f2fe;
        pointer-events: none;
        z-index: 2147483640;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        animation: ps-pulse-aura 0.7s infinite alternate;
      `;

      document.body.appendChild(highlight);

      return new Promise((resolve) => {
        setTimeout(() => {
          if (highlight.parentNode) {
            highlight.parentNode.removeChild(highlight);
          }
          resolve();
        }, durationMs);
      });
    }

    /**
     * Highlights a CAPTCHA challenge element in amber and presents a floating security notice.
     */
    async highlightCaptchaElement(el) {
      if (!el || !el.getBoundingClientRect) return;

      const rect = el.getBoundingClientRect();
      const overlay = document.createElement('div');
      overlay.className = 'ps-captcha-highlight-overlay';
      overlay.style.cssText = `
        position: fixed;
        left: ${rect.left - 4}px;
        top: ${rect.top - 4}px;
        width: ${rect.width + 8}px;
        height: ${rect.height + 8}px;
        border: 2px dashed #f59e0b;
        border-radius: 6px;
        background: rgba(245, 158, 11, 0.15);
        box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
        pointer-events: none;
        z-index: 2147483641;
      `;

      const tooltip = document.createElement('div');
      tooltip.className = 'ps-captcha-tooltip';
      tooltip.style.cssText = `
        position: fixed;
        left: ${Math.max(10, rect.left)}px;
        top: ${Math.max(10, rect.top - 36)}px;
        background: #1e293b;
        color: #fbbf24;
        border: 1px solid #f59e0b;
        border-radius: 6px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        z-index: 2147483642;
        pointer-events: none;
      `;
      tooltip.innerHTML = `⚠️ <span>Please complete this manually — CAPTCHA fields are skipped for security reasons.</span>`;

      document.body.appendChild(overlay);
      document.body.appendChild(tooltip);

      // Auto-remove overlay after 8 seconds
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
      }, 8000);
    }

    /**
     * Asynchronously loads the user's configured profile from chrome.storage.local.
     */
    async loadUserProfile() {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const stored = await new Promise((resolve) => {
            chrome.storage.local.get(['mockProfile'], (res) => resolve(res?.mockProfile));
          });
          if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
            return {
              name: stored.name || 'Aarav Sharma',
              first_name: stored.first_name || (stored.name ? stored.name.split(' ')[0] : 'Aarav'),
              last_name: stored.last_name || (stored.name ? stored.name.split(' ').slice(1).join(' ') : 'Sharma'),
              email: stored.email || 'aarav.sharma@example.com',
              phone: stored.phone || '+91 98765 43210',
              aadhaar: stored.aadhaar || '2345 6789 0123',
              pan: stored.pan || 'ABCDE1234F',
              address: stored.address || 'Flat 402, Lotus Heights, Outer Ring Road, Bengaluru',
              city: stored.city || 'Bengaluru',
              state: stored.state || 'Karnataka',
              pincode: stored.pincode || '560103',
              country: stored.country || 'India',
              gender: stored.gender || 'Male',
              dob: stored.dob || '1995-08-15',
              feedback: stored.feedback || 'The portal interface was intuitive and the form submission process was smooth.'
            };
          }
        }
      } catch (e) {
        console.warn('[PrivacyShield] Could not load profile from storage, using defaults:', e);
      }

      return {
        name: 'Aarav Sharma',
        first_name: 'Aarav',
        last_name: 'Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        aadhaar: '2345 6789 0123',
        pan: 'ABCDE1234F',
        address: 'Flat 402, Lotus Heights, Outer Ring Road, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        country: 'India',
        gender: 'Male',
        dob: '1995-08-15',
        feedback: 'The portal interface was intuitive and the form submission process was smooth.'
      };
    }

    /**
     * Resolves strictly appropriate local profile value for a given field type without touching server.
     * Prevents button label overrides, CAPTCHA fills, and cross-field value contamination.
     */
    resolveLocalProfileValue(fieldType, fallbackValue, targetEl, profile) {
      if (!profile) {
        profile = config?.MOCK_PROFILE || {
          name: 'Aarav Sharma',
          email: 'aarav.sharma@example.com',
          phone: '+91 98765 43210',
          aadhaar: '2345 6789 0123',
          pan: 'ABCDE1234F',
          address: 'Flat 402, Lotus Heights, Bengaluru'
        };
      }

      // Safety: Never fill buttons!
      if (targetEl) {
        const tag = targetEl.tagName.toLowerCase();
        const type = (targetEl.type || '').toLowerCase();
        if (tag === 'button' || ['submit', 'button', 'reset', 'image'].includes(type)) {
          console.warn('[PrivacyShield] Rejecting fill action on button element:', targetEl);
          return null;
        }
      }

      // Safety: Never fill CAPTCHA challenges!
      if (fieldType === 'captcha') {
        console.log('[PrivacyShield] Skipping auto-fill on CAPTCHA challenge.');
        return null;
      }

      const key = (fieldType || '').toLowerCase().replace(/[^a-z0-9_]/g, '');

      // 1. Specific Name Fields
      if (key === 'first_name' || key.includes('firstname') || key.includes('fname')) {
        return profile.first_name || (profile.name ? profile.name.split(' ')[0] : 'Aarav');
      }
      if (key === 'last_name' || key.includes('lastname') || key.includes('lname') || key.includes('surname')) {
        return profile.last_name || (profile.name ? profile.name.split(' ').slice(1).join(' ') : 'Sharma');
      }
      if (key === 'name' || key.includes('fullname') || key.includes('full_name') || key.includes('candidate') || key.includes('applicant')) {
        return profile.name || 'Aarav Sharma';
      }

      // 2. Contact Information
      if (key.includes('email') || key.includes('mail')) {
        return profile.email || 'aarav.sharma@example.com';
      }
      if (key.includes('phone') || key.includes('mobile') || key.includes('contact') || key.includes('cell') || key.includes('tel')) {
        return profile.phone || '+91 98765 43210';
      }

      // 3. Official Identification Numbers & Government Documents
      if (key.includes('aadhaar') || key.includes('aadhar') || key.includes('uid')) {
        return profile.aadhaar || '2345 6789 0123';
      }
      if (key.includes('pan')) {
        return profile.pan || 'ABCDE1234F';
      }
      if (key.includes('passport') || key.includes('govt') || key.includes('document') || key.includes('voter')) {
        return profile.passport || 'Z1234567';
      }
      if (key.includes('photo') || key.includes('image') || key.includes('avatar')) {
        return profile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';
      }
      if (key.includes('signature') || key.includes('sign')) {
        return profile.signature || profile.name || 'Aarav Sharma';
      }

      // 4. Geographic & Address Fields
      if (key.includes('addr') || key.includes('street') || key.includes('flat') || key.includes('residence')) {
        return profile.address || 'Flat 402, Lotus Heights, Outer Ring Road, Bengaluru';
      }
      if (key.includes('city') || key.includes('town') || key.includes('district')) {
        return profile.city || 'Bengaluru';
      }
      if (key.includes('state') || key.includes('province') || key.includes('region')) {
        return profile.state || 'Karnataka';
      }
      if (key.includes('pin') || key.includes('zip') || key.includes('postal')) {
        return profile.pincode || '560103';
      }
      if (key.includes('country') || key.includes('nation')) {
        return profile.country || 'India';
      }

      // 5. Demographics & Dates
      if (key.includes('gender') || key.includes('sex')) {
        return profile.gender || 'Male';
      }
      if (key.includes('dob') || key.includes('birth')) {
        return profile.dob || '1995-08-15';
      }

      // 6. Feedback, Comments, Messages, Queries (NEVER use user name)
      if (
        key.includes('feedback') ||
        key.includes('comment') ||
        key.includes('message') ||
        key.includes('query') ||
        key.includes('desc') ||
        key.includes('remark') ||
        key.includes('review') ||
        key.includes('suggestion') ||
        (targetEl && targetEl.tagName.toLowerCase() === 'textarea')
      ) {
        return profile.feedback || 'The portal interface was intuitive and the process was completed seamlessly.';
      }

      // 7. Dropdown Selection / Categories
      if (key.includes('category') || key.includes('topic') || key.includes('type') || key.includes('department')) {
        return fallbackValue || 'feedback';
      }

      // If fallback value was provided, use that; otherwise do not contaminate with name
      if (fallbackValue && typeof fallbackValue === 'string') {
        return fallbackValue;
      }

      // Return field from profile if key directly exists
      if (profile[key]) {
        return profile[key];
      }

      return '';
    }

    /**
     * Dispatches proper reactive input events so modern frameworks (React, Vue, Svelte) catch updates.
     */
    setNativeInputValue(el, value) {
      if (!el || value === null || value === undefined) return;

      const tag = el.tagName.toLowerCase();
      const type = (el.type || '').toLowerCase();

      // Guard: Never modify button labels
      if (tag === 'button' || ['submit', 'button', 'reset', 'image'].includes(type)) {
        return;
      }

      // Handle Select element
      if (tag === 'select') {
        let matchedOption = false;
        const valStr = String(value).toLowerCase();
        
        // Try matching option text or value
        for (let i = 0; i < el.options.length; i++) {
          const optText = (el.options[i].text || '').toLowerCase();
          const optVal = (el.options[i].value || '').toLowerCase();
          if ((optText && optText.includes(valStr)) || (optVal && optVal.includes(valStr))) {
            el.selectedIndex = i;
            matchedOption = true;
            break;
          }
        }

        // If no match, choose the first valid non-placeholder option
        if (!matchedOption && el.options.length > 1) {
          for (let i = 1; i < el.options.length; i++) {
            if (el.options[i].value && el.options[i].value !== '') {
              el.selectedIndex = i;
              matchedOption = true;
              break;
            }
          }
        }

        if (!matchedOption && el.options.length > 0) {
          el.selectedIndex = 0;
        }

        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      // Handle Checkbox / Radio
      if (type === 'checkbox' || type === 'radio') {
        el.checked = (value === true || value === 'true' || value === '1');
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      // Handle standard text inputs and textareas
      el.focus();
      const lastValue = el.value;
      el.value = value;

      // Call React / DOM tracker if present
      const tracker = el._valueTracker;
      if (tracker) {
        tracker.setValue(lastValue);
      }

      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.blur();
    }

    /**
     * Executes a single UI action.
     */
    async executeSingleAction(action, userProfile = null) {
      const { type, selector, fieldType, value, scrollY } = action;
      let targetEl = null;

      if (selector) {
        try {
          targetEl = document.querySelector(selector);
        } catch (e) {
          console.warn(`[PrivacyShield] Invalid selector: ${selector}`, e);
        }
      }

      if (!userProfile) {
        userProfile = await this.loadUserProfile();
      }

      // 1. FILL Action
      if (type === 'fill') {
        if (!targetEl) {
          if (fieldType && fieldType !== 'captcha') {
            targetEl = document.querySelector(`input[name*="${fieldType}" i], input[placeholder*="${fieldType}" i], textarea[name*="${fieldType}" i]`);
          }
        }

        if (targetEl) {
          // Check if element is a CAPTCHA challenge
          if (fieldType === 'captcha' || targetEl.name?.toLowerCase().includes('captcha') || targetEl.id?.toLowerCase().includes('captcha')) {
            await this.highlightCaptchaElement(targetEl);
            return {
              success: true,
              action: 'fill',
              isCaptchaSkipped: true,
              selector,
              message: 'CAPTCHA challenge skipped for security. Manual user completion required.'
            };
          }

          // Check if element is a button
          const tag = targetEl.tagName.toLowerCase();
          const btnTypes = ['submit', 'button', 'reset', 'image'];
          if (tag === 'button' || btnTypes.includes(targetEl.type)) {
            return { success: false, error: 'Cannot fill button element. Skipping invalid fill action.' };
          }

          await this.highlightElement(targetEl, 450);
          const safeValue = this.resolveLocalProfileValue(fieldType, value, targetEl, userProfile);
          if (safeValue !== null) {
            this.setNativeInputValue(targetEl, safeValue);
            return { success: true, action: 'fill', selector, fieldType, valueApplied: '••••••••' };
          } else {
            return { success: false, error: `No valid profile mapping for field: ${fieldType}` };
          }
        } else {
          return { success: false, error: `Target element not found for selector: ${selector}` };
        }
      }

      // 2. CLICK Action
      if (type === 'click') {
        if (targetEl) {
          await this.highlightElement(targetEl, 550);
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
          targetEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          targetEl.click();
          targetEl.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
          return { success: true, action: 'click', selector };
        } else {
          return { success: false, error: `Click target element not found: ${selector}` };
        }
      }

      // 3. SCROLL Action
      if (type === 'scroll') {
        const top = (scrollY !== undefined) ? scrollY : (targetEl ? targetEl.getBoundingClientRect().top + window.scrollY - 100 : 300);
        window.scrollTo({ top: top, behavior: 'smooth' });
        return { success: true, action: 'scroll', top };
      }

      return { success: false, error: `Unknown action type: ${type}` };
    }

    /**
     * Executes an array of actions sequentially, with optional CAPTCHA pause callback.
     * @param {Array} actions
     * @param {Object} [options={}] Callbacks and options
     * @returns {Promise<Array>} Results
     */
    async executeActions(actions, options = {}) {
      if (!Array.isArray(actions) || actions.length === 0) return [];
      this.isExecuting = true;
      const results = [];
      const userProfile = await this.loadUserProfile();

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        try {
          // Check for CAPTCHA action or CAPTCHA element in next actions
          if (action.fieldType === 'captcha' || action.isCaptcha) {
            const targetEl = action.selector ? document.querySelector(action.selector) : null;
            if (targetEl) {
              await this.highlightCaptchaElement(targetEl);
            }

            const remainingActions = actions.slice(i + 1);
            if (typeof options.onCaptchaPause === 'function' && remainingActions.length > 0) {
              this.isExecuting = false;
              options.onCaptchaPause({
                action,
                targetEl,
                actionIndex: i,
                remainingActions
              });
              results.push({
                success: true,
                action: 'fill',
                isCaptchaSkipped: true,
                paused: true,
                message: 'Auto-fill paused at CAPTCHA. Waiting for user to complete challenge.'
              });
              return results;
            }
          }

          const result = await this.executeSingleAction(action, userProfile);
          results.push(result);
          this.actionHistory.push({ timestamp: Date.now(), action, result });
          
          // Brief pause between actions for natural feel
          await new Promise(r => setTimeout(r, 200));
        } catch (err) {
          results.push({ success: false, error: err.message });
        }
      }

      this.isExecuting = false;
      return results;
    }
  }

  const actionExecutorInstance = new ActionExecutor();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ActionExecutor,
      actionExecutor: actionExecutorInstance
    };
  } else if (typeof window !== 'undefined') {
    window.ActionExecutor = ActionExecutor;
    window.actionExecutor = actionExecutorInstance;
  }
})();
